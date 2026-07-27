import { db } from '@/db';
import {
  products,
  categories,
  subcategories,
  productTypes,
  materials,
  themes,
  shapes,
  collections,
  productImages,
  pricingMatrix,
  settings,
  adminProfile,
  productMaterials,
  productThemes,
  productShapes,
  productCollections,
} from '@/db/schema';
import { eq, asc, desc, isNull, and, or, ilike, ne, inArray, count } from 'drizzle-orm';

// 1. Fetch Site branding Settings
export async function getPublicSettingsMap() {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, any> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    return {};
  }
}

// 2. Fetch Business Owner Admin Profile (Contact & Heritage Info)
export async function getPublicOwnerProfile() {
  try {
    const [row] = await db.select().from(adminProfile).limit(1);
    return row || null;
  } catch (error) {
    console.error('Failed to fetch admin profile:', error);
    return null;
  }
}

// 3. Fetch Master Categories & Subcategories
export async function getPublicCategories() {
  try {
    const list = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder), asc(categories.name));
    return list;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// 4. Fetch Master Filters for Catalog Sidebar
export async function getPublicFiltersData() {
  try {
    const [cats, types, mats, thms, shps, cols] = await Promise.all([
      db.select().from(categories).orderBy(asc(categories.displayOrder), asc(categories.name)),
      db.select().from(productTypes).orderBy(asc(productTypes.name)),
      db.select().from(materials).orderBy(asc(materials.name)),
      db.select().from(themes).orderBy(asc(themes.name)),
      db.select().from(shapes).orderBy(asc(shapes.name)),
      db.select().from(collections).orderBy(asc(collections.name)),
    ]);

    return {
      categories: cats,
      productTypes: types,
      materials: mats,
      themes: thms,
      shapes: shps,
      collections: cols,
    };
  } catch (error) {
    console.error('Failed to fetch filter entities:', error);
    return {
      categories: [],
      productTypes: [],
      materials: [],
      themes: [],
      shapes: [],
      collections: [],
    };
  }
}

// 5. Fetch Products with filtering & pagination
export interface PublicProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'featured';
  sortOrder?: 'asc' | 'desc';
  categorySlug?: string;
  typeSlug?: string;
  materialSlug?: string;
  themeSlug?: string;
  shapeSlug?: string;
  collectionSlug?: string;
  isFeatured?: boolean;
}

export async function getPublicProducts(query: PublicProductsQuery = {}) {
  try {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 12;
    const offset = (page - 1) * limit;

    // We will query active, non-deleted products
    const conditions = [isNull(products.deletedAt), eq(products.isActive, true)];

    if (query.isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, query.isFeatured));
    }

    if (query.search) {
      conditions.push(
        or(
          ilike(products.name, `%${query.search}%`),
          ilike(products.sku, `%${query.search}%`),
          ilike(products.shortDescription || '', `%${query.search}%`),
          ilike(products.detailedDescription || '', `%${query.search}%`)
        )!
      );
    }

    // Resolve category Slug
    if (query.categorySlug && query.categorySlug !== 'all') {
      const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, query.categorySlug));
      if (cat) conditions.push(eq(products.categoryId, cat.id));
      else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Resolve product Type Slug
    if (query.typeSlug && query.typeSlug !== 'all') {
      const [typ] = await db.select({ id: productTypes.id }).from(productTypes).where(eq(productTypes.slug, query.typeSlug));
      if (typ) conditions.push(eq(products.typeId, typ.id));
      else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Resolve Material Slug via Junction
    if (query.materialSlug && query.materialSlug !== 'all') {
      const [mat] = await db.select({ id: materials.id }).from(materials).where(eq(materials.slug, query.materialSlug));
      if (mat) {
        const pmRows = await db.select({ productId: productMaterials.productId }).from(productMaterials).where(eq(productMaterials.materialId, mat.id));
        const ids = pmRows.map((r) => r.productId);
        if (ids.length > 0) conditions.push(inArray(products.id, ids));
        else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      } else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Resolve Theme Slug via Junction
    if (query.themeSlug && query.themeSlug !== 'all') {
      const [thm] = await db.select({ id: themes.id }).from(themes).where(eq(themes.slug, query.themeSlug));
      if (thm) {
        const ptRows = await db.select({ productId: productThemes.productId }).from(productThemes).where(eq(productThemes.themeId, thm.id));
        const ids = ptRows.map((r) => r.productId);
        if (ids.length > 0) conditions.push(inArray(products.id, ids));
        else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      } else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Resolve Collection Slug via Junction
    if (query.collectionSlug && query.collectionSlug !== 'all') {
      const [col] = await db.select({ id: collections.id }).from(collections).where(eq(collections.slug, query.collectionSlug));
      if (col) {
        const pcRows = await db.select({ productId: productCollections.productId }).from(productCollections).where(eq(productCollections.collectionId, col.id));
        const ids = pcRows.map((r) => r.productId);
        if (ids.length > 0) conditions.push(inArray(products.id, ids));
        else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      } else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Count Total
    const [totalRes] = await db.select({ count: count() }).from(products).where(and(...conditions));
    const total = Number(totalRes?.count || 0);

    // Order By
    let orderByClause = [desc(products.createdAt)];
    if (query.sortBy === 'name') {
      orderByClause = query.sortOrder === 'asc' ? [asc(products.name)] : [desc(products.name)];
    } else if (query.sortBy === 'featured') {
      orderByClause = [desc(products.isFeatured), desc(products.createdAt)];
    }

    const rawProducts = await db.query.products.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: orderByClause,
      with: {
        category: true,
        type: true,
        images: {
          where: eq(productImages.isPrimary, true),
          limit: 1,
        },
        pricingMatrix: true,
        productMaterials: { with: { material: true } },
      },
    });

    // Format products for UI cards
    const formatted = rawProducts.map((p) => {
      let minPrice = Infinity;
      let maxPrice = -Infinity;
      p.pricingMatrix.forEach((pm) => {
        const pr = Number(pm.pricePerPiece);
        if (!isNaN(pr)) {
          if (pr < minPrice) minPrice = pr;
          if (pr > maxPrice) maxPrice = pr;
        }
      });
      const priceRange =
        minPrice !== Infinity && maxPrice !== -Infinity
          ? minPrice === maxPrice
            ? `₹${minPrice.toLocaleString()}`
            : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`
          : 'Price on Inquiry';

      const primaryImage = p.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        sizeUnit: p.sizeUnit,
        categoryName: p.category?.name || 'Unclassified',
        typeName: p.type?.name || 'Award',
        imageUrl: primaryImage,
        priceRange,
        isFeatured: p.isFeatured,
        materials: p.productMaterials.map((m) => m.material.name),
      };
    });

    return {
      products: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Failed to query public products:', error);
    return { products: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 0 } };
  }
}

// 6. Fetch Single Product Detail by Slug or ID
export async function getPublicProductDetail(slugOrId: string) {
  try {
    const whereCond = slugOrId.match(/^[0-9a-fA-F-]{36}$/)
      ? and(eq(products.id, slugOrId), isNull(products.deletedAt), eq(products.isActive, true))
      : and(eq(products.slug, slugOrId), isNull(products.deletedAt), eq(products.isActive, true));

    const product = await db.query.products.findFirst({
      where: whereCond,
      with: {
        category: true,
        subcategory: true,
        type: true,
        images: { orderBy: (imgs, { asc }) => [asc(imgs.displayOrder)] },
        pricingMatrix: { orderBy: (pm, { asc }) => [asc(pm.quantity)] },
        productMaterials: { with: { material: true } },
        productThemes: { with: { theme: true } },
        productShapes: { with: { shape: true } },
        productCollections: { with: { collection: true } },
      },
    });

    if (!product) return null;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    product.pricingMatrix.forEach((pm) => {
      const pr = Number(pm.pricePerPiece);
      if (!isNaN(pr)) {
        if (pr < minPrice) minPrice = pr;
        if (pr > maxPrice) maxPrice = pr;
      }
    });
    const priceRange =
      minPrice !== Infinity && maxPrice !== -Infinity
        ? minPrice === maxPrice
          ? `₹${minPrice.toLocaleString()}`
          : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`
        : 'Price on Inquiry';

    return {
      ...product,
      priceRange,
      materials: product.productMaterials.map((m) => m.material),
      themes: product.productThemes.map((t) => t.theme),
      shapes: product.productShapes.map((s) => s.shape),
      collections: product.productCollections.map((c) => c.collection),
    };
  } catch (error) {
    console.error('Failed to fetch public product detail:', error);
    return null;
  }
}

// 7. Fetch Related Products in same Category
export async function getRelatedProducts(currentProductId: string, categoryId?: string, limit = 4) {
  try {
    const conditions = [
      isNull(products.deletedAt),
      eq(products.isActive, true),
      ne(products.id, currentProductId),
    ];

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    const raw = await db.query.products.findMany({
      where: and(...conditions),
      limit,
      with: {
        category: true,
        type: true,
        images: {
          where: eq(productImages.isPrimary, true),
          limit: 1,
        },
        pricingMatrix: true,
        productMaterials: { with: { material: true } },
      },
    });

    return raw.map((p) => {
      let minPrice = Infinity;
      let maxPrice = -Infinity;
      p.pricingMatrix.forEach((pm) => {
        const pr = Number(pm.pricePerPiece);
        if (!isNaN(pr)) {
          if (pr < minPrice) minPrice = pr;
          if (pr > maxPrice) maxPrice = pr;
        }
      });
      const priceRange =
        minPrice !== Infinity && maxPrice !== -Infinity
          ? minPrice === maxPrice
            ? `₹${minPrice.toLocaleString()}`
            : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`
          : 'Price on Inquiry';

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        categoryName: p.category?.name || 'Award',
        typeName: p.type?.name || 'Trophy',
        imageUrl: p.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        priceRange,
        materials: p.productMaterials.map((m) => m.material.name),
      };
    });
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}
