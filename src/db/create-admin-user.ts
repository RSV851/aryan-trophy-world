import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

async function createAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const email = "info@aryantrophyworld.com";
  const password = "AdminPassword123!";

  console.log(`Checking Supabase Auth user list for ${email}...`);
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Failed to list users:", listError.message);
    process.exit(1);
  }

  const existingUser = usersData?.users?.find((u) => u.email === email);

  if (existingUser) {
    console.log(`User ${email} exists (ID: ${existingUser.id}). Updating password to ${password}...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
    });

    if (updateError) {
      console.error("❌ Failed to update user password:", updateError.message);
    } else {
      console.log(`✅ Admin user password successfully updated to: ${password}`);
    }
  } else {
    console.log(`User ${email} does not exist. Creating user...`);
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin", name: "Admin" },
    });

    if (createError) {
      console.error("❌ Failed to create admin user:", createError.message);
    } else {
      console.log(`✅ Admin user created successfully (ID: ${createData.user.id})`);
    }
  }
}

createAdmin().catch(console.error);
