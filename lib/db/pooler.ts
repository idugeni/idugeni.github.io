import { Pool } from "pg";

let pool: Pool | null = null;

function createPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    min: 0,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 10_000,
    query_timeout: 10_000,
    ssl: { rejectUnauthorized: false },
  });

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
  retries = 1
): Promise<T[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const p = getPool();
      const result = await p.query(query, params);
      return result.rows as T[];
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(
        `[pooler] Query failed (attempt ${attempt + 1}/${retries + 1}):`,
        lastError.message
      );
      // Invalidate pool on failure so next attempt gets a fresh one
      if (pool) {
        pool.end().catch(() => {});
        pool = null;
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
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
