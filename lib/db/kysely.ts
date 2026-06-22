import { Kysely, PostgresDialect } from "kysely";
import type { Database } from "./types";

let _db: Kysely<Database> | null = null;
let _dbInitialized = false;

function createDb(): Kysely<Database> | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  const { Pool } = require("pg");
  const pool = new Pool({
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

  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
  });
}

function getDb(): Kysely<Database> {
  if (!_dbInitialized) {
    _db = createDb();
    _dbInitialized = true;
  }
  if (!_db) {
    throw new Error("DATABASE_URL is not set. Direct database queries are unavailable.");
  }
  return _db;
}

function createEmptyProxy(): any {
  const noop = async () => [];
  const noopFirst = async () => null;
  const noopThrow = async () => { throw new Error("DATABASE_URL is not set"); };

  const handler: ProxyHandler<any> = {
    apply(_target, _thisArg, args) {
      return createEmptyProxy();
    },
    get(_target, prop, _receiver) {
      if (prop === "then") return undefined;
      if (prop === "execute") return noop;
      if (prop === "executeTakeFirst") return noopFirst;
      if (prop === "executeTakeFirstOrThrow") return noopThrow;
      if (prop === Symbol.toPrimitive) return () => "";
      if (typeof prop === "symbol") return undefined;
      return createEmptyProxy();
    },
  };
  return new Proxy(function() {}, handler);
}

/**
 * Lazy Kysely singleton.
 * Returns a real instance when DATABASE_URL is set.
 * Returns an empty-result proxy when DATABASE_URL is missing (build time).
 */
export const db: Kysely<Database> = new Proxy({} as Kysely<Database>, {
  get(_target, prop, _receiver) {
    if (prop === "then") return undefined;
    if (!process.env.DATABASE_URL) {
      return Reflect.get(createEmptyProxy(), prop);
    }
    return Reflect.get(getDb(), prop, _receiver);
  },
});
