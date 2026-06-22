import { Pool } from "pg";

let pool: Pool | null = null;

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Pooler-based queries are unavailable without a direct database connection."
    );
  }

  const p = new Pool({
    connectionString,
    max: 10,
    min: 0,
    idleTimeoutMillis: 30_000,              // Match Supabase default (30s)
    connectionTimeoutMillis: 3_000,         // Faster fail for cold starts
    keepAlive: true,                         // Prevent premature disconnect
    keepAliveInitialDelayMillis: 10_000,    // Send keepalive probe after 10s
    allowExitOnIdle: true,                  // Serverless-friendly
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
    pool = null; // Force recreation on next access
  });

  return p;
}

export function getPool(): Pool {
  if (pool) {
    return pool;
  }
  pool = createPool();
  return pool;
}

export async function queryPooler<T = any>(
  query: string,
  params?: any[],
  retries = 2
): Promise<T[]> {
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

      // Only invalidate pool for connection errors
      if (isConnError && pool) {
        pool.end().catch(() => {});
        pool = null;
      }

      // Don't retry on last attempt
      if (attempt < maxAttempts - 1) {
        // Exponential backoff for connection errors, linear for query errors
        const delay = isConnError 
          ? 500 * Math.pow(2, attempt)  // 500ms, 1s, 2s...
          : 200 * (attempt + 1);         // 200ms, 400ms, 600ms...
        
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
  const rows = await queryPooler<T>(query, params);
  return rows[0] || null;
}

/**
 * Check if an error is a connection-related error (vs a query error)
 */
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

/**
 * Health check to validate pool connection before critical queries
 */
export async function checkPoolHealth(): Promise<boolean> {
  try {
    const p = getPool();
    const result = await p.query("SELECT 1");
    return result.rows.length > 0;
  } catch (err) {
    console.error("[pooler] Health check failed:", err);
    if (pool) {
      pool.end().catch(() => {});
      pool = null;
    }
    return false;
  }
}
