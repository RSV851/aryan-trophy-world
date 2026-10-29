import { cache } from 'react';
import { unstable_cache } from 'next/cache';
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

// 1. Fetch Site branding Settings (Cached in Server Memory)
export const getPublicSettingsMap = cache(
  unstable_cache(
    async () => {
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
    },
    ['public-settings-map'],
    { revalidate: 60, tags: ['settings'] }
  )
);

// 2. Fetch Business Owner Admin Profile (Cached in Server Memory)
export const getPublicOwnerProfile = cache(
  unstable_cache(
    async () => {
      try {
        const [row] = await db.select().from(adminProfile).limit(1);
        return row || null;
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
        return null;
      }
    },
    ['public-owner-profile'],
    { revalidate: 60, tags: ['profile'] }
  )
);

// 3. Fetch Master Categories (Cached in Server Memory)
export const getPublicCategories = cache(
  unstable_cache(
    async () => {
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
    },
    ['public-categories-list'],
    { revalidate: 60, tags: ['categories'] }
  )
);

// 4. Fetch Master Filters for Catalog Sidebar (Cached in Server Memory)
export const getPublicFiltersData = cache(
  unstable_cache(
    async () => {
      try {
        const [cats, subcats, types, mats, thms, shps, cols] = await Promise.all([
          db.select().from(categories).orderBy(asc(categories.displayOrder), asc(categories.name)),
          db.select().from(subcategories).orderBy(asc(subcategories.displayOrder), asc(subcategories.name)),
          db.select().from(productTypes).orderBy(asc(productTypes.name)),
          db.select().from(materials).orderBy(asc(materials.name)),
          db.select().from(themes).orderBy(asc(themes.name)),
          db.select().from(shapes).orderBy(asc(shapes.name)),
          db.select().from(collections).orderBy(asc(collections.name)),
        ]);

        return {
          categories: cats,
          subcategories: subcats,
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
          subcategories: [],
          productTypes: [],
          materials: [],
          themes: [],
          shapes: [],
          collections: [],
        };
      }
    },
    ['public-filters-data'],
    { revalidate: 60, tags: ['filters'] }
  )
);

// 5. Fetch Products with filtering & pagination
export interface PublicProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'featured';
  sortOrder?: 'asc' | 'desc';
  categorySlug?: string;
  subcategorySlug?: string;
  typeSlug?: string;
  materialSlug?: string;
  themeSlug?: string;
  shapeSlug?: string;
  collectionSlug?: string;
  collection?: string;
  isFeatured?: boolean;
  isBestseller?: boolean;
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

    if (query.isBestseller !== undefined) {
      conditions.push(eq(products.isBestseller, query.isBestseller));
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

    // Resolve category Slug (multi-select & fuzzy slug/name matching supported)
    if (query.categorySlug && query.categorySlug !== 'all') {
      const slugs = query.categorySlug.split(',').map((s) => s.trim()).filter(Boolean);
      const catRows = await db
        .select({ id: categories.id })
        .from(categories)
        .where(
          or(
            inArray(categories.slug, slugs),
            inArray(categories.name, slugs),
            ...slugs.map((s) => ilike(categories.name, `%${s}%`)),
            ...slugs.map((s) => ilike(categories.slug, `%${s}%`))
          )
        );
      const catIds = catRows.map((c) => c.id);
      if (catIds.length > 0) conditions.push(inArray(products.categoryId, catIds));
      else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Resolve subcategory Slug (multi-select & fuzzy slug/name matching supported)
    if (query.subcategorySlug && query.subcategorySlug !== 'all') {
      const slugs = query.subcategorySlug.split(',').map((s) => s.trim()).filter(Boolean);
      const subRows = await db
        .select({ id: subcategories.id })
        .from(subcategories)
        .where(
          or(
            inArray(subcategories.slug, slugs),
            inArray(subcategories.name, slugs),
            ...slugs.map((s) => ilike(subcategories.name, `%${s}%`)),
            ...slugs.map((s) => ilike(subcategories.slug, `%${s}%`))
          )
        );
      const subIds = subRows.map((s) => s.id);
      if (subIds.length > 0) conditions.push(inArray(products.subcategoryId, subIds));
      else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Resolve product Type Slug (multi-select & fuzzy slug/name matching supported)
    if (query.typeSlug && query.typeSlug !== 'all') {
      const slugs = query.typeSlug.split(',').map((s) => s.trim()).filter(Boolean);
      const typeRows = await db
        .select({ id: productTypes.id })
        .from(productTypes)
        .where(
          or(
            inArray(productTypes.slug, slugs),
            inArray(productTypes.name, slugs),
            ...slugs.map((s) => ilike(productTypes.name, `%${s}%`)),
            ...slugs.map((s) => ilike(productTypes.slug, `%${s}%`))
          )
        );
      const typeIds = typeRows.map((t) => t.id);
      if (typeIds.length > 0) conditions.push(inArray(products.typeId, typeIds));
      else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Resolve Material Slug via Junction (multi-select & fuzzy slug/name matching supported)
    if (query.materialSlug && query.materialSlug !== 'all') {
      const slugs = query.materialSlug.split(',').map((s) => s.trim()).filter(Boolean);
      const matRows = await db
        .select({ id: materials.id })
        .from(materials)
        .where(
          or(
            inArray(materials.slug, slugs),
            inArray(materials.name, slugs),
            ...slugs.map((s) => ilike(materials.name, `%${s}%`)),
            ...slugs.map((s) => ilike(materials.slug, `%${s}%`))
          )
        );
      const matIds = matRows.map((m) => m.id);
      if (matIds.length > 0) {
        const pmRows = await db.select({ productId: productMaterials.productId }).from(productMaterials).where(inArray(productMaterials.materialId, matIds));
        const pids = pmRows.map((r) => r.productId);
        if (pids.length > 0) conditions.push(inArray(products.id, pids));
        else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      } else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Resolve Theme Slug via Junction (multi-select & fuzzy slug/name matching supported)
    if (query.themeSlug && query.themeSlug !== 'all') {
      const slugs = query.themeSlug.split(',').map((s) => s.trim()).filter(Boolean);
      const thmRows = await db
        .select({ id: themes.id })
        .from(themes)
        .where(
          or(
            inArray(themes.slug, slugs),
            inArray(themes.name, slugs),
            ...slugs.map((s) => ilike(themes.name, `%${s}%`)),
            ...slugs.map((s) => ilike(themes.slug, `%${s}%`))
          )
        );
      const thmIds = thmRows.map((t) => t.id);
      if (thmIds.length > 0) {
        const ptRows = await db.select({ productId: productThemes.productId }).from(productThemes).where(inArray(productThemes.themeId, thmIds));
        const pids = ptRows.map((r) => r.productId);
        if (pids.length > 0) conditions.push(inArray(products.id, pids));
        else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      } else return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    // Resolve Collection Slug via Junction (multi-select & fuzzy slug/name matching supported)
    const targetCollection = query.collectionSlug || query.collection;
    if (targetCollection && targetCollection !== 'all') {
      const slugs = targetCollection.split(',').map((s) => s.trim()).filter(Boolean);
      const colRows = await db
        .select({ id: collections.id })
        .from(collections)
        .where(
          or(
            inArray(collections.slug, slugs),
            inArray(collections.name, slugs),
            ...slugs.map((s) => ilike(collections.name, `%${s}%`)),
            ...slugs.map((s) => ilike(collections.slug, `%${s}%`))
          )
        );
      const colIds = colRows.map((c) => c.id);
      if (colIds.length > 0) {
        const pcRows = await db.select({ productId: productCollections.productId }).from(productCollections).where(inArray(productCollections.collectionId, colIds));
        const pids = pcRows.map((r) => r.productId);
        if (pids.length > 0) conditions.push(inArray(products.id, pids));
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
        category: { columns: { id: true, name: true, slug: true } },
        subcategory: { columns: { id: true, name: true, slug: true } },
        type: { columns: { id: true, name: true, slug: true } },
        images: {
          orderBy: (img, { desc, asc }) => [desc(img.isPrimary), asc(img.displayOrder)],
          columns: { imageUrl: true, isPrimary: true, displayOrder: true },
        },
        pricingMatrix: {
          columns: { pricePerPiece: true, length: true, width: true, height: true, weightKg: true },
          orderBy: (pm, { asc }) => [asc(pm.quantity)],
        },
      },
    });

    const formatted = rawProducts.map((p, idx) => {
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
        minPrice !== Infinity && maxPrice !== -Infinity && !isNaN(minPrice) && !isNaN(maxPrice)
          ? minPrice === maxPrice
            ? `₹${minPrice.toLocaleString('en-IN')}`
            : `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`
          : 'Price on Inquiry';

      const primaryImgObj = p.images.find((i) => i.isPrimary) || p.images[0];
      const primaryImage = primaryImgObj?.imageUrl || '';

      const dimL = Number(p.pricingMatrix[0]?.length) || 16;
      const dimB = Number(p.pricingMatrix[0]?.width) || 12;
      const dimH = Number(p.pricingMatrix[0]?.height) || 30;
      const weight = p.pricingMatrix[0]?.weightKg ? `${p.pricingMatrix[0].weightKg} kg` : '1.2 kg';

      const matList = (p as any).productMaterials ? (p as any).productMaterials.map((m: any) => m.material?.name).filter(Boolean) : [];
      const materialName = matList.join(', ') || 'Optical Crystal, Brushed Aluminum';
      const materialSlug = (p as any).productMaterials?.[0]?.material?.slug || 'all';

      const themeName = (p as any).productThemes?.[0]?.theme?.name || 'Achievement';
      const themeSlug = (p as any).productThemes?.[0]?.theme?.slug || 'all';
      const shapeName = (p as any).productShapes?.[0]?.shape?.name || 'Obelisk';
      const shapeSlug = (p as any).productShapes?.[0]?.shape?.slug || 'all';
      const collectionSlug = (p as any).productCollections?.[0]?.collection?.slug || 'premium';

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        sizeUnit: p.sizeUnit || 'cm',
        categoryId: p.categoryId,
        categoryName: p.category?.name || 'Unclassified',
        categorySlug: p.category?.slug || 'all',
        subcategoryId: p.subcategoryId || null,
        subcategoryName: p.subcategory?.name || null,
        subcategorySlug: p.subcategory?.slug || 'all',
        typeId: p.typeId,
        typeName: p.type?.name || 'Award',
        typeSlug: p.type?.slug || 'all',
        imageUrl: primaryImage,
        priceRange,
        numericPrice: minPrice !== Infinity ? minPrice : 14500,
        isFeatured: p.isFeatured,
        materials: matList.length > 0 ? matList : ['Optical Crystal', 'Brushed Aluminum'],
        materialName,
        materialSlug,
        themeName,
        themeSlug,
        shapeName,
        shapeSlug,
        collectionSlug,
        dimL,
        dimB,
        dimH,
        weight,
        shortDescription: p.shortDescription || '',
        detailedDescription: p.detailedDescription || '',
        description: p.detailedDescription || p.shortDescription || 'A masterpiece of optical crystal and brushed aerospace-grade aluminum, designed to honor unparalleled achievement with enduring prestige.',
        pricingMatrix: p.pricingMatrix || [],
        customizationOptions: (p.customizationOptions as string[]) || ['Logo Laser Engraving', 'Recipient Name Inscription', 'Tournament / Event Text', 'Velvet Presentation Box'],
        availability: 'in_stock',
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
      minPrice !== Infinity && maxPrice !== -Infinity && !isNaN(minPrice) && !isNaN(maxPrice)
        ? minPrice === maxPrice
          ? `₹${minPrice.toLocaleString('en-IN')}`
          : `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`
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
          orderBy: (imgs, { desc, asc }) => [desc(imgs.isPrimary), asc(imgs.displayOrder)],
          limit: 2,
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
        minPrice !== Infinity && maxPrice !== -Infinity && !isNaN(minPrice) && !isNaN(maxPrice)
          ? minPrice === maxPrice
            ? `₹${minPrice.toLocaleString('en-IN')}`
            : `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`
          : 'Price on Inquiry';

      const pm0 = p.pricingMatrix[0];
      const dimL = Number(pm0?.length) || 18;
      const dimB = Number(pm0?.width) || 12;
      const dimH = Number(pm0?.height) || 24;
      const sizeUnit = p.sizeUnit || 'cm';
      const dimensions = `${dimL} × ${dimB} × ${dimH} ${sizeUnit}`;

      const primaryImgObj = p.images.find((i) => i.isPrimary) || p.images[0];
      const primaryImage = primaryImgObj?.imageUrl || '';

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        categoryName: p.category?.name || 'Award',
        typeName: p.type?.name || 'Trophy',
        imageUrl: primaryImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        priceRange,
        materials: p.productMaterials.map((m) => m.material.name),
        dimL,
        dimB,
        dimH,
        sizeUnit,
        dimensions,
      };
    });
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}
