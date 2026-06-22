import { Kysely, PostgresDialect } from "kysely";
import { getPool } from "./pooler";
import type { Database } from "./types";

let _db: Kysely<Database> | null = null;

function createDb(): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: getPool(),
    }),
  });
}

/**
 * Kysely Database Instance — lazy singleton.
 * Shares the same connection pool as pooler.ts.
 * Only created on first use, so missing DATABASE_URL won't crash at import time.
 */
export function getDb(): Kysely<Database> {
  if (!_db) _db = createDb();
  return _db;
}

export const db = new Proxy({} as Kysely<Database>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
