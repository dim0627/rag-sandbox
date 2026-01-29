import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

async function main() {
  const pool = new Pool({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER || "rag_user",
    password: process.env.DATABASE_PASSWORD || "rag_password",
    database: process.env.DATABASE_NAME || "rag_sandbox",
  });

  const db = drizzle(pool);

  console.log("Enabling pgvector extension...");
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("Migrations completed successfully!");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
