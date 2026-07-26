import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import {
  adminProfile,
  categories,
  subcategories,
  productTypes,
  materials,
  themes,
  shapes,
  collections,
  settings,
  products,
  productMaterials,
  productThemes,
  productShapes,
  productCollections,
  productImages,
  pricingMatrix,
  inquiries,
  inquiryProducts,
} from "./schema";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Admin Profile
  console.log("Creating Admin Profile...");
  await db.insert(adminProfile).values({
    name: "Admin",
    email: "info@aryantrophyworld.com",
    phone: "+91-9876543210",
    businessName: "Aryan Trophy World",
    address: "Shop 12, Trophy Market, MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    bio: "Leading manufacturer and supplier of customized trophies, medals, plaques, and corporate awards.",
  });

  // 2. Master Data - Categories & Subcategories
  console.log("Creating Categories & Subcategories...");
  const [sportsCat] = await db
    .insert(categories)
    .values({
      name: "Sports",
      slug: "sports",
      description: "Trophies and awards for all sports events and tournaments",
      displayOrder: 1,
    })
    .returning();

  const [academicCat] = await db
    .insert(categories)
    .values({
      name: "Academic",
      slug: "academic",
      description: "Medals, badges, and plaques for educational excellence",
      displayOrder: 2,
    })
    .returning();

  const [corporateCat] = await db
    .insert(categories)
    .values({
      name: "Corporate",
      slug: "corporate",
      description: "Premium corporate awards, plaques, and recognition trophies",
      displayOrder: 3,
    })
    .returning();

  // Subcategories
  const [cricketSub] = await db
    .insert(subcategories)
    .values([
      { categoryId: sportsCat.id, name: "Cricket", slug: "cricket", displayOrder: 1 },
      { categoryId: sportsCat.id, name: "Football", slug: "football", displayOrder: 2 },
      { categoryId: sportsCat.id, name: "Basketball", slug: "basketball", displayOrder: 3 },
      { categoryId: sportsCat.id, name: "Athletics", slug: "athletics", displayOrder: 4 },
    ])
    .returning();

  await db.insert(subcategories).values([
    { categoryId: academicCat.id, name: "Science", slug: "science", displayOrder: 1 },
    { categoryId: academicCat.id, name: "Arts", slug: "arts", displayOrder: 2 },
    { categoryId: academicCat.id, name: "Debate", slug: "debate", displayOrder: 3 },
  ]);

  const [leadershipSub] = await db
    .insert(subcategories)
    .values([
      { categoryId: corporateCat.id, name: "Achievement", slug: "achievement", displayOrder: 1 },
      { categoryId: corporateCat.id, name: "Service", slug: "service", displayOrder: 2 },
      { categoryId: corporateCat.id, name: "Leadership", slug: "leadership", displayOrder: 3 },
    ])
    .returning();

  // 3. Product Types
  console.log("Creating Product Types...");
  const typeMap = new Map();
  const typesInserted = await db
    .insert(productTypes)
    .values([
      { name: "Trophy", slug: "trophy", description: "Standalone trophy awards" },
      { name: "Medal", slug: "medal", description: "Hanging & neck ribbon medals" },
      { name: "Pin", slug: "pin", description: "Lapel pins & coat badges" },
      { name: "Badge", slug: "badge", description: "Chest badges & identity pins" },
      { name: "Plaque", slug: "plaque", description: "Desktop & wall mounting plaques" },
    ])
    .returning();
  typesInserted.forEach((t) => typeMap.set(t.slug, t.id));

  // 4. Materials
  console.log("Creating Materials...");
  const materialMap = new Map();
  const materialsInserted = await db
    .insert(materials)
    .values([
      { name: "Metal", slug: "metal", description: "Brass, copper & alloy metal construction" },
      { name: "Wooden", slug: "wooden", description: "Rosewood, mahogany & solid wood base" },
      { name: "Crystal", slug: "crystal", description: "K9 Optical clear crystal" },
      { name: "Acrylic", slug: "acrylic", description: "High-grade transparent acrylic" },
      { name: "Resin", slug: "resin", description: "Custom moulded 3D resin figurines" },
    ])
    .returning();
  materialsInserted.forEach((m) => materialMap.set(m.slug, m.id));

  // 5. Themes
  console.log("Creating Themes...");
  const themeMap = new Map();
  const themesInserted = await db
    .insert(themes)
    .values([
      { name: "Sports", slug: "sports", description: "Athletics & sports event designs" },
      { name: "Academic", slug: "academic", description: "Educational & school themes" },
      { name: "Corporate", slug: "corporate", description: "Business & corporate identity" },
      { name: "Religious", slug: "religious", description: "Spiritual & devotional awards" },
      { name: "General", slug: "general", description: "Universal recognition design" },
    ])
    .returning();
  themesInserted.forEach((th) => themeMap.set(th.slug, th.id));

  // 6. Shapes
  console.log("Creating Shapes...");
  const shapeMap = new Map();
  const shapesInserted = await db
    .insert(shapes)
    .values([
      { name: "Cup", slug: "cup", description: "Traditional cup shape" },
      { name: "Shield", slug: "shield", description: "Honor shield design" },
      { name: "Star", slug: "star", description: "Star cut design" },
      { name: "Figurine", slug: "figurine", description: "3D player or motif figurine" },
    ])
    .returning();
  shapesInserted.forEach((s) => shapeMap.set(s.slug, s.id));

  // 7. Collections
  console.log("Creating Collections...");
  const collectionMap = new Map();
  const collectionsInserted = await db
    .insert(collections)
    .values([
      { name: "Premium", slug: "premium", description: "Top-tier luxury awards" },
      { name: "Classic", slug: "classic", description: "Timeless traditional awards" },
      { name: "Budget", slug: "budget", description: "Economical bulk event awards" },
    ])
    .returning();
  collectionsInserted.forEach((c) => collectionMap.set(c.slug, c.id));

  // 8. Default Settings
  console.log("Creating Default Settings...");
  await db.insert(settings).values([
    {
      key: "site_info",
      group: "general",
      value: {
        site_name: "Aryan Trophy World",
        tagline: "Excellence in Recognition & Awards",
        logo_url: "",
        contact_email: "info@aryantrophyworld.com",
        contact_phone: "+91-9876543210",
        address: "Shop 12, Trophy Market, MG Road, Mumbai",
      },
    },
    {
      key: "seo_default",
      group: "seo",
      value: {
        seo_title: "Aryan Trophy World | Premium Trophies, Medals & Corporate Awards",
        seo_description: "Customized trophies, medals, crystal awards, and plaques for sports, academic, and corporate events.",
        seo_keywords: "trophies, medals, awards, corporate plaques, custom trophies india",
      },
    },
    {
      key: "social_links",
      group: "social",
      value: {
        facebook: "https://facebook.com/aryantrophyworld",
        instagram: "https://instagram.com/aryantrophyworld",
        whatsapp: "+919876543210",
      },
    },
  ]);

  // 9. Sample Products
  console.log("Creating Sample Products...");

  // Product 1: Grand Cricket Trophy
  const [product1] = await db
    .insert(products)
    .values({
      name: "Grand Cricket Championship Trophy",
      slug: "grand-cricket-championship-trophy",
      sku: "ATW-CR-001",
      shortDescription: "Stunning gold-finished metal cricket trophy with mahogany wood base",
      detailedDescription: "Designed for tournament winners. Made of premium high-grade metal with anti-tarnish coating. Features a 3D cricket batsman figurine mounted on a solid wooden base suitable for custom engraving.",
      categoryId: sportsCat.id,
      subcategoryId: cricketSub.id,
      typeId: typeMap.get("trophy"),
      sizeUnit: "cm",
      isFeatured: true,
      isActive: true,
      seoTitle: "Grand Cricket Championship Trophy | Aryan Trophy World",
      seoDescription: "Gold-plated metal cricket tournament winner trophy with wooden base.",
      seoKeywords: "cricket trophy, tournament award, gold trophy",
      customizationOptions: ["Custom Laser Engraving", "Logo Printing", "Ribbon Attachment"],
      specifications: { Material: "Brass & Mahogany Wood", Finish: "24k Gold Plated", Weight: "1.5 kg" },
    })
    .returning();

  // Product 1 Junctions
  await db.insert(productMaterials).values([
    { productId: product1.id, materialId: materialMap.get("metal") },
    { productId: product1.id, materialId: materialMap.get("wooden") },
  ]);
  await db.insert(productThemes).values([
    { productId: product1.id, themeId: themeMap.get("sports") },
  ]);
  await db.insert(productShapes).values([
    { productId: product1.id, shapeId: shapeMap.get("cup") },
    { productId: product1.id, shapeId: shapeMap.get("figurine") },
  ]);
  await db.insert(productCollections).values([
    { productId: product1.id, collectionId: collectionMap.get("premium") },
  ]);

  // Product 1 Images & Pricing Matrix
  await db.insert(productImages).values([
    {
      productId: product1.id,
      imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800",
      thumbnailUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=300",
      altText: "Grand Cricket Championship Trophy Front View",
      displayOrder: 1,
      isPrimary: true,
    },
    {
      productId: product1.id,
      imageUrl: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=800",
      thumbnailUrl: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=300",
      altText: "Grand Cricket Championship Trophy Detail View",
      displayOrder: 2,
      isPrimary: false,
    },
  ]);
  await db.insert(pricingMatrix).values([
    { productId: product1.id, sizeLabel: "Small", length: "12.00", width: "5.00", height: "5.00", weightKg: "0.800", quantity: 1, pricePerPiece: "1500.00" },
    { productId: product1.id, sizeLabel: "Medium", length: "18.00", width: "6.00", height: "6.00", weightKg: "1.200", quantity: 1, pricePerPiece: "2200.00" },
    { productId: product1.id, sizeLabel: "Large", length: "24.00", width: "8.00", height: "8.00", weightKg: "2.000", quantity: 1, pricePerPiece: "3500.00" },
  ]);

  // Product 2: Corporate Leadership Award
  const [product2] = await db
    .insert(products)
    .values({
      name: "Corporate Leadership Crystal Award",
      slug: "corporate-leadership-crystal-award",
      sku: "ATW-CORP-002",
      shortDescription: "Elegant optical crystal plaque with star facet for executive leadership recognition",
      detailedDescription: "Crafted from K9 optical crystal with bevel edge cut. Perfect for honoring outstanding corporate achievements, leadership excellence, and long service awards.",
      categoryId: corporateCat.id,
      subcategoryId: leadershipSub.id,
      typeId: typeMap.get("plaque"),
      sizeUnit: "inch",
      isFeatured: true,
      isActive: true,
      seoTitle: "Corporate Leadership Crystal Award | Aryan Trophy World",
      seoDescription: "Optical crystal executive plaque with star cut for corporate leadership recognition.",
      seoKeywords: "crystal award, corporate plaque, leadership trophy",
      customizationOptions: ["Sub-surface 3D Engraving", "Color UV Print"],
      specifications: { Material: "K9 Optical Crystal", Packaging: "Velvet Gift Box" },
    })
    .returning();

  // Product 2 Junctions
  await db.insert(productMaterials).values([
    { productId: product2.id, materialId: materialMap.get("crystal") },
  ]);
  await db.insert(productThemes).values([
    { productId: product2.id, themeId: themeMap.get("corporate") },
  ]);
  await db.insert(productShapes).values([
    { productId: product2.id, shapeId: shapeMap.get("star") },
    { productId: product2.id, shapeId: shapeMap.get("shield") },
  ]);
  await db.insert(productCollections).values([
    { productId: product2.id, collectionId: collectionMap.get("premium") },
    { productId: product2.id, collectionId: collectionMap.get("classic") },
  ]);

  // Product 2 Images & Pricing Matrix
  await db.insert(productImages).values([
    {
      productId: product2.id,
      imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
      thumbnailUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300",
      altText: "Corporate Leadership Crystal Award",
      displayOrder: 1,
      isPrimary: true,
    },
  ]);
  await db.insert(pricingMatrix).values([
    { productId: product2.id, sizeLabel: "Standard", length: "8.00", width: "6.00", height: "2.00", weightKg: "1.500", quantity: 1, pricePerPiece: "4200.00" },
    { productId: product2.id, sizeLabel: "Large", length: "10.00", width: "8.00", height: "2.50", weightKg: "2.200", quantity: 1, pricePerPiece: "5800.00" },
  ]);

  // 10. Sample Inquiry
  console.log("Creating Sample Inquiry...");
  const [sampleInquiry] = await db
    .insert(inquiries)
    .values({
      name: "Rajesh Kumar",
      company: "Reliance Sports Club",
      email: "rajesh.kumar@example.com",
      phone: "+91-9988776655",
      city: "Mumbai",
      message: "We need 5 units of Grand Cricket Trophy (Large size) and 2 units of Corporate Leadership Crystal Award for our annual sports day ceremony.",
      status: "new",
      adminNotes: "Customer requested urgent dispatch by Friday.",
    })
    .returning();

  await db.insert(inquiryProducts).values([
    { inquiryId: sampleInquiry.id, productId: product1.id, quantity: 5 },
    { inquiryId: sampleInquiry.id, productId: product2.id, quantity: 2 },
  ]);

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
