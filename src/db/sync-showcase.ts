import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import {
  categories,
  subcategories,
  productTypes,
  materials,
  themes,
  shapes,
  collections,
  products,
  productMaterials,
  productThemes,
  productShapes,
  productCollections,
  productImages,
  pricingMatrix,
} from "./schema";
import { eq } from "drizzle-orm";

async function runSync() {
  console.log("🚀 Starting synchronization of Master Data and showroom products into Supabase DB...");

  // 1. Categories
  const catDefs = [
    { name: "Sports", slug: "sports", description: "Championship trophies, athletic medals, and tournament cups", displayOrder: 1 },
    { name: "Academic", slug: "academic", description: "Scholastic medals, honor pins, and collegiate debate plaques", displayOrder: 2 },
    { name: "Corporate", slug: "corporate", description: "Executive crystal monuments, leadership plaques, and boardroom milestones", displayOrder: 3 },
    { name: "Religious", slug: "religious", description: "Devotional honors, temple commemorative plaques, and spiritual heritage trophies", displayOrder: 4 },
  ];
  const catMap = new Map<string, string>();
  for (const c of catDefs) {
    const [existing] = await db.select().from(categories).where(eq(categories.slug, c.slug));
    if (existing) {
      const [updated] = await db.update(categories).set({ name: c.name, description: c.description, displayOrder: c.displayOrder, isActive: true }).where(eq(categories.id, existing.id)).returning();
      catMap.set(c.slug, updated.id);
    } else {
      const [inserted] = await db.insert(categories).values(c).returning();
      catMap.set(c.slug, inserted.id);
      console.log(`Created Category: ${c.name}`);
    }
  }

  // 2. Subcategories (Matching exact public UI names)
  const subDefs = [
    // Sports
    { catSlug: "sports", name: "Cricket", slug: "cricket", displayOrder: 1 },
    { catSlug: "sports", name: "Football", slug: "football", displayOrder: 2 },
    { catSlug: "sports", name: "Athletics", slug: "athletics", displayOrder: 3 },
    { catSlug: "sports", name: "Tennis", slug: "tennis", displayOrder: 4 },
    { catSlug: "sports", name: "Badminton", slug: "badminton", displayOrder: 5 },
    { catSlug: "sports", name: "Basketball", slug: "basketball", displayOrder: 6 },
    // Academic
    { catSlug: "academic", name: "Leadership", slug: "academic-leadership", displayOrder: 1 },
    { catSlug: "academic", name: "Debate", slug: "debate", displayOrder: 2 },
    { catSlug: "academic", name: "Graduation", slug: "graduation", displayOrder: 3 },
    { catSlug: "academic", name: "Science & Math", slug: "science-math", displayOrder: 4 },
    { catSlug: "academic", name: "Arts", slug: "arts", displayOrder: 5 },
    // Corporate
    { catSlug: "corporate", name: "Excellence & Merit", slug: "excellence-merit", displayOrder: 1 },
    { catSlug: "corporate", name: "Milestone", slug: "milestone", displayOrder: 2 },
    { catSlug: "corporate", name: "Executive Board", slug: "executive-board", displayOrder: 3 },
    { catSlug: "corporate", name: "Global Leadership", slug: "global-leadership", displayOrder: 4 },
    { catSlug: "corporate", name: "Crystal Division", slug: "crystal-division", displayOrder: 5 },
    { catSlug: "corporate", name: "Service", slug: "service", displayOrder: 6 },
    { catSlug: "corporate", name: "Achievement", slug: "corporate-achievement", displayOrder: 7 },
    // Religious
    { catSlug: "religious", name: "Spiritual Heritage", slug: "spiritual-heritage", displayOrder: 1 },
    { catSlug: "religious", name: "Festival Honor", slug: "festival-honor", displayOrder: 2 },
    { catSlug: "religious", name: "Commemorative", slug: "commemorative", displayOrder: 3 },
  ];
  const subcatMap = new Map<string, string>();
  for (const sub of subDefs) {
    const [existing] = await db.select().from(subcategories).where(eq(subcategories.slug, sub.slug));
    const catId = catMap.get(sub.catSlug);
    if (existing) {
      const [updated] = await db.update(subcategories).set({ name: sub.name, categoryId: catId, displayOrder: sub.displayOrder, isActive: true }).where(eq(subcategories.id, existing.id)).returning();
      subcatMap.set(sub.slug, updated.id);
    } else if (catId) {
      const [inserted] = await db.insert(subcategories).values({
        categoryId: catId,
        name: sub.name,
        slug: sub.slug,
        displayOrder: sub.displayOrder,
      }).returning();
      subcatMap.set(sub.slug, inserted.id);
      console.log(`Created Subcategory: ${sub.name}`);
    }
  }

  // 3. Product Types
  const typeDefs = [
    { name: "Trophy", slug: "trophy", description: "Standalone monumental trophies and championship cups" },
    { name: "Medal", slug: "medal", description: "Die-cast hanging tournament and academic medals with ribbon" },
    { name: "Pin", slug: "pin", description: "Lapel pins, star emblem insignia, and jacket identity honors" },
    { name: "Badge", slug: "badge", description: "Chest crest badges and tournament identity emblems" },
    { name: "Plaque", slug: "plaque", description: "Desktop acrylic shields and wooden wall mounting honor plaques" },
  ];
  const typeMap = new Map<string, string>();
  for (const t of typeDefs) {
    const [existing] = await db.select().from(productTypes).where(eq(productTypes.slug, t.slug));
    if (existing) {
      const [updated] = await db.update(productTypes).set({ name: t.name, description: t.description }).where(eq(productTypes.id, existing.id)).returning();
      typeMap.set(t.slug, updated.id);
    } else {
      const [inserted] = await db.insert(productTypes).values(t).returning();
      typeMap.set(t.slug, inserted.id);
      console.log(`Created Type: ${t.name}`);
    }
  }

  // 4. Materials
  const matDefs = [
    { name: "Metal", slug: "metal", description: "Polished zinc alloy and aluminum cast metal" },
    { name: "Wooden", slug: "wooden", description: "Seasoned solid natural wood and teak bases" },
    { name: "Crystal", slug: "crystal", description: "Clear K9 precision optical crystal" },
    { name: "Acrylic", slug: "acrylic", description: "High-clarity impact resistant cast acrylic" },
    { name: "Resin", slug: "resin", description: "High-density custom sculptured action figurine resin" },
    { name: "Optical Crystal", slug: "optical-crystal", description: "Flawless ultra-pure diamond chamfered optical crystal" },
    { name: "Solid Brass", slug: "solid-brass", description: "Heavyweight electroplated solid brushed brass" },
    { name: "Rosewood", slug: "rosewood", description: "Kiln-dried stained natural grain rosewood" },
    { name: "Zinc Alloy", slug: "zinc-alloy", description: "Die-struck heavy relief zinc alloy" },
    { name: "Beveled Glass", slug: "beveled-glass", description: "Tempered floating architectural glass panel" },
  ];
  const matMap = new Map<string, string>();
  for (const m of matDefs) {
    const [existing] = await db.select().from(materials).where(eq(materials.slug, m.slug));
    if (existing) {
      const [updated] = await db.update(materials).set({ name: m.name, description: m.description }).where(eq(materials.id, existing.id)).returning();
      matMap.set(m.slug, updated.id);
    } else {
      const [inserted] = await db.insert(materials).values(m).returning();
      matMap.set(m.slug, inserted.id);
    }
  }

  // 5. Themes
  const themeDefs = [
    { name: "Sports", slug: "sports", description: "Athletic tournaments, league cups, and sports excellence" },
    { name: "Academic", slug: "academic", description: "Scholastic distinction, university honor, and academic supremacy" },
    { name: "Corporate", slug: "corporate", description: "Executive leadership, corporate identity, and summit milestones" },
    { name: "Religious", slug: "religious", description: "Devotional honors, spiritual heritage, and festival celebrations" },
    { name: "Achievement", slug: "achievement", description: "Pinnacle lifetime milestone accomplishment" },
    { name: "Victory", slug: "victory", description: "Triumphant championship victories and tournament honors" },
    { name: "Excellence", slug: "excellence", description: "Uncompromising standards of quality and merit" },
    { name: "Leadership", slug: "leadership", description: "Visionary boardroom and civic leadership recognition" },
    { name: "Championship", slug: "championship", description: "Premier grand slam and tournament championship awards" },
  ];
  const themeMap = new Map<string, string>();
  for (const th of themeDefs) {
    const [existing] = await db.select().from(themes).where(eq(themes.slug, th.slug));
    if (existing) {
      const [updated] = await db.update(themes).set({ name: th.name, description: th.description }).where(eq(themes.id, existing.id)).returning();
      themeMap.set(th.slug, updated.id);
    } else {
      const [inserted] = await db.insert(themes).values(th).returning();
      themeMap.set(th.slug, inserted.id);
    }
  }

  // 6. Shapes
  const shapeDefs = [
    { name: "Cup", slug: "cup", description: "Classic symmetrical championship handle cup" },
    { name: "Shield", slug: "shield", description: "Traditional heraldic defense honor shield" },
    { name: "Star", slug: "star", description: "Elevated multi-pointed star silhouette" },
    { name: "Figurine", slug: "figurine", description: "3D dynamic sportsman or symbolic motif sculpture" },
    { name: "Obelisk", slug: "obelisk", description: "Tapered architectural monumental tower column" },
    { name: "Circle", slug: "circle", description: "Perfectly round medallion and badge medallion circle" },
    { name: "Rectangle", slug: "rectangle", description: "Sleek geometric contemporary rectangular panel" },
    { name: "Tower", slug: "tower", description: "Soaring vertical crystal and metal summit column" },
  ];
  const shapeMap = new Map<string, string>();
  for (const sh of shapeDefs) {
    const [existing] = await db.select().from(shapes).where(eq(shapes.slug, sh.slug));
    if (existing) {
      const [updated] = await db.update(shapes).set({ name: sh.name, description: sh.description }).where(eq(shapes.id, existing.id)).returning();
      shapeMap.set(sh.slug, updated.id);
    } else {
      const [inserted] = await db.insert(shapes).values(sh).returning();
      shapeMap.set(sh.slug, inserted.id);
    }
  }

  // 7. Collections (Strictly Best Sellers as requested, plus standard tags if needed for legacy filters)
  const colDefs = [
    { name: "Best Sellers", slug: "best-sellers", description: "Our most celebrated and best-selling trophy designs across all categories" },
    { name: "Premium", slug: "premium", description: "Top-tier luxury executive collection" },
    { name: "Classic", slug: "classic", description: "Timeless traditional designs" },
  ];
  const colMap = new Map<string, string>();
  for (const c of colDefs) {
    const [existing] = await db.select().from(collections).where(eq(collections.slug, c.slug));
    if (existing) {
      const [updated] = await db.update(collections).set({ name: c.name, description: c.description }).where(eq(collections.id, existing.id)).returning();
      colMap.set(c.slug, updated.id);
    } else {
      const [inserted] = await db.insert(collections).values(c).returning();
      colMap.set(c.slug, inserted.id);
      console.log(`Created Collection: ${c.name}`);
    }
  }

  // 8. Complete Master Catalog Roster (24 SKUs covering every Category and Subcategory)
  const productsToSync = [
    // --- SPORTS (6 Subcategories) ---
    {
      sku: "TR-CRY-GOLD",
      name: "Grand Cricket Gold Cup",
      slug: "grand-cricket-gold-cup",
      cat: "sports", subcat: "cricket", type: "trophy",
      mat: ["metal", "wooden", "solid-brass"], theme: ["sports", "championship", "victory"], shape: ["cup"], col: ["best-sellers", "premium"],
      sizeUnit: "cm", dimL: "22.00", dimB: "18.00", dimH: "45.00", weight: "2.500",
      price: "14500.00", image: "/images/trophies/gold-cup.jpg",
      shortDescription: "Heavyweight Premier League cricket gold cup with dual ornate handles mounted on seasoned mahogany.",
      detailedDescription: "Our flagship championship sports trophy cup. Built from heavyweight metals with 24k electroplated luster finish and ornate handles. Mounted on kiln-seasoned mahogany designed for tournament winner laser inscriptions.",
    },
    {
      sku: "AT-FTB02",
      name: "Golden Foot Striker Trophy",
      slug: "golden-foot-striker-trophy",
      cat: "sports", subcat: "football", type: "trophy",
      mat: ["resin", "solid-brass"], theme: ["sports", "victory"], shape: ["figurine"], col: ["best-sellers", "classic"],
      sizeUnit: "cm", dimL: "16.00", dimB: "14.00", dimH: "32.00", weight: "1.600",
      price: "9499.00", image: "/images/trophies/golden-foot.jpg",
      shortDescription: "Dynamic football soccer striker sculpture capturing high-velocity ball strike with metallic amber finish.",
      detailedDescription: "High-density custom sculptured resin striker action figurine with electroplated gold luster. Mounted on a weighted solid brass plinth engineered for lifetime championship engraving.",
    },
    {
      sku: "AT-SHD04",
      name: "Radiant Victory Athletics Shield",
      slug: "radiant-victory-athletics-shield",
      cat: "sports", subcat: "athletics", type: "plaque",
      mat: ["wooden", "solid-brass", "metal"], theme: ["sports", "victory"], shape: ["shield"], col: ["best-sellers", "classic"],
      sizeUnit: "cm", dimL: "20.00", dimB: "4.00", dimH: "25.00", weight: "1.800",
      price: "14299.00", image: "/images/trophies/victory-shield.jpg",
      shortDescription: "Traditional athletic championship honor shield mounted on seasoned teak featuring embossed laurel wreath trim.",
      detailedDescription: "A timeless heritage sports honor shield crafted from kiln-seasoned teak hardwood and adorned with embossed solid brass laurel wreaths and center crests.",
    },
    {
      sku: "AT-MDL06",
      name: "Championship Victory Gold Medal",
      slug: "championship-victory-gold-medal",
      cat: "sports", subcat: "athletics", type: "medal",
      mat: ["zinc-alloy", "metal"], theme: ["sports", "championship"], shape: ["circle"], col: ["best-sellers"],
      sizeUnit: "mm", dimL: "75.00", dimB: "5.00", dimH: "75.00", weight: "0.300",
      price: "2499.00", image: "/images/trophies/victory-medal.jpg",
      shortDescription: "Heavyweight Olympic-grade 75mm diameter gold medal featuring deep relief laurel etching and tricolor ribbon.",
      detailedDescription: "Solid die-struck zinc alloy cast gold medal engineered with 3D deep relief laurel crests. Complete with premium satin woven lanyard ribbon and individual gift presentation box.",
    },
    {
      sku: "AT-SP10",
      name: "Classic Basketball Victory Cup",
      slug: "classic-basketball-victory-cup",
      cat: "sports", subcat: "basketball", type: "trophy",
      mat: ["metal", "wooden"], theme: ["sports", "victory"], shape: ["cup"], col: ["best-sellers", "premium"],
      sizeUnit: "cm", dimL: "24.00", dimB: "20.00", dimH: "52.00", weight: "2.800",
      price: "15999.00", image: "/images/trophies/sports-trophy.jpg",
      shortDescription: "Towering traditional heavyweight basketball tournament championship cup with deep mirror nickel finish.",
      detailedDescription: "The ultimate court championship cup. Cast with high-durability metallic alloys, triple-coated with mirror polished nickel and gold finish, mounted on solid stained walnut.",
    },
    {
      sku: "AT-TEN14",
      name: "Ace Grand Slam Tennis Trophy",
      slug: "ace-grand-slam-tennis-trophy",
      cat: "sports", subcat: "tennis", type: "trophy",
      mat: ["resin", "metal"], theme: ["sports", "championship"], shape: ["figurine"], col: ["best-sellers"],
      sizeUnit: "cm", dimL: "15.00", dimB: "12.00", dimH: "30.00", weight: "1.350",
      price: "8499.00", image: "/images/trophies/golden-foot.jpg",
      shortDescription: "Exquisite dynamic tennis service action sculpture finished in brilliant metallic bronze and gold.",
      detailedDescription: "Celebrate grand slam victories on the court with this finely contoured tennis action trophy. Features high-definition detailing of racquet, net motion, and player focus.",
    },
    {
      sku: "AT-BAD15",
      name: "Smash Victory Badminton Cup",
      slug: "smash-victory-badminton-cup",
      cat: "sports", subcat: "badminton", type: "trophy",
      mat: ["solid-brass", "acrylic"], theme: ["sports", "victory"], shape: ["cup"], col: ["best-sellers"],
      sizeUnit: "cm", dimL: "18.00", dimB: "15.00", dimH: "36.00", weight: "1.500",
      price: "10499.00", image: "/images/trophies/gold-cup.jpg",
      shortDescription: "Sleek contemporary badminton championship trophy with laser-etched crystal shuttlecock finial.",
      detailedDescription: "Designed for premier badminton leagues and club tournaments. Combines electroplated gold metal piping with clear acrylic support struts and a solid weighted presentation base.",
    },
    {
      sku: "AT-CUP01",
      name: "Championship Premier Gold Cup",
      slug: "championship-premier-gold-cup",
      cat: "sports", subcat: "cricket", type: "trophy",
      mat: ["metal", "solid-brass"], theme: ["sports", "championship"], shape: ["cup"], col: ["best-sellers", "premium"],
      sizeUnit: "cm", dimL: "25.00", dimB: "20.00", dimH: "55.00", weight: "3.200",
      price: "18499.00", image: "/images/trophies/gold-cup.jpg",
      shortDescription: "Stunning gold-finished heavyweight tournament trophy cup with rosewood base designed for premier finals.",
      detailedDescription: "Our largest volume sports championship cup. Engineered with thick-wall metal castings, hand-polished gold luster surface, and wide engraving surface for team rosters.",
    },

    // --- CORPORATE (7 Subcategories) ---
    {
      sku: "AT-CRY03",
      name: "Crystal Pinnacle Star Award",
      slug: "crystal-pinnacle-star-award",
      cat: "corporate", subcat: "excellence-merit", type: "trophy",
      mat: ["optical-crystal", "crystal"], theme: ["corporate", "excellence", "leadership"], shape: ["star", "tower"], col: ["best-sellers", "premium"],
      sizeUnit: "cm", dimL: "15.00", dimB: "12.00", dimH: "35.00", weight: "3.100",
      price: "22999.00", image: "/images/trophies/crystal-star.jpg",
      shortDescription: "Flawless optic K9 crystal block hand-cut with multi-faceted diamond chamfers designed for corporate executive milestones.",
      detailedDescription: "An extraordinary multi-faceted star crystal monument designed for summit leaders, CEO recognition, and global excellence awards. Reflects rainbow prism light across every bevel.",
    },
    {
      sku: "AT-STR05",
      name: "Executive Gold Star Monument",
      slug: "executive-gold-star-monument",
      cat: "corporate", subcat: "executive-board", type: "trophy",
      mat: ["metal", "optical-crystal"], theme: ["corporate", "achievement"], shape: ["star", "obelisk"], col: ["best-sellers", "premium"],
      sizeUnit: "cm", dimL: "16.00", dimB: "14.00", dimH: "38.00", weight: "2.200",
      price: "16499.00", image: "/images/trophies/gold-star.jpg",
      shortDescription: "Minimalist boardroom achievement monument with striking elevated gold star mounted atop polished black Belgian marble.",
      detailedDescription: "An architectural icon of executive success featuring a brilliant polished anodized star elevated above a solid obsidian plinth. Perfect for board of directors recognition.",
    },
    {
      sku: "AT-GLS07",
      name: "Corporate Excellence Glass Plaque",
      slug: "corporate-excellence-glass-plaque",
      cat: "corporate", subcat: "milestone", type: "plaque",
      mat: ["beveled-glass", "acrylic", "metal"], theme: ["corporate", "excellence"], shape: ["rectangle"], col: ["best-sellers", "classic"],
      sizeUnit: "cm", dimL: "20.00", dimB: "3.50", dimH: "26.00", weight: "1.500",
      price: "12499.00", image: "/images/trophies/glass-plaque.jpg",
      shortDescription: "Ultra-clear beveled floating glass panel supported by dual brushed stainless steel architectural display pillars.",
      detailedDescription: "A sophisticated executive display featuring high-clarity tempered float glass with diamond-beveled edges and solid aerospace metal hardware.",
    },
    {
      sku: "AT-GLB16",
      name: "Global Leadership Crystal Obelisk",
      slug: "global-leadership-crystal-obelisk",
      cat: "corporate", subcat: "global-leadership", type: "trophy",
      mat: ["optical-crystal", "metal"], theme: ["corporate", "leadership"], shape: ["obelisk", "tower"], col: ["best-sellers", "premium"],
      sizeUnit: "cm", dimL: "14.00", dimB: "14.00", dimH: "42.00", weight: "2.900",
      price: "24500.00", image: "/images/trophies/crystal-award.jpg",
      shortDescription: "Soaring optical crystal tapered column with etched world globe sphere honoring global executive impact.",
      detailedDescription: "The zenith of corporate global honors. Features a solid optic crystal obelisk crowned with a laser-scoured 3D crystal globe representing worldwide leadership and market expansion.",
    },
    {
      sku: "AT-SRV17",
      name: "Dedicated Service Heritage Plaque",
      slug: "dedicated-service-heritage-plaque",
      cat: "corporate", subcat: "service", type: "plaque",
      mat: ["wooden", "solid-brass"], theme: ["corporate", "achievement"], shape: ["shield", "rectangle"], col: ["best-sellers"],
      sizeUnit: "cm", dimL: "25.00", dimB: "3.50", dimH: "32.00", weight: "1.700",
      price: "13500.00", image: "/images/trophies/mahogany-plaque.jpg",
      shortDescription: "Kiln-seasoned mahogany wood panel fitted with heavyweight brushed brass plate for long service honors.",
      detailedDescription: "Designed to honor dedicated employees and executive retirements after 10, 20, or 30 years of meritorious corporate service. Includes custom beveled frame molding.",
    },
    {
      sku: "AT-ACH18",
      name: "Pinnacle Achievement Diamond Tower",
      slug: "pinnacle-achievement-diamond-tower",
      cat: "corporate", subcat: "corporate-achievement", type: "trophy",
      mat: ["optical-crystal"], theme: ["achievement", "excellence"], shape: ["tower", "obelisk"], col: ["best-sellers", "premium"],
      sizeUnit: "cm", dimL: "13.00", dimB: "13.00", dimH: "36.00", weight: "2.400",
      price: "19900.00", image: "/images/trophies/crystal-star.jpg",
      shortDescription: "Diamond-cut crystalline tower catching rainbow prism refraction across every precision face.",
      detailedDescription: "Celebrate quarterly corporate sales triumphs, record revenue milestones, and breakthrough innovations with this masterfully chamfered diamond optical crystal monument.",
    },
    {
      sku: "AT-CRY19",
      name: "Crystal Horizon Executive Award",
      slug: "crystal-horizon-executive-award",
      cat: "corporate", subcat: "crystal-division", type: "trophy",
      mat: ["crystal", "optical-crystal"], theme: ["corporate", "excellence"], shape: ["rectangle"], col: ["best-sellers"],
      sizeUnit: "cm", dimL: "22.00", dimB: "5.00", dimH: "28.00", weight: "2.600",
      price: "17499.00", image: "/images/trophies/glass-plaque.jpg",
      shortDescription: "Wide panoramic clear crystal desktop block engineered for expansive corporate logo laser etchings.",
      detailedDescription: "A formidable wide-profile crystal award designed for joint venture signings, merger commemorations, and corporate partnership celebrations.",
    },

    // --- ACADEMIC (5 Subcategories) ---
    {
      sku: "AT-WDN08",
      name: "Solid Rosewood Leadership Plaque",
      slug: "solid-rosewood-leadership-plaque",
      cat: "academic", subcat: "academic-leadership", type: "plaque",
      mat: ["rosewood", "wooden", "solid-brass"], theme: ["academic", "leadership", "achievement"], shape: ["shield"], col: ["best-sellers", "classic"],
      sizeUnit: "cm", dimL: "25.00", dimB: "3.00", dimH: "30.00", weight: "1.400",
      price: "11499.00", image: "/images/trophies/mahogany-plaque.jpg",
      shortDescription: "Classic academic student leadership plaque crafted from kilned rosewood with deep laser engraving on brass plate.",
      detailedDescription: "Handmade from seasoned solid rosewood with rich natural grain patterns. Fitted with an electroplated brushed gold plate for Lifetime student body presidential and dean's list inscriptions.",
    },
    {
      sku: "AT-AC09",
      name: "Crystal Academic Honor Tower",
      slug: "crystal-academic-honor-tower",
      cat: "academic", subcat: "arts", type: "trophy",
      mat: ["optical-crystal", "crystal"], theme: ["academic", "excellence"], shape: ["tower", "obelisk"], col: ["best-sellers", "premium"],
      sizeUnit: "cm", dimL: "15.00", dimB: "12.00", dimH: "40.00", weight: "2.100",
      price: "19499.00", image: "/images/trophies/crystal-award.jpg",
      shortDescription: "Soaring clear crystal honor obelisk celebrating collegiate artistic mastery and literature distinction.",
      detailedDescription: "An exceptional optical crystal obelisk designed for academic institutions and cultural arts foundations to celebrate extraordinary scholarship, fine arts, and theatrical creativity.",
    },
    {
      sku: "AT-DB11",
      name: "Wooden Heritage Debate Plaque",
      slug: "wooden-heritage-debate-plaque",
      cat: "academic", subcat: "debate", type: "plaque",
      mat: ["wooden", "metal"], theme: ["academic"], shape: ["shield", "rectangle"], col: ["best-sellers"],
      sizeUnit: "cm", dimL: "22.00", dimB: "3.50", dimH: "28.00", weight: "1.100",
      price: "9999.00", image: "/images/trophies/wooden-award.jpg",
      shortDescription: "Traditional stained wood collegiate debate tournament plaque with brushed aluminum center crest.",
      detailedDescription: "Designed for forensic league debate championships, Model UN summits, and collegiate oratorical competitions. Features contrasting stained teak wood finish.",
    },
    {
      sku: "AT-AD12",
      name: "Academic Distinction Star Pin",
      slug: "academic-distinction-star-pin",
      cat: "academic", subcat: "science-math", type: "pin",
      mat: ["zinc-alloy", "metal"], theme: ["academic", "achievement"], shape: ["star"], col: ["best-sellers"],
      sizeUnit: "mm", dimL: "45.00", dimB: "4.00", dimH: "45.00", weight: "0.050",
      price: "3499.00", image: "/images/trophies/academic-award.jpg",
      shortDescription: "Gold plated enamel lapel star pin celebrating scientific olympiad distinction and high scholastic GPA.",
      detailedDescription: "Die-struck jewelers metal lapel honor pin with polished star relief and military butterfly clutch backings. Designed for STEM science fairs and mathematics olympiads.",
    },
    {
      sku: "AT-GRD20",
      name: "University Graduation Excellence Medal",
      slug: "university-graduation-excellence-medal",
      cat: "academic", subcat: "graduation", type: "medal",
      mat: ["solid-brass", "zinc-alloy"], theme: ["academic", "excellence"], shape: ["circle"], col: ["best-sellers"],
      sizeUnit: "mm", dimL: "65.00", dimB: "4.50", dimH: "65.00", weight: "0.220",
      price: "2999.00", image: "/images/trophies/victory-medal.jpg",
      shortDescription: "Heavyweight bronze and gold ceremonial medal for valedictorians, Magna Cum Laude, and doctoral graduates.",
      detailedDescription: "Celebrate the culmination of academic mastery. Stamped from solid brass with university crest relief and royal blue velvet hanging ribbon.",
    },
    {
      sku: "AT-SCI21",
      name: "Science Innovation Crest Badge",
      slug: "science-innovation-crest-badge",
      cat: "academic", subcat: "science-math", type: "badge",
      mat: ["zinc-alloy", "metal"], theme: ["academic"], shape: ["shield", "circle"], col: ["best-sellers"],
      sizeUnit: "mm", dimL: "55.00", dimB: "4.00", dimH: "55.00", weight: "0.080",
      price: "1899.00", image: "/images/trophies/academic-award.jpg",
      shortDescription: "Die-cast metallic chest badge with safety pin locking mechanism for science laboratory researchers.",
      detailedDescription: "Precision die-cast alloy emblem celebrating breakthroughs in engineering, robotics competitions, and physics symposiums.",
    },

    // --- RELIGIOUS (3 Subcategories) ---
    {
      sku: "AT-REL22",
      name: "Sacred Spiritual Heritage Monument",
      slug: "sacred-spiritual-heritage-monument",
      cat: "religious", subcat: "spiritual-heritage", type: "trophy",
      mat: ["optical-crystal", "solid-brass"], theme: ["religious"], shape: ["obelisk", "tower"], col: ["best-sellers", "premium"],
      sizeUnit: "cm", dimL: "16.00", dimB: "12.00", dimH: "34.00", weight: "2.100",
      price: "16500.00", image: "/images/trophies/crystal-award.jpg",
      shortDescription: "Luminous optical crystal spiritual monument celebrating religious heritage and temple endowments.",
      detailedDescription: "Crafted with reverence from spotless optical crystal and golden brass accents. Ideal for honoring temple trustees, spiritual discourse leaders, and devotional benefactors.",
    },
    {
      sku: "AT-FST23",
      name: "Festival Honor Golden Medallion",
      slug: "festival-honor-golden-medallion",
      cat: "religious", subcat: "festival-honor", type: "medal",
      mat: ["solid-brass", "zinc-alloy"], theme: ["religious", "victory"], shape: ["circle"], col: ["best-sellers"],
      sizeUnit: "mm", dimL: "70.00", dimB: "5.00", dimH: "70.00", weight: "0.250",
      price: "2199.00", image: "/images/trophies/victory-medal.jpg",
      shortDescription: "Ornate traditional devotional gold medal celebrating community festival organization and cultural triumphs.",
      detailedDescription: "Features elaborate traditional Indian heritage etching on solid cast metal. Suspended from an auspicious crimson and gold woven lanyard.",
    },
    {
      sku: "AT-COM24",
      name: "Commemorative Temple Honor Plaque",
      slug: "commemorative-temple-honor-plaque",
      cat: "religious", subcat: "commemorative", type: "plaque",
      mat: ["rosewood", "solid-brass", "wooden"], theme: ["religious"], shape: ["rectangle"], col: ["best-sellers", "classic"],
      sizeUnit: "cm", dimL: "24.00", dimB: "3.50", dimH: "30.00", weight: "1.600",
      price: "11999.00", image: "/images/trophies/wooden-award.jpg",
      shortDescription: "Hand-rubbed natural rosewood plaque with engraved gold brass tablet for spiritual community milestones.",
      detailedDescription: "A lasting commemorative monument for interfaith conferences, jubilee temple anniversaries, and humanitarian charity donors.",
    },
  ];

  console.log(`Syncing ${productsToSync.length} Master showroom products into Supabase...`);

  for (const item of productsToSync) {
    const catId = catMap.get(item.cat) || catMap.get("corporate")!;
    const subcatId = subcatMap.get(item.subcat) || null;
    const typeId = typeMap.get(item.type) || typeMap.get("trophy")!;

    const [existing] = await db.select().from(products).where(eq(products.sku, item.sku));
    let productId: string;

    if (existing) {
      const [updated] = await db.update(products).set({
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription,
        detailedDescription: item.detailedDescription,
        categoryId: catId,
        subcategoryId: subcatId,
        typeId: typeId,
        sizeUnit: item.sizeUnit as any,
        isFeatured: true,
        isActive: true,
        customizationOptions: ["Logo Laser Engraving", "Recipient Name Inscription", "Tournament / Event Text", "Velvet Presentation Box"],
        specifications: { Material: item.mat.map(m => m.toUpperCase()).join(", "), Weight: `${item.weight} kg`, Dimensions: `${item.dimL} x ${item.dimB} x ${item.dimH} ${item.sizeUnit}` },
      }).where(eq(products.id, existing.id)).returning();
      productId = updated.id;
      console.log(`Updated SKU: ${item.sku} - ${item.name}`);
    } else {
      const [inserted] = await db.insert(products).values({
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        shortDescription: item.shortDescription,
        detailedDescription: item.detailedDescription,
        categoryId: catId,
        subcategoryId: subcatId,
        typeId: typeId,
        sizeUnit: item.sizeUnit as any,
        isFeatured: true,
        isActive: true,
        customizationOptions: ["Logo Laser Engraving", "Recipient Name Inscription", "Tournament / Event Text", "Velvet Presentation Box"],
        specifications: { Material: item.mat.map(m => m.toUpperCase()).join(", "), Weight: `${item.weight} kg`, Dimensions: `${item.dimL} x ${item.dimB} x ${item.dimH} ${item.sizeUnit}` },
      }).returning();
      productId = inserted.id;
      console.log(`Inserted SKU: ${item.sku} - ${item.name}`);
    }

    // Replace Junctions
    await db.delete(productMaterials).where(eq(productMaterials.productId, productId));
    for (const mSlug of item.mat) {
      const mId = matMap.get(mSlug);
      if (mId) await db.insert(productMaterials).values({ productId, materialId: mId });
    }

    await db.delete(productThemes).where(eq(productThemes.productId, productId));
    for (const thSlug of item.theme) {
      const thId = themeMap.get(thSlug);
      if (thId) await db.insert(productThemes).values({ productId, themeId: thId });
    }

    await db.delete(productShapes).where(eq(productShapes.productId, productId));
    for (const shSlug of item.shape) {
      const shId = shapeMap.get(shSlug);
      if (shId) await db.insert(productShapes).values({ productId, shapeId: shId });
    }

    await db.delete(productCollections).where(eq(productCollections.productId, productId));
    for (const colSlug of item.col) {
      const colId = colMap.get(colSlug);
      if (colId) await db.insert(productCollections).values({ productId, collectionId: colId });
    }

    // Ensure Image exists
    await db.delete(productImages).where(eq(productImages.productId, productId));
    await db.insert(productImages).values({
      productId,
      imageUrl: item.image,
      thumbnailUrl: item.image,
      altText: item.name,
      displayOrder: 1,
      isPrimary: true,
    });

    // Ensure 2D Pricing Matrix
    await db.delete(pricingMatrix).where(eq(pricingMatrix.productId, productId));
    const baseP = parseFloat(item.price);
    await db.insert(pricingMatrix).values([
      { productId, sizeLabel: 'Standard Tier', length: item.dimL, width: item.dimB, height: item.dimH, weightKg: item.weight, quantity: 1, pricePerPiece: baseP.toFixed(2) },
      { productId, sizeLabel: 'Corporate Tier (10+)', length: (parseFloat(item.dimL) * 1.15).toFixed(2), width: (parseFloat(item.dimB) * 1.15).toFixed(2), height: (parseFloat(item.dimH) * 1.15).toFixed(2), weightKg: (parseFloat(item.weight) * 1.2).toFixed(3), quantity: 10, pricePerPiece: (baseP * 0.9).toFixed(2) },
      { productId, sizeLabel: 'Wholesale Tier (25+)', length: (parseFloat(item.dimL) * 1.3).toFixed(2), width: (parseFloat(item.dimB) * 1.3).toFixed(2), height: (parseFloat(item.dimH) * 1.3).toFixed(2), weightKg: (parseFloat(item.weight) * 1.45).toFixed(3), quantity: 25, pricePerPiece: (baseP * 0.8).toFixed(2) },
      { productId, sizeLabel: 'Championship Tier (50+)', length: (parseFloat(item.dimL) * 1.5).toFixed(2), width: (parseFloat(item.dimB) * 1.5).toFixed(2), height: (parseFloat(item.dimH) * 1.5).toFixed(2), weightKg: (parseFloat(item.weight) * 1.75).toFixed(3), quantity: 50, pricePerPiece: (baseP * 0.7).toFixed(2) },
    ]);
  }

  console.log("✅ Complete Master Data & Showroom SKUs synchronized successfully!");
  process.exit(0);
}

runSync().catch((err) => {
  console.error("❌ Synchronization failed:", err);
  process.exit(1);
});
