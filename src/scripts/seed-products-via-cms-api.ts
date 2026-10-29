import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface ApiResult {
  success: boolean;
  data?: any;
  message?: string;
  errors?: any;
}

async function postApi(endpoint: string, payload: any): Promise<ApiResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

async function fetchList(endpoint: string): Promise<Record<string, string>> {
  const res = await fetch(`${BASE_URL}/api/v1/${endpoint}?page=1&limit=100`, { cache: 'no-store' });
  const json = await res.json();
  const items = json.data?.items || json.data || [];
  const map: Record<string, string> = {};
  for (const item of items) {
    map[item.name.trim()] = item.id;
    if (item.slug) map[item.slug.trim()] = item.id;
  }
  return map;
}

async function seedProductsViaCmsApi() {
  console.log(`🚀 Fetching Master Data Entity UUID Maps from CMS API (${BASE_URL}/api/v1/...)...`);

  const categoryMap = await fetchList('categories');
  const subcategoryMap = await fetchList('subcategories');
  const typeMap = await fetchList('product-types');
  const materialMap = await fetchList('materials');
  const themeMap = await fetchList('themes');
  const shapeMap = await fetchList('shapes');
  const collectionMap = await fetchList('collections');

  console.log(`  + Categories Loaded: ${Object.keys(categoryMap).length / 2} items`);
  console.log(`  + Subcategories Loaded: ${Object.keys(subcategoryMap).length / 2} items`);
  console.log(`  + Product Types Loaded: ${Object.keys(typeMap).length / 2} items`);
  console.log(`  + Materials Loaded: ${Object.keys(materialMap).length / 2} items`);
  console.log(`  + Themes Loaded: ${Object.keys(themeMap).length / 2} items`);
  console.log(`  + Shapes Loaded: ${Object.keys(shapeMap).length / 2} items`);
  console.log(`  + Collections Loaded: ${Object.keys(collectionMap).length / 2} items`);

  // Default sample trophy image placeholder URLs
  const sampleImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  ];

  const productsToSeed = [
    // 1
    {
      sku: 'ATW-SPT-001',
      name: 'Grand Champion IPL Cricket Trophy',
      category: 'Sports Trophies',
      subcategory: 'Cricket',
      type: 'Metal Trophy',
      shapes: ['Grand Cup', 'Flame & Diamond'],
      materials: ['Solid Brass & Gold', 'Optical Crystal'],
      themes: ['Victory & Triumph', 'Sports & Athletics'],
      collections: ['Tournament Edition', 'Presidential Series', 'best-sellers'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Prestigious gold-plated metal cup trophy on genuine crystal pedestal.',
      detailedDescription: 'Handcrafted master trophy designed for Premier Cricket Leagues. Features 24k gold electroplating on heavy brass body with optical glass base.',
      pricingMatrix: [
        { sizeLabel: 'Small (12")', length: 12, width: 10, height: 30, weightKg: 2.1, quantity: 1, pricePerPiece: 12500 },
        { sizeLabel: 'Medium (15")', length: 15, width: 12, height: 38, weightKg: 2.8, quantity: 1, pricePerPiece: 15800 },
        { sizeLabel: 'Large (18")', length: 18, width: 14, height: 45, weightKg: 3.5, quantity: 1, pricePerPiece: 18500 },
      ],
    },
    // 2
    {
      sku: 'ATW-SPT-002',
      name: 'Golden Willow Cricket Batter Award',
      category: 'Sports Trophies',
      subcategory: 'Cricket',
      type: 'Wooden Shield',
      shapes: ['Shield & Crest', 'Star & Celestial'],
      materials: ['Teak Hardwood', 'Solid Brass & Gold'],
      themes: ['Sports & Athletics'],
      collections: ['Heritage Craftsmanship', 'Tournament Edition'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Solid teakwood carved shield with polished brass cricket motif.',
      detailedDescription: 'Traditional hardwood wall and desk shield recognizing outstanding batting achievements in school and university tournaments.',
      pricingMatrix: [
        { sizeLabel: 'Junior (9")', length: 15, width: 10, height: 22, weightKg: 1.2, quantity: 1, pricePerPiece: 3400 },
        { sizeLabel: 'Senior (12")', length: 20, width: 14, height: 30, weightKg: 1.9, quantity: 1, pricePerPiece: 5200 },
      ],
    },
    // 3
    {
      sku: 'ATW-SPT-003',
      name: 'Premier League Golden Boot Football Award',
      category: 'Sports Trophies',
      subcategory: 'Football',
      type: 'Custom Medal',
      shapes: ['Star & Celestial', 'Shield & Crest'],
      materials: ['Solid Brass & Gold', 'Cast Resin'],
      themes: ['Sports & Athletics', 'Victory & Triumph'],
      collections: ['Tournament Edition', 'best-sellers', 'featured'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'High-gloss golden boot figurine on heavy resin pedestal.',
      detailedDescription: 'Top goal scorer award crafted with electroplated gold boot casting and engraved brass inscription plate.',
      pricingMatrix: [
        { sizeLabel: 'Silver Boot', length: 10, width: 8, height: 22, weightKg: 1.2, quantity: 1, pricePerPiece: 5500 },
        { sizeLabel: 'Golden Boot', length: 14, width: 10, height: 28, weightKg: 1.9, quantity: 1, pricePerPiece: 8900 },
      ],
    },
    // 4
    {
      sku: 'ATW-SPT-004',
      name: 'Champions League Football Striker Cup',
      category: 'Sports Trophies',
      subcategory: 'Football',
      type: 'Metal Trophy',
      shapes: ['Grand Cup'],
      materials: ['Stainless Steel', 'Optical Crystal'],
      themes: ['Sports & Athletics'],
      collections: ['Tournament Edition', 'Presidential Series'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Mirror-finish stainless steel tournament cup with handles.',
      pricingMatrix: [
        { sizeLabel: 'Standard (14")', length: 14, width: 11, height: 35, weightKg: 2.4, quantity: 1, pricePerPiece: 13500 },
        { sizeLabel: 'Pro (18")', length: 18, width: 14, height: 45, weightKg: 3.8, quantity: 1, pricePerPiece: 21000 },
      ],
    },
    // 5
    {
      sku: 'ATW-SPT-005',
      name: 'Shuttlecock Smash Badminton Trophy',
      category: 'Sports Trophies',
      subcategory: 'Badminton',
      type: 'Acrylic Star',
      shapes: ['Flame & Diamond', 'Star & Celestial'],
      materials: ['Acrylic Glass', 'Stainless Steel'],
      themes: ['Sports & Athletics'],
      collections: ['Budget Champions'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Vibrant laser-etched acrylic badminton trophy with metallic accent.',
      pricingMatrix: [
        { sizeLabel: 'Compact (8")', length: 8, width: 6, height: 20, weightKg: 0.7, quantity: 1, pricePerPiece: 2400 },
        { sizeLabel: 'Premier (10")', length: 10, width: 8, height: 26, weightKg: 1.1, quantity: 1, pricePerPiece: 3200 },
      ],
    },
    // 6
    {
      sku: 'ATW-SPT-006',
      name: 'Grand Slam Aces Tennis Plaque',
      category: 'Sports Trophies',
      subcategory: 'Tennis',
      type: 'Crystal Plaque',
      shapes: ['Shield & Crest', 'Obelisk Tower'],
      materials: ['Optical Crystal', 'Solid Brass & Gold'],
      themes: ['Sports & Athletics', 'Victory & Triumph'],
      collections: ['Presidential Series', 'featured'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Beveled optical crystal plaque with gold tennis racket inlay.',
      pricingMatrix: [
        { sizeLabel: 'Classic (9")', length: 10, width: 8, height: 24, weightKg: 1.4, quantity: 1, pricePerPiece: 6200 },
        { sizeLabel: 'Executive (12")', length: 14, width: 10, height: 30, weightKg: 2.2, quantity: 1, pricePerPiece: 8800 },
      ],
    },
    // 7
    {
      sku: 'ATW-SPT-007',
      name: 'Masters Open Golf Championship Urn',
      category: 'Sports Trophies',
      subcategory: 'Golf',
      type: 'Metal Trophy',
      shapes: ['Grand Cup', 'Flame & Diamond'],
      materials: ['Stainless Steel', 'Solid Brass & Gold'],
      themes: ['Sports & Athletics', 'Victory & Triumph'],
      collections: ['Presidential Series', 'Tournament Edition'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Luxury classic golf tournament urn with mahogany base.',
      pricingMatrix: [
        { sizeLabel: 'Club Trophy', length: 15, width: 12, height: 36, weightKg: 2.6, quantity: 1, pricePerPiece: 14500 },
        { sizeLabel: 'Masters Urn', length: 20, width: 16, height: 50, weightKg: 4.2, quantity: 1, pricePerPiece: 24000 },
      ],
    },
    // 8
    {
      sku: 'ATW-SPT-008',
      name: 'Slam Dunk Basketball Champion Cup',
      category: 'Sports Trophies',
      subcategory: 'Basketball',
      type: 'Metal Trophy',
      shapes: ['Grand Cup', 'Star & Celestial'],
      materials: ['Cast Resin', 'Solid Brass & Gold'],
      themes: ['Sports & Athletics'],
      collections: ['Tournament Edition'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Dynamic basketball player figurine cast in bronze and gold resin.',
      pricingMatrix: [
        { sizeLabel: 'Junior Cup', length: 12, width: 10, height: 28, weightKg: 1.3, quantity: 1, pricePerPiece: 4200 },
        { sizeLabel: 'Varsity Cup', length: 15, width: 12, height: 35, weightKg: 2.1, quantity: 1, pricePerPiece: 6500 },
      ],
    },
    // 9
    {
      sku: 'ATW-SPT-009',
      name: 'Aqua Sprint Swimming Gold Award',
      category: 'Sports Trophies',
      subcategory: 'Swimming',
      type: 'Custom Medal',
      shapes: ['Star & Celestial'],
      materials: ['Solid Brass & Gold', 'Acrylic Glass'],
      themes: ['Sports & Athletics'],
      collections: ['Budget Champions'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Heavy die-cast swimming medal with ribbon loop attachment.',
      pricingMatrix: [
        { sizeLabel: '6 cm Medallion', length: 6, width: 6, height: 0.8, weightKg: 0.2, quantity: 1, pricePerPiece: 850 },
        { sizeLabel: '8 cm Medallion', length: 8, width: 8, height: 1.0, weightKg: 0.35, quantity: 1, pricePerPiece: 1350 },
      ],
    },
    // 10
    {
      sku: 'ATW-SPT-010',
      name: 'National Sprint Athletics Victory Shield',
      category: 'Sports Trophies',
      subcategory: 'Athletics',
      type: 'Wooden Shield',
      shapes: ['Shield & Crest', 'Flame & Diamond'],
      materials: ['Teak Hardwood', 'Solid Brass & Gold'],
      themes: ['Sports & Athletics', 'Victory & Triumph'],
      collections: ['Heritage Craftsmanship', 'Tournament Edition'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Teakwood track & field victory shield with brass wreath motif.',
      pricingMatrix: [
        { sizeLabel: 'Junior Shield', length: 16, width: 12, height: 20, weightKg: 1.1, quantity: 1, pricePerPiece: 3100 },
        { sizeLabel: 'Senior Shield', length: 22, width: 16, height: 28, weightKg: 1.8, quantity: 1, pricePerPiece: 4800 },
      ],
    },
    // 11
    {
      sku: 'ATW-COR-011',
      name: 'Employee of the Month Star Award',
      category: 'Corporate Awards',
      subcategory: 'Employee of the Month',
      type: 'Acrylic Star',
      shapes: ['Star & Celestial', 'Obelisk Tower'],
      materials: ['Acrylic Glass', 'Optical Crystal'],
      themes: ['Corporate Milestone', 'Victory & Triumph'],
      collections: ['Budget Champions', 'featured', 'best-sellers'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Crystal star apex corporate award for top monthly performers.',
      pricingMatrix: [
        { sizeLabel: 'Desk Star', length: 8, width: 6, height: 16, weightKg: 0.5, quantity: 1, pricePerPiece: 1600 },
        { sizeLabel: 'Classic Star', length: 10, width: 8, height: 22, weightKg: 0.9, quantity: 1, pricePerPiece: 2800 },
      ],
    },
    // 12
    {
      sku: 'ATW-COR-012',
      name: 'Corporate Star Performer Glass Trophy',
      category: 'Corporate Awards',
      subcategory: 'Employee of the Month',
      type: 'Crystal Plaque',
      shapes: ['Star & Celestial', 'Flame & Diamond'],
      materials: ['Optical Crystal', 'Stainless Steel'],
      themes: ['Corporate Milestone', 'Leadership & Excellence'],
      collections: ['Presidential Series', 'featured'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Thick optical crystal plaque with frosted star engraving.',
      pricingMatrix: [
        { sizeLabel: 'Standard (9")', length: 10, width: 8, height: 23, weightKg: 1.3, quantity: 1, pricePerPiece: 4900 },
        { sizeLabel: 'Premium (12")', length: 12, width: 10, height: 30, weightKg: 2.0, quantity: 1, pricePerPiece: 7500 },
      ],
    },
    // 13
    {
      sku: 'ATW-COR-013',
      name: 'Executive Sales Champion Medallion',
      category: 'Corporate Awards',
      subcategory: 'Sales Champion',
      type: 'Custom Medal',
      shapes: ['Flame & Diamond', 'Shield & Crest'],
      materials: ['Solid Brass & Gold', 'Stainless Steel'],
      themes: ['Corporate Milestone', 'Leadership & Excellence'],
      collections: ['best-sellers', 'Budget Champions'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: '24k gold plated sales target achiever medallion with velvet box.',
      pricingMatrix: [
        { sizeLabel: '6 cm Badge', length: 6, width: 6, height: 0.8, weightKg: 0.15, quantity: 1, pricePerPiece: 950 },
        { sizeLabel: '8 cm Medallion', length: 8, width: 8, height: 1.0, weightKg: 0.3, quantity: 1, pricePerPiece: 1500 },
      ],
    },
    // 14
    {
      sku: 'ATW-COR-014',
      name: 'Sales Achiever Target Breaker Plaque',
      category: 'Corporate Awards',
      subcategory: 'Sales Champion',
      type: 'Crystal Plaque',
      shapes: ['Obelisk Tower', 'Flame & Diamond'],
      materials: ['Optical Crystal', 'Teak Hardwood'],
      themes: ['Corporate Milestone'],
      collections: ['Presidential Series', 'best-sellers'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Crystal monolith plaque on walnut wood base for quarterly sales leaders.',
      pricingMatrix: [
        { sizeLabel: 'Silver Tier', length: 10, width: 8, height: 24, weightKg: 1.5, quantity: 1, pricePerPiece: 6500 },
        { sizeLabel: 'Gold Tier', length: 13, width: 10, height: 32, weightKg: 2.3, quantity: 1, pricePerPiece: 9900 },
      ],
    },
    // 15
    {
      sku: 'ATW-COR-015',
      name: 'Distinguished Career Lifetime Achievement Monument',
      category: 'Corporate Awards',
      subcategory: 'Lifetime Achievement',
      type: 'Crystal Plaque',
      shapes: ['Obelisk Tower', 'Flame & Diamond'],
      materials: ['Optical Crystal', 'Stainless Steel'],
      themes: ['Leadership & Excellence', 'Corporate Milestone'],
      collections: ['Presidential Series', 'Heritage Craftsmanship', 'featured'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Ultra-luxurious optical crystal monument for retiring directors & founders.',
      pricingMatrix: [
        { sizeLabel: '10" Plaque', length: 10, width: 8, height: 25, weightKg: 1.7, quantity: 1, pricePerPiece: 8500 },
        { sizeLabel: '14" Monument', length: 14, width: 12, height: 35, weightKg: 2.8, quantity: 1, pricePerPiece: 14000 },
      ],
    },
    // 16
    {
      sku: 'ATW-COR-016',
      name: 'Rising Star Performer Crystal Obelisk',
      category: 'Corporate Awards',
      subcategory: 'Star Performer',
      type: 'Crystal Plaque',
      shapes: ['Obelisk Tower', 'Star & Celestial'],
      materials: ['Optical Crystal'],
      themes: ['Leadership & Excellence'],
      collections: ['featured', 'Presidential Series'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Tapered crystal obelisk recognizing rapid career growth & performance.',
      pricingMatrix: [
        { sizeLabel: '8" Obelisk', length: 8, width: 6, height: 20, weightKg: 1.1, quantity: 1, pricePerPiece: 5800 },
        { sizeLabel: '11" Obelisk', length: 11, width: 9, height: 28, weightKg: 1.8, quantity: 1, pricePerPiece: 8200 },
      ],
    },
    // 17
    {
      sku: 'ATW-COR-017',
      name: 'Visionary Leadership Excellence Trophy',
      category: 'Corporate Awards',
      subcategory: 'Leadership Excellence',
      type: 'Metal Trophy',
      shapes: ['Flame & Diamond', 'Grand Cup'],
      materials: ['Solid Brass & Gold', 'Teak Hardwood'],
      themes: ['Leadership & Excellence'],
      collections: ['Presidential Series', 'best-sellers'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Abstract golden flame metal sculpture on dark mahogany base.',
      pricingMatrix: [
        { sizeLabel: 'Standard (11")', length: 11, width: 9, height: 28, weightKg: 1.6, quantity: 1, pricePerPiece: 9800 },
        { sizeLabel: 'Executive (14")', length: 14, width: 11, height: 36, weightKg: 2.5, quantity: 1, pricePerPiece: 13500 },
      ],
    },
    // 18
    {
      sku: 'ATW-COR-018',
      name: 'Veteran Loyalty 10 Years of Service Award',
      category: 'Corporate Awards',
      subcategory: 'Years of Service',
      type: 'Wooden Shield',
      shapes: ['Shield & Crest', 'Obelisk Tower'],
      materials: ['Teak Hardwood', 'Solid Brass & Gold'],
      themes: ['Corporate Milestone'],
      collections: ['Heritage Craftsmanship', 'Presidential Series'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Rich teakwood plaque with 10-year golden metal emblem.',
      pricingMatrix: [
        { sizeLabel: '9" Shield', length: 18, width: 14, height: 22, weightKg: 1.3, quantity: 1, pricePerPiece: 4100 },
        { sizeLabel: '12" Shield', length: 22, width: 18, height: 30, weightKg: 2.0, quantity: 1, pricePerPiece: 5900 },
      ],
    },
    // 19
    {
      sku: 'ATW-COR-019',
      name: 'Corporate Milestones 25 Years Honor Shield',
      category: 'Corporate Awards',
      subcategory: 'Years of Service',
      type: 'Wooden Shield',
      shapes: ['Shield & Crest', 'Flame & Diamond'],
      materials: ['Teak Hardwood', 'Solid Brass & Gold', 'Stainless Steel'],
      themes: ['Corporate Milestone', 'Leadership & Excellence'],
      collections: ['Heritage Craftsmanship', 'Presidential Series'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Silver Jubilee 25-year service honor shield for senior executives.',
      pricingMatrix: [
        { sizeLabel: 'Silver Jubilee (14")', length: 24, width: 18, height: 35, weightKg: 2.7, quantity: 1, pricePerPiece: 11200 },
      ],
    },
    // 20
    {
      sku: 'ATW-ACA-020',
      name: 'Young Scientist Science Fair Innovation Award',
      category: 'Academic Excellence',
      subcategory: 'Science Fair',
      type: 'Acrylic Star',
      shapes: ['Star & Celestial', 'Flame & Diamond'],
      materials: ['Acrylic Glass', 'Cast Resin'],
      themes: ['Academic & Knowledge'],
      collections: ['Budget Champions', 'featured'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Atom & star engraved acrylic trophy for annual school science fairs.',
      pricingMatrix: [
        { sizeLabel: 'Junior (7")', length: 8, width: 6, height: 18, weightKg: 0.6, quantity: 1, pricePerPiece: 1900 },
        { sizeLabel: 'Senior (9.5")', length: 10, width: 8, height: 24, weightKg: 1.0, quantity: 1, pricePerPiece: 2900 },
      ],
    },
    // 21
    {
      sku: 'ATW-ACA-021',
      name: 'Valedictorian Top Scholar Crystal Plaque',
      category: 'Academic Excellence',
      subcategory: 'Top Scholar',
      type: 'Crystal Plaque',
      shapes: ['Obelisk Tower', 'Shield & Crest'],
      materials: ['Optical Crystal', 'Solid Brass & Gold'],
      themes: ['Academic & Knowledge', 'Leadership & Excellence'],
      collections: ['Presidential Series', 'featured'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Gold-leaf engraved crystal plaque for university valedictorians.',
      pricingMatrix: [
        { sizeLabel: 'Scholar (9")', length: 10, width: 8, height: 22, weightKg: 1.3, quantity: 1, pricePerPiece: 5400 },
        { sizeLabel: 'Valedictorian (12")', length: 12, width: 10, height: 30, weightKg: 2.1, quantity: 1, pricePerPiece: 8200 },
      ],
    },
    // 22
    {
      sku: 'ATW-ACA-022',
      name: 'National Elocution & Debate Champion Crest',
      category: 'Academic Excellence',
      subcategory: 'Debate Champion',
      type: 'Lapel Pin & Badge',
      shapes: ['Shield & Crest', 'Star & Celestial'],
      materials: ['Stainless Steel', 'Cast Resin'],
      themes: ['Academic & Knowledge'],
      collections: ['Tournament Edition', 'Budget Champions'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Inter-school debate winner lapel crest badge set.',
      pricingMatrix: [
        { sizeLabel: '4 cm Pin', length: 4, width: 4, height: 0.4, weightKg: 0.04, quantity: 1, pricePerPiece: 420 },
        { sizeLabel: '5.5 cm Badge', length: 5.5, width: 5.5, height: 0.5, weightKg: 0.08, quantity: 1, pricePerPiece: 650 },
      ],
    },
    // 23
    {
      sku: 'ATW-ACA-023',
      name: 'Genius Olympiad Mathematics Gold Shield',
      category: 'Academic Excellence',
      subcategory: 'Mathematics Olympiad',
      type: 'Wooden Shield',
      shapes: ['Shield & Crest', 'Flame & Diamond'],
      materials: ['Teak Hardwood', 'Solid Brass & Gold'],
      themes: ['Academic & Knowledge'],
      collections: ['Heritage Craftsmanship', 'Budget Champions'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'National math olympiad honor shield with golden pi emblem.',
      pricingMatrix: [
        { sizeLabel: 'Junior Shield', length: 15, width: 10, height: 20, weightKg: 1.1, quantity: 1, pricePerPiece: 2800 },
        { sizeLabel: 'Senior Shield', length: 20, width: 15, height: 30, weightKg: 1.8, quantity: 1, pricePerPiece: 4500 },
      ],
    },
    // 24
    {
      sku: 'ATW-ACA-024',
      name: 'Chancellor Convocation Graduation Honor Cup',
      category: 'Academic Excellence',
      subcategory: 'Graduation Honor',
      type: 'Metal Trophy',
      shapes: ['Grand Cup', 'Obelisk Tower'],
      materials: ['Solid Brass & Gold', 'Optical Crystal'],
      themes: ['Academic & Knowledge', 'Leadership & Excellence'],
      collections: ['Presidential Series', 'Heritage Craftsmanship'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Grand academic convocation cup with graduation cap motif.',
      pricingMatrix: [
        { sizeLabel: '10" Convocation', length: 12, width: 10, height: 25, weightKg: 1.7, quantity: 1, pricePerPiece: 7200 },
        { sizeLabel: '13.5" Honor', length: 15, width: 12, height: 34, weightKg: 2.6, quantity: 1, pricePerPiece: 10500 },
      ],
    },
    // 25
    {
      sku: 'ATW-ACA-025',
      name: 'STEM Academic Research Excellence Trophy',
      category: 'Academic Excellence',
      subcategory: 'Science Fair',
      type: 'Acrylic Star',
      shapes: ['Flame & Diamond', 'Star & Celestial'],
      materials: ['Cast Resin', 'Optical Crystal'],
      themes: ['Academic & Knowledge'],
      collections: ['Tournament Edition', 'featured'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Innovator STEM research award with crystal base.',
      pricingMatrix: [
        { sizeLabel: '9" Trophy', length: 10, width: 8, height: 23, weightKg: 1.2, quantity: 1, pricePerPiece: 4800 },
      ],
    },
    // 26
    {
      sku: 'ATW-REL-026',
      name: 'Garba & Dandiya Raas Maha Utsav Trophy',
      category: 'Religious & Cultural',
      subcategory: 'Garba & Dandiya Contests',
      type: 'Metal Trophy',
      shapes: ['Flame & Diamond', 'Star & Celestial'],
      materials: ['Cast Resin', 'Solid Brass & Gold'],
      themes: ['Spiritual & Sacred Heritage', 'Victory & Triumph'],
      collections: ['Tournament Edition', 'featured', 'best-sellers'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Ornate festive Garba competition trophy with golden dandiya sticks.',
      pricingMatrix: [
        { sizeLabel: 'Shree Edition (10")', length: 10, width: 8, height: 25, weightKg: 1.4, quantity: 1, pricePerPiece: 3800 },
        { sizeLabel: 'Royal Samman (14")', length: 15, width: 12, height: 35, weightKg: 2.5, quantity: 1, pricePerPiece: 6800 },
      ],
    },
    // 27
    {
      sku: 'ATW-REL-027',
      name: 'Navratri Dandiya Queen Gold Award',
      category: 'Religious & Cultural',
      subcategory: 'Garba & Dandiya Contests',
      type: 'Metal Trophy',
      shapes: ['Star & Celestial', 'Grand Cup'],
      materials: ['Solid Brass & Gold', 'Optical Crystal'],
      themes: ['Spiritual & Sacred Heritage', 'Victory & Triumph'],
      collections: ['Tournament Edition', 'best-sellers'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Crown-topped golden metal trophy for Navratri costume & dance winners.',
      pricingMatrix: [
        { sizeLabel: 'Queen Crown (12")', length: 12, width: 10, height: 30, weightKg: 2.0, quantity: 1, pricePerPiece: 7500 },
      ],
    },
    // 28
    {
      sku: 'ATW-REL-028',
      name: 'Deepavali Rangoli & Diya Kalakriti Award',
      category: 'Religious & Cultural',
      subcategory: 'Rangoli & Diya Competitions',
      type: 'Wooden Shield',
      shapes: ['Shield & Crest', 'Flame & Diamond'],
      materials: ['Teak Hardwood', 'Solid Brass & Gold'],
      themes: ['Spiritual & Sacred Heritage'],
      collections: ['Heritage Craftsmanship'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Traditional wooden plaque featuring engraved brass diya & peacock.',
      pricingMatrix: [
        { sizeLabel: 'Standard (9")', length: 18, width: 14, height: 22, weightKg: 1.3, quantity: 1, pricePerPiece: 3400 },
        { sizeLabel: 'Grand Award (12")', length: 22, width: 18, height: 30, weightKg: 2.0, quantity: 1, pricePerPiece: 5200 },
      ],
    },
    // 29
    {
      sku: 'ATW-REL-029',
      name: 'Bhajan Sandhya Devotional Singing Samman',
      category: 'Religious & Cultural',
      subcategory: 'Devotional Singing Contests',
      type: 'Metal Trophy',
      shapes: ['Grand Cup', 'Flame & Diamond'],
      materials: ['Solid Brass & Gold', 'Cast Resin'],
      themes: ['Spiritual & Sacred Heritage'],
      collections: ['Tournament Edition'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Gold-plated devotional music trophy with veena & tanpura motifs.',
      pricingMatrix: [
        { sizeLabel: '9.5" Samman', length: 11, width: 9, height: 24, weightKg: 1.3, quantity: 1, pricePerPiece: 4200 },
        { sizeLabel: '12.5" Samman', length: 14, width: 11, height: 32, weightKg: 2.1, quantity: 1, pricePerPiece: 6900 },
      ],
    },
    // 30
    {
      sku: 'ATW-REL-030',
      name: 'Sangeet Sur Devotional Vocalist Plaque',
      category: 'Religious & Cultural',
      subcategory: 'Devotional Singing Contests',
      type: 'Crystal Plaque',
      shapes: ['Obelisk Tower', 'Star & Celestial'],
      materials: ['Optical Crystal', 'Solid Brass & Gold'],
      themes: ['Spiritual & Sacred Heritage'],
      collections: ['Presidential Series', 'Heritage Craftsmanship'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Frosted crystal plaque for classical bhajan & kirtan singers.',
      pricingMatrix: [
        { sizeLabel: '10" Plaque', length: 11, width: 9, height: 26, weightKg: 1.5, quantity: 1, pricePerPiece: 5900 },
      ],
    },
    // 31
    {
      sku: 'ATW-REL-031',
      name: 'Natya Kala Cultural Drama Performance Award',
      category: 'Religious & Cultural',
      subcategory: 'Cultural Drama & Skits',
      type: 'Acrylic Star',
      shapes: ['Star & Celestial', 'Flame & Diamond'],
      materials: ['Acrylic Glass', 'Teak Hardwood'],
      themes: ['Spiritual & Sacred Heritage'],
      collections: ['Budget Champions'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Acrylic star trophy with dramatic mask & stage art graphics.',
      pricingMatrix: [
        { sizeLabel: 'Compact (7")', length: 8, width: 6, height: 18, weightKg: 0.6, quantity: 1, pricePerPiece: 1950 },
        { sizeLabel: 'Premier (10")', length: 10, width: 8, height: 25, weightKg: 1.1, quantity: 1, pricePerPiece: 3100 },
      ],
    },
    // 32
    {
      sku: 'ATW-REL-032',
      name: 'Samaj Ratna Social Seva Samman Monument',
      category: 'Religious & Cultural',
      subcategory: 'Social Seva Samman',
      type: 'Crystal Plaque',
      shapes: ['Obelisk Tower', 'Shield & Crest'],
      materials: ['Optical Crystal', 'Solid Brass & Gold'],
      themes: ['Spiritual & Sacred Heritage', 'Leadership & Excellence'],
      collections: ['Presidential Series', 'Heritage Craftsmanship', 'featured'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Executive crystal monument honoring distinguished social service & charity work.',
      pricingMatrix: [
        { sizeLabel: 'Seva Plaque (10")', length: 11, width: 9, height: 25, weightKg: 1.6, quantity: 1, pricePerPiece: 6800 },
        { sizeLabel: 'Samaj Ratna (14")', length: 15, width: 12, height: 35, weightKg: 2.7, quantity: 1, pricePerPiece: 11500 },
      ],
    },
    // 33
    {
      sku: 'ATW-REL-033',
      name: 'Manav Seva Philanthropy Honor Shield',
      category: 'Religious & Cultural',
      subcategory: 'Social Seva Samman',
      type: 'Wooden Shield',
      shapes: ['Shield & Crest', 'Flame & Diamond'],
      materials: ['Teak Hardwood', 'Solid Brass & Gold'],
      themes: ['Spiritual & Sacred Heritage'],
      collections: ['Heritage Craftsmanship', 'Presidential Series'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Carved teakwood shield recognizing NGO & community welfare dedication.',
      pricingMatrix: [
        { sizeLabel: '11" Shield', length: 20, width: 15, height: 28, weightKg: 1.7, quantity: 1, pricePerPiece: 4900 },
      ],
    },
    // 34
    {
      sku: 'ATW-REL-034',
      name: 'Vedic Recitation Scriptural Scholar Pin Badge',
      category: 'Religious & Cultural',
      subcategory: 'Scholarly & Scriptural Recitation',
      type: 'Lapel Pin & Badge',
      shapes: ['Shield & Crest', 'Star & Celestial'],
      materials: ['Solid Brass & Gold', 'Acrylic Glass'],
      themes: ['Spiritual & Sacred Heritage'],
      collections: ['Budget Champions'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Enamel lapel pin for scriptural recitation & Vedic scholars.',
      pricingMatrix: [
        { sizeLabel: '3.5 cm Pin', length: 3.5, width: 3.5, height: 0.4, weightKg: 0.03, quantity: 1, pricePerPiece: 290 },
        { sizeLabel: '5 cm Badge', length: 5, width: 5, height: 0.5, weightKg: 0.05, quantity: 1, pricePerPiece: 460 },
      ],
    },
    // 35
    {
      sku: 'ATW-SPT-035',
      name: 'Corporate Golf Open Eagle Championship Trophy',
      category: 'Sports Trophies',
      subcategory: 'Golf',
      type: 'Metal Trophy',
      shapes: ['Grand Cup', 'Obelisk Tower'],
      materials: ['Solid Brass & Gold', 'Optical Crystal'],
      themes: ['Sports & Athletics', 'Corporate Milestone'],
      collections: ['Presidential Series', 'Tournament Edition', 'best-sellers'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Golden eagle atop optical crystal pedestal for corporate golf tournaments.',
      pricingMatrix: [
        { sizeLabel: '16" Eagle Cup', length: 16, width: 13, height: 40, weightKg: 3.1, quantity: 1, pricePerPiece: 18900 },
      ],
    },
    // 36
    {
      sku: 'ATW-COR-036',
      name: 'Star Performer Quarterly MVP Crystal Pillar',
      category: 'Corporate Awards',
      subcategory: 'Star Performer',
      type: 'Crystal Plaque',
      shapes: ['Obelisk Tower', 'Flame & Diamond'],
      materials: ['Optical Crystal', 'Stainless Steel'],
      themes: ['Corporate Milestone', 'Victory & Triumph'],
      collections: ['Presidential Series', 'best-sellers', 'featured'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: '4-sided optical crystal pillar with custom company logo etching.',
      pricingMatrix: [
        { sizeLabel: '10" Pillar', length: 10, width: 8, height: 25, weightKg: 1.6, quantity: 1, pricePerPiece: 7200 },
      ],
    },
    // 37
    {
      sku: 'ATW-ACA-037',
      name: 'National Spelling Bee Championship Star',
      category: 'Academic Excellence',
      subcategory: 'Debate Champion',
      type: 'Acrylic Star',
      shapes: ['Star & Celestial', 'Shield & Crest'],
      materials: ['Acrylic Glass', 'Optical Crystal'],
      themes: ['Academic & Knowledge'],
      collections: ['Budget Champions', 'Tournament Edition'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Star-shaped acrylic award for national spelling bee & debate finalists.',
      pricingMatrix: [
        { sizeLabel: '8" Star', length: 8, width: 6, height: 20, weightKg: 0.7, quantity: 1, pricePerPiece: 2200 },
      ],
    },
    // 38
    {
      sku: 'ATW-REL-038',
      name: 'Classical Sangeet Gurukul Honor Plaque',
      category: 'Religious & Cultural',
      subcategory: 'Scholarly & Scriptural Recitation',
      type: 'Crystal Plaque',
      shapes: ['Obelisk Tower', 'Shield & Crest'],
      materials: ['Optical Crystal', 'Teak Hardwood'],
      themes: ['Spiritual & Sacred Heritage', 'Academic & Knowledge'],
      collections: ['Heritage Craftsmanship', 'Presidential Series'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Gurukul honor plaque for classical scriptural research & teaching.',
      pricingMatrix: [
        { sizeLabel: '11" Plaque', length: 12, width: 10, height: 28, weightKg: 1.8, quantity: 1, pricePerPiece: 6500 },
      ],
    },
    // 39
    {
      sku: 'ATW-SPT-039',
      name: 'All-India Badminton Championship Shield',
      category: 'Sports Trophies',
      subcategory: 'Badminton',
      type: 'Wooden Shield',
      shapes: ['Shield & Crest', 'Star & Celestial'],
      materials: ['Teak Hardwood', 'Solid Brass & Gold'],
      themes: ['Sports & Athletics', 'Victory & Triumph'],
      collections: ['Heritage Craftsmanship', 'Tournament Edition'],
      isFeatured: false,
      sizeUnit: 'cm',
      shortDescription: 'Teakwood wall-mounting shield with golden shuttlecock crest.',
      pricingMatrix: [
        { sizeLabel: '10" Shield', length: 18, width: 14, height: 25, weightKg: 1.4, quantity: 1, pricePerPiece: 3800 },
      ],
    },
    // 40
    {
      sku: 'ATW-COR-040',
      name: 'Executive Board Chairman Milestone Monument',
      category: 'Corporate Awards',
      subcategory: 'Leadership Excellence',
      type: 'Metal Trophy',
      shapes: ['Obelisk Tower', 'Flame & Diamond', 'Grand Cup'],
      materials: ['Solid Brass & Gold', 'Optical Crystal', 'Teak Hardwood'],
      themes: ['Leadership & Excellence', 'Corporate Milestone', 'Victory & Triumph'],
      collections: ['Presidential Series', 'featured', 'best-sellers'],
      isFeatured: true,
      sizeUnit: 'cm',
      shortDescription: 'Masterpiece 18-inch corporate monument for board chairmen & CEOs.',
      detailedDescription: 'The pinnacle of luxury trophy design. Features hand-carved mahogany base, optical crystal pillar, and 24k gold flame sculpture.',
      pricingMatrix: [
        { sizeLabel: 'Presidential Edition (18")', length: 18, width: 14, height: 46, weightKg: 4.5, quantity: 1, pricePerPiece: 28000 },
      ],
    },
  ];

  console.log(`\n📦 Submitting 40 Master Products via POST /api/v1/products (CMS API Transaction)...`);

  let successCount = 0;
  let failCount = 0;

  for (const item of productsToSeed) {
    const catId = categoryMap[item.category];
    const subcatId = subcategoryMap[item.subcategory];
    const typeId = typeMap[item.type];

    if (!catId || !typeId) {
      console.error(`  ! Missing parent category or type for SKU "${item.sku}"`);
      failCount++;
      continue;
    }

    const materialIds = (item.materials || []).map((m) => materialMap[m]).filter(Boolean);
    const themeIds = (item.themes || []).map((t) => themeMap[t]).filter(Boolean);
    const shapeIds = (item.shapes || []).map((s) => shapeMap[s]).filter(Boolean);
    const collectionIds = (item.collections || []).map((c) => collectionMap[c]).filter(Boolean);

    // Attach sample image gallery
    const images = sampleImages.map((url, idx) => ({
      imageUrl: url,
      altText: `${item.name} View ${idx + 1}`,
      displayOrder: idx,
      isPrimary: idx === 0,
    }));

    const payload = {
      name: item.name,
      sku: item.sku,
      shortDescription: item.shortDescription,
      detailedDescription: item.detailedDescription || item.shortDescription,
      categoryId: catId,
      subcategoryId: subcatId || null,
      typeId: typeId,
      sizeUnit: item.sizeUnit || 'cm',
      isFeatured: item.isFeatured || false,
      isActive: true,
      seoTitle: `${item.name} | Wholesale Trophy Supplier`,
      seoDescription: item.shortDescription,
      seoKeywords: `${item.name}, trophy wholesale, ${item.category}, ${item.subcategory}`,
      customizationOptions: ['Logo Engraving', 'Custom Plate Text', 'Velvet Box Packaging'],
      specifications: {
        Warranty: '1 Year Manufacturer Guarantee',
        Finish: 'Hand-polished 24k electroplating / Optical Polish',
      },
      materialIds,
      themeIds,
      shapeIds,
      collectionIds,
      pricingMatrix: item.pricingMatrix,
      images,
    };

    const res = await postApi('products', payload);
    if (res.success) {
      successCount++;
      console.log(`  + [CMS POST OK] Product ${successCount}/40: "${item.name}" (SKU: ${item.sku})`);
    } else {
      failCount++;
      console.log(`  ! [CMS POST FAILED] Product "${item.name}" - ${res.message || JSON.stringify(res.errors)}`);
    }
  }

  console.log(`\n🎉 Product Seeding Summary: ${successCount} Created, ${failCount} Failed.`);
}

seedProductsViaCmsApi();
