import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER || "rag_user",
    password: process.env.DATABASE_PASSWORD || "rag_password",
    database: process.env.DATABASE_NAME || "rag_sandbox",
  },
});
