-- ==============================================================================
-- 🛡️ ARYAN TROPHY WORLD — GLOBAL POSTGRESQL VAULT GUARD MIGRATION
-- Full Database, Table Editor GUI, Storage GUI & CLI Deletion Protection
-- ==============================================================================

-- 1. Create System Vault Status Control Table
CREATE TABLE IF NOT EXISTS public._vault_guard_status (
  id integer PRIMARY KEY DEFAULT 1,
  is_unlocked boolean NOT NULL DEFAULT false,
  unlocked_until timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Initialize single row if missing
INSERT INTO public._vault_guard_status (id, is_unlocked)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- 2. Trigger Function checking both Session Key & Global Vault Status
CREATE OR REPLACE FUNCTION verify_delete_vault_password()
RETURNS TRIGGER AS $$
DECLARE
  current_secret text;
  master_secret text := 'ATW_MASTER_VAULT_2026_PROD_SECRET_KEY_9941';
  vault_unlocked boolean := false;
  vault_expiry timestamp with time zone;
BEGIN
  -- Check 1: Session secret set by CMS API connection
  current_secret := current_setting('app.delete_vault_secret', true);
  IF current_secret IS NOT NULL AND current_secret = master_secret THEN
    RETURN OLD;
  END IF;

  -- Check 2: Global Vault Control status (for Table Editor GUI & Storage GUI)
  SELECT is_unlocked, unlocked_until INTO vault_unlocked, vault_expiry
  FROM public._vault_guard_status WHERE id = 1;

  IF vault_unlocked IS TRUE AND (vault_expiry IS NULL OR vault_expiry > now()) THEN
    RETURN OLD;
  END IF;

  -- Block deletion if neither session key nor global vault is unlocked
  RAISE EXCEPTION '🔴 SECURITY ALERT: Direct Database / Storage Deletion Blocked! Vault is locked. Run SELECT unlock_vault(''your_password''); in SQL Editor to unlock Table Editor & Storage GUI.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Superuser GUI Unlock Function (Unlocks Table Editor GUI + Storage GUI + CLI)
CREATE OR REPLACE FUNCTION unlock_vault(entered_password text)
RETURNS text AS $$
DECLARE
  master_secret text := 'ATW_MASTER_VAULT_2026_PROD_SECRET_KEY_9941';
BEGIN
  IF entered_password = master_secret THEN
    UPDATE public._vault_guard_status
    SET is_unlocked = true,
        unlocked_until = now() + interval '15 minutes',
        updated_at = now()
    WHERE id = 1;

    RETURN '✅ GLOBAL VAULT UNLOCKED: Deletion access granted for Table Editor GUI, Storage GUI, and CLI for 15 minutes! Run SELECT lock_vault(); to lock anytime.';
  ELSE
    RAISE EXCEPTION '❌ ACCESS DENIED: Incorrect Vault Master Password!';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Superuser Lock Function (Instantly locks Table Editor GUI + Storage GUI + CLI)
CREATE OR REPLACE FUNCTION lock_vault()
RETURNS text AS $$
BEGIN
  UPDATE public._vault_guard_status
  SET is_unlocked = false,
      unlocked_until = now(),
      updated_at = now()
  WHERE id = 1;

  RETURN '🔒 GLOBAL VAULT LOCKED: Deletion access revoked for all Table Editor GUI rows, Storage GUI files, and CLI.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach BEFORE DELETE Vault Triggers to All 20 Public Tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'categories',
    'subcategories',
    'product_types',
    'materials',
    'themes',
    'shapes',
    'collections',
    'products',
    'product_materials',
    'product_themes',
    'product_shapes',
    'product_collections',
    'product_images',
    'pricing_matrix',
    'media',
    'inquiries',
    'inquiry_products',
    'settings',
    'admin_profile'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_vault_guard_delete ON %I;', t);
    EXECUTE format('CREATE TRIGGER trg_vault_guard_delete BEFORE DELETE ON %I FOR EACH ROW EXECUTE FUNCTION verify_delete_vault_password();', t);
  END LOOP;
END;
$$;

-- 6. Attach BEFORE DELETE Vault Trigger to Supabase Storage Objects Table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    DROP TRIGGER IF EXISTS trg_vault_guard_storage_delete ON storage.objects;
    CREATE TRIGGER trg_vault_guard_storage_delete
    BEFORE DELETE ON storage.objects
    FOR EACH ROW EXECUTE FUNCTION verify_delete_vault_password();
  END IF;
END;
$$;
