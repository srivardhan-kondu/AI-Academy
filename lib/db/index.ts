import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export type DB = NodePgDatabase<typeof schema>;

/** Normalise the URL: pg treats sslmode=require as verify-full; say so explicitly. */
function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local.");
  return url.replace("sslmode=require", "sslmode=verify-full");
}

const globalForDb = globalThis as unknown as { __pool?: Pool; __db?: DB };

function createPool() {
  // Optional isolated schema (used by the test suite). Applied as a startup parameter so
  // every connection uses it from its very first query. Requires a direct (non-pooled) URL.
  const schemaName = process.env.DATABASE_SCHEMA;
  if (schemaName && !/^[a-z_][a-z0-9_]*$/.test(schemaName)) throw new Error("Invalid DATABASE_SCHEMA");
  return new Pool({
    connectionString: connectionString(),
    max: 10,
    idleTimeoutMillis: 30_000,
    ...(schemaName ? { options: `-c search_path=${schemaName}` } : {}),
  });
}

const pool = globalForDb.__pool ?? (globalForDb.__pool = createPool());

/** Shared Drizzle client on a Neon connection pool (survives hot reloads in development). */
export const db: DB = globalForDb.__db ?? (globalForDb.__db = drizzle(pool, { schema }));
export { schema, pool };
