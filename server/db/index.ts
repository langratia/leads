import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  (process.env.SUPABASE_URL
    ? `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD || "postgres"}@${
        new URL(process.env.SUPABASE_URL).hostname
      }:5432/postgres`
    : "");

let sqlClient: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const url = process.env.DATABASE_URL || connectionString;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Please provide a PostgreSQL connection string in .env (e.g. from Neon, Supabase, or Railway)."
    );
  }

  sqlClient = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : "require",
  });

  dbInstance = drizzle(sqlClient, { schema });
  return dbInstance;
}

export { schema };
export type Database = ReturnType<typeof getDb>;
