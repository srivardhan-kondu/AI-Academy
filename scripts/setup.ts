/**
 * Applies migrations to the Neon database and seeds content.
 *
 *   npm run setup             # migrate, then seed only if the database has no content
 *   npm run setup -- --reset  # DROP all tables and data, then migrate and seed from scratch
 */
import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { count, sql } from "drizzle-orm";

async function main() {
  const reset = process.argv.includes("--reset");
  const { db, pool } = await import("../lib/db");
  const schema = await import("../lib/db/schema");

  if (reset) {
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    console.log("• Reset: dropped all tables");
  }

  await migrate(db, { migrationsFolder: path.resolve("drizzle") });
  console.log("• Migrations applied");

  const existing = (await db.select({ n: count() }).from(schema.schools))[0]?.n ?? 0;
  if (existing > 0) {
    console.log("• Content already present — skipping seed (use --reset to start over)");
  } else {
    const { seed } = await import("./seed");
    await seed(db);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
