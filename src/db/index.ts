import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";
import { getConfig } from "../config/index.js";

const { Pool } = pg;

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pool: pg.Pool | null = null;

export function getDb() {
  if (!db) {
    const config = getConfig();
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
    });
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}

export { schema };
