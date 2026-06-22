import { Kysely, PostgresDialect } from "kysely";
import { getPool } from "./pooler";
import type { Database } from "./types";

/**
 * Kysely Database Instance
 *
 * Shares the same connection pool as pooler.ts to avoid
 * doubling database connections in serverless environments.
 */

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: getPool(),
  }),
});
