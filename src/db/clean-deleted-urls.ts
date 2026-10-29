import { db } from './index';
import { settings } from './schema/settings';
import { adminProfile } from './schema/admin-profile';
import { eq, inArray } from 'drizzle-orm';

async function main() {
  console.log('Resetting deleted image URLs in DB to empty string...');

  // Reset image keys in settings to empty string
  const imageKeys = ['site_logo', 'hero_banner_image', 'about_story_image', 'curated_card_1_image', 'curated_card_2_image'];
  
  for (const key of imageKeys) {
    await db.update(settings)
      .set({ value: '', updatedAt: new Date() })
      .where(eq(settings.key, key));
    console.log(`✓ Reset settings key "${key}" to ""`);
  }

  // Reset admin profile avatar_url to empty string
  await db.update(adminProfile).set({
    avatarUrl: '',
    updatedAt: new Date()
  });
  console.log('✓ Reset admin_profile avatar_url to ""');

  console.log('🎉 DB Cleanup Complete! Default icons will now render cleanly.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
