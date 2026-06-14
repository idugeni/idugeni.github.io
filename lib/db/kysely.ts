import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types";

/**
 * Kysely Database Instance
 *
 * Provides type-safe query building for PostgreSQL operations.
 * Reuses existing connection pool configuration from pooler.ts.
 *
 * @example
 * ```typescript
 * import { db } from "@/lib/db/kysely";
 *
 * // Type-safe query
 * const articles = await db
 *   .selectFrom("blog_artikel")
 *   .where("status", "=", "published")
 *   .orderBy("created_at", "desc")
 *   .limit(10)
 *   .execute();
 * ```
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  min: 0,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("[kysely] Unexpected pool error:", err);
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

/**
 * Gracefully close the database connection pool
 */
export async function closeDb(): Promise<void> {
  await db.destroy();
}

/**
 * Get the underlying PostgreSQL pool for advanced operations
 */
export function getPool(): Pool {
  return pool;
}
