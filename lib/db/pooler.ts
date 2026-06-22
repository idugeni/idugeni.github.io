import { Pool } from "pg";

let pool: Pool | null = null;
let poolCreationAttempted = false;

function createPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  const p = new Pool({
    connectionString,
    max: 10,
    min: 0,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 3_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    allowExitOnIdle: true,
    statement_timeout: 10_000,
    query_timeout: 10_000,
    ssl: { rejectUnauthorized: false },
  });

  if (process.env.NODE_ENV !== "production") {
    p.on("connect", () => {
      console.log("[pooler] New connection established");
    });
    p.on("remove", () => {
      console.log("[pooler] Connection removed from pool");
    });
  }

  p.on("error", (err: Error) => {
    console.error("[pooler] Unexpected idle client error:", err.message);
    pool = null;
    poolCreationAttempted = false;
  });

  return p;
}

export function getPool(): Pool {
  if (pool) {
    return pool;
  }
  poolCreationAttempted = true;
  pool = createPool();
  if (!pool) {
    throw new Error(
      "DATABASE_URL is not set. Direct database queries are unavailable."
    );
  }
  return pool;
}

export async function queryPooler<T = any>(
  query: string,
  params?: any[],
  retries = 2
): Promise<T[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  let lastError: Error | null = null;
  const maxAttempts = retries + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const p = getPool();
      const result = await p.query(query, params);
      return result.rows as T[];
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      const isConnError = isConnectionError(lastError);
      const errorType = isConnError ? "connection" : "query";

      console.error(
        `[pooler] Query failed (attempt ${attempt + 1}/${maxAttempts}): ${lastError.message} [${errorType} error]`
      );

      if (isConnError && pool) {
        pool.end().catch(() => {});
        pool = null;
        poolCreationAttempted = false;
      }

      if (attempt < maxAttempts - 1) {
        const delay = isConnError
          ? 500 * Math.pow(2, attempt)
          : 200 * (attempt + 1);

        console.log(`[pooler] Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new Error("Query failed after retries");
}

export async function queryPoolerSingle<T = any>(
  query: string,
  params?: any[]
): Promise<T | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const rows = await queryPooler<T>(query, params);
  return rows[0] || null;
}

function isConnectionError(err: Error): boolean {
  const message = err.message.toLowerCase();
  return (
    message.includes("connection") ||
    message.includes("closed") ||
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("enetunreach") ||
    message.includes("epipe") ||
    message.includes("socket") ||
    message.includes("terminated")
  );
}

export async function checkPoolHealth(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    return false;
  }
  try {
    const p = getPool();
    const result = await p.query("SELECT 1");
    return result.rows.length > 0;
  } catch (err) {
    console.error("[pooler] Health check failed:", err);
    if (pool) {
      pool.end().catch(() => {});
      pool = null;
      poolCreationAttempted = false;
    }
    return false;
  }
}
