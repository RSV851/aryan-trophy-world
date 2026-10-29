import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing in .env.local");
  process.exit(1);
}

async function removeVaultGuard() {
  console.log("🗑️ Removing PostgreSQL Vault Guard Triggers & Functions from Supabase...");
  const sqlClient = postgres(connectionString!, { prepare: false, max: 1 });

  const cleanupSql = `
    DO $$
    DECLARE
      t text;
      tables text[] := ARRAY[
        'categories', 'subcategories', 'product_types', 'materials', 'themes',
        'shapes', 'collections', 'products', 'product_materials', 'product_themes',
        'product_shapes', 'product_collections', 'product_images', 'pricing_matrix',
        'media', 'inquiries', 'inquiry_products', 'settings', 'admin_profile'
      ];
    BEGIN
      FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_vault_guard_delete ON %I;', t);
      END LOOP;
    END;
    $$;

    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        DROP TRIGGER IF EXISTS trg_vault_guard_storage_delete ON storage.objects;
      END IF;
    END;
    $$;

    DROP FUNCTION IF EXISTS verify_delete_vault_password() CASCADE;
    DROP FUNCTION IF EXISTS unlock_vault(text) CASCADE;
    DROP FUNCTION IF EXISTS lock_vault() CASCADE;
    DROP TABLE IF EXISTS public._vault_guard_status CASCADE;
  `;

  try {
    await sqlClient.unsafe(cleanupSql);
    console.log("✅ PostgreSQL Vault Guard completely removed from database!");
  } catch (error) {
    console.error("❌ Failed to remove Vault Guard:", error);
  } finally {
    await sqlClient.end();
  }
}

removeVaultGuard();
