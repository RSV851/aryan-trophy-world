import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from environment variables");
}

// Global singleton caching to prevent connection leaks during Next.js dev HMR reloads
const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForDb.conn ??
  postgres(connectionString, { prepare: false, max: 10, idle_timeout: 20, connect_timeout: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.conn = client;

export const db = drizzle(client, { schema });
export default db;
