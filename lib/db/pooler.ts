import { Pool } from "pg";

// Singleton pool instance
let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1, // Optimized for serverless environments (each function instance runs sequentially)
      idleTimeoutMillis: 15000, // Close idle clients after 15 seconds to free up connections quickly
      connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
      ssl: { rejectUnauthorized: false }
    });

    // Handle pool errors
    pool.on("error", (err: Error) => {
      console.error("Unexpected error on idle client", err);
    });
  }
  return pool;
}

export async function queryPooler<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(query, params);
  return result.rows as T[];
}

export async function queryPoolerSingle<T = any>(
  query: string,
  params?: any[]
): Promise<T | null> {
  const rows = await queryPooler<T>(query, params);
  return rows[0] || null;
}
