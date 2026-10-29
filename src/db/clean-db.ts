import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import {
  inquiryProducts,
  inquiries,
  pricingMatrix,
  productImages,
  productMaterials,
  productThemes,
  productShapes,
  productCollections,
  products,
  subcategories,
  categories,
  productTypes,
  materials,
  themes,
  shapes,
  collections,
  media,
  adminProfile,
  settings,
} from "./schema";
import { eq } from "drizzle-orm";

async function cleanDatabase() {
  console.log("🧹 Cleaning operational database tables and setting image slots to empty...");

  // Delete child & junction tables first to respect foreign keys
  await db.delete(inquiryProducts);
  await db.delete(inquiries);
  await db.delete(pricingMatrix);
  await db.delete(productImages);
  await db.delete(productMaterials);
  await db.delete(productThemes);
  await db.delete(productShapes);
  await db.delete(productCollections);
  await db.delete(products);
  await db.delete(subcategories);
  await db.delete(categories);
  await db.delete(productTypes);
  await db.delete(materials);
  await db.delete(themes);
  await db.delete(shapes);
  await db.delete(collections);
  await db.delete(media);

  console.log("✅ Catalog, master data, inquiries, and media tables emptied.");

  // Ensure system protected Best Sellers and Featured collections exist
  const [bestSellersCollection] = await db.insert(collections).values({
    name: "Best Sellers",
    slug: "best-sellers",
    description: "System protected collection for homepage bestsellers",
  }).onConflictDoNothing().returning();

  const [featuredCollection] = await db.insert(collections).values({
    name: "Featured",
    slug: "featured",
    description: "System protected collection for homepage featured masterpieces",
  }).onConflictDoNothing().returning();
  console.log("✅ Protected system collections 'Best Sellers' and 'Featured' initialized.");

  // Seed / Upsert Admin Profile (without local avatar image path)
  const existingProfiles = await db.select().from(adminProfile).limit(1);
  if (existingProfiles.length > 0) {
    await db.update(adminProfile).set({
      name: "Aryan Trophy World Admin",
      businessName: "Aryan's Trophy World",
      email: "admin@aryantrophyworld.com",
      phone: "+91-9876543210",
      address: "Shop 12, Trophy Market, MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      avatarUrl: "",
      bio: "Premier trophy & award atelier in Mumbai specializing in custom corporate awards, sports cups, and precision laser engraving.",
      updatedAt: new Date(),
    }).where(eq(adminProfile.id, existingProfiles[0].id));
    console.log("✅ Admin profile initialized with empty avatarUrl.");
  } else {
    await db.insert(adminProfile).values({
      name: "Aryan Trophy World Admin",
      businessName: "Aryan's Trophy World",
      email: "admin@aryantrophyworld.com",
      phone: "+91-9876543210",
      address: "Shop 12, Trophy Market, MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      avatarUrl: "",
      bio: "Premier trophy & award atelier in Mumbai specializing in custom corporate awards, sports cups, and precision laser engraving.",
    });
    console.log("✅ Admin profile created with empty avatarUrl.");
  }

  // Seed / Upsert Core Site Settings (without any local disk image paths)
  const initialSettings = [
    // Brand Identity
    { key: "site_name", value: "Aryan's Trophy World", group: "branding" },
    { key: "site_logo", value: "", group: "branding" },
    { key: "contact_email", value: "concierge@aryantrophyworld.com", group: "contact" },
    { key: "contact_phone", value: "+91-9876543210", group: "contact" },
    { key: "contact_address", value: "Shop 12, Trophy Market, MG Road, Mumbai, Maharashtra 400001", group: "contact" },
    { key: "map_pin_url", value: "https://maps.app.goo.gl/XEeSqtBQRqy8ksLz5?g_st=aw", group: "contact" },
    
    // Social Links
    { key: "social_facebook", value: "https://facebook.com", group: "social" },
    { key: "social_instagram", value: "https://instagram.com", group: "social" },
    { key: "social_linkedin", value: "https://linkedin.com", group: "social" },
    { key: "social_whatsapp", value: "https://wa.me/919876543210", group: "social" },

    // Homepage Hero Section
    { key: "hero_banner_image", value: "", group: "homepage" },
    { key: "hero_headline", value: "Every trophy tells a story worth engraving.", group: "homepage" },
    { key: "hero_subtitle", value: "Complimentary custom engraving on every award. Handcrafted for tournaments, corporate honors, and champions.", group: "homepage" },

    // Homepage 6 Curated Ranges Cards
    { key: "curated_card_1_title", value: "Sports Awards", group: "homepage_curated" },
    { key: "curated_card_1_image", value: "", group: "homepage_curated" },
    { key: "curated_card_1_link", value: "/catalog?category=Sports", group: "homepage_curated" },

    { key: "curated_card_2_title", value: "Corporate Awards", group: "homepage_curated" },
    { key: "curated_card_2_image", value: "", group: "homepage_curated" },
    { key: "curated_card_2_link", value: "/catalog?category=Corporate", group: "homepage_curated" },

    { key: "curated_card_3_title", value: "Academic Honors", group: "homepage_curated" },
    { key: "curated_card_3_image", value: "", group: "homepage_curated" },
    { key: "curated_card_3_link", value: "/catalog?category=Academic", group: "homepage_curated" },

    { key: "curated_card_4_title", value: "Crystal Monuments", group: "homepage_curated" },
    { key: "curated_card_4_image", value: "", group: "homepage_curated" },
    { key: "curated_card_4_link", value: "/catalog?material=Crystal", group: "homepage_curated" },

    { key: "curated_card_5_title", value: "Victory Medals", group: "homepage_curated" },
    { key: "curated_card_5_image", value: "", group: "homepage_curated" },
    { key: "curated_card_5_link", value: "/catalog?type=Medal", group: "homepage_curated" },

    { key: "curated_card_6_title", value: "Bespoke Plaques", group: "homepage_curated" },
    { key: "curated_card_6_image", value: "", group: "homepage_curated" },
    { key: "curated_card_6_link", value: "/catalog?type=Plaque", group: "homepage_curated" },

    // About Us Page Story & Philosophy Section
    { key: "about_story_headline", value: "Our Craftsmanship & Heritage", group: "aboutpage" },
    { key: "about_story_text", value: "Aryan Trophy World stands at the forefront of monumental award engineering. Born out of a passion for celebrating human achievement, our atelier blends traditional metallurgy with state-of-the-art Italian diamond laser technology.", group: "aboutpage" },
    { key: "about_story_image", value: "", group: "aboutpage" },
    { key: "about_years_badge", value: "15+ Years", group: "aboutpage" },
    { key: "about_years_subtext", value: "Heritage of In-House Precision Manufacturing", group: "aboutpage" },

    // Inquiry Form Subjects
    { key: "inquiry_subjects", value: JSON.stringify(["Bespoke Trophy Commission", "Wholesale Catalog Order", "Laser Engraving & UV Printing", "General Workshop Inquiry"]), group: "inquiries" },

    // SEO Metadata
    { key: "seo_title", value: "Aryan Trophy World | Luxury Awards & Corporate Trophies", group: "seo" },
    { key: "seo_description", value: "Discover prestige custom trophies, crystal awards, corporate plaques, and championship cups in Mumbai.", group: "seo" },
    { key: "seo_keywords", value: "trophy maker mumbai, custom crystal trophies, corporate shields, wholesale awards, championship medals", group: "seo" },
  ];

  for (const s of initialSettings) {
    const [existing] = await db.select().from(settings).where(eq(settings.key, s.key));
    if (existing) {
      await db.update(settings).set({ value: s.value, group: s.group, updatedAt: new Date() }).where(eq(settings.id, existing.id));
    } else {
      await db.insert(settings).values(s);
    }
  }
  console.log("✅ Site settings initialized in DB with clean empty image slots.");
  console.log("🎉 Database clean complete!");
  process.exit(0);
}

cleanDatabase().catch((err) => {
  console.error("❌ Clean failed:", err);
  process.exit(1);
});
