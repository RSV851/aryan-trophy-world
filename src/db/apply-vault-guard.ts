import { config } from "dotenv";
import postgres from "postgres";
import fs from "fs";
import path from "path";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing in .env.local");
  process.exit(1);
}

async function applyVaultGuard() {
  console.log("🛡️ Deploying PostgreSQL Vault Guard Migration to Supabase...");
  const sqlClient = postgres(connectionString!, { prepare: false, max: 1 });

  try {
    const sqlPath = path.join(process.cwd(), "src", "db", "migrations", "0001_postgresql_vault_guard.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    await sqlClient.unsafe(sqlContent);
    console.log("✅ PostgreSQL Vault Guard successfully applied to all DB tables and Storage objects!");
  } catch (error) {
    console.error("❌ Failed to apply Vault Guard migration:", error);
  } finally {
    await sqlClient.end();
  }
}

applyVaultGuard();
