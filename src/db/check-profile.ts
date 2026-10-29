import { db } from './index';
import { adminProfile } from './schema/admin-profile';

async function main() {
  const [profile] = await db.select().from(adminProfile).limit(1);
  console.log('Current admin_profile row in database:');
  console.log(profile);
  process.exit(0);
}

main().catch(console.error);
