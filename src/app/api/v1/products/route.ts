import { NextRequest } from "next/server";
import { db } from "@/db";
import { 
  products, 
  productMaterials, 
  productThemes, 
  productShapes, 
  productCollections, 
  productImages, 
  pricingMatrix,
  categories,
  productTypes,
  materials,
  themes,
  shapes,
  collections,
  subcategories
} from "@/db/schema";
import { createProductSchema, productQuerySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { eq, ilike, count, asc, desc, and, isNull, inArray, or, sql } from "drizzle-orm";

// GET /api/v1/products - Public list with advanced filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = productQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: searchParams.get("sortOrder") ?? undefined,
      categorySlug: searchParams.get("categorySlug") ?? undefined,
      subcategorySlug: searchParams.get("subcategorySlug") ?? undefined,
      typeSlug: searchParams.get("typeSlug") ?? undefined,
      materialSlug: searchParams.get("materialSlug") ?? undefined,
      themeSlug: searchParams.get("themeSlug") ?? undefined,
      shapeSlug: searchParams.get("shapeSlug") ?? undefined,
      collectionSlug: searchParams.get("collectionSlug") ?? undefined,
      isFeatured: searchParams.has("isFeatured") ? searchParams.get("isFeatured") === "true" : undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
    });

    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const conditions = [
      isNull(products.deletedAt), // Ignore soft-deleted products
      eq(products.isActive, true) // Default to active products
    ];

    // Search by name, sku or keyword
    if (query.search) {
      const searchCondition = or(
        ilike(products.name, `%${query.search}%`),
        ilike(products.sku, `%${query.search}%`),
        ilike(products.seoKeywords, `%${query.search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    if (query.isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, query.isFeatured));
    }

    // Filter by Category Slug
    if (query.categorySlug) {
      const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, query.categorySlug)).limit(1);
      if (!cat) return paginatedResponse([], page, limit, 0, "No products matched filters");
      conditions.push(eq(products.categoryId, cat.id));
    }

    // Filter by Subcategory Slug
    if (query.subcategorySlug) {
      const [sub] = await db.select({ id: subcategories.id }).from(subcategories).where(eq(subcategories.slug, query.subcategorySlug)).limit(1);
      if (!sub) return paginatedResponse([], page, limit, 0, "No products matched filters");
      conditions.push(eq(products.subcategoryId, sub.id));
    }

    // Filter by Type Slug
    if (query.typeSlug) {
      const [type] = await db.select({ id: productTypes.id }).from(productTypes).where(eq(productTypes.slug, query.typeSlug)).limit(1);
      if (!type) return paginatedResponse([], page, limit, 0, "No products matched filters");
      conditions.push(eq(products.typeId, type.id));
    }

    // Filter by Material via Junction
    if (query.materialSlug) {
      const [mat] = await db.select({ id: materials.id }).from(materials).where(eq(materials.slug, query.materialSlug)).limit(1);
      if (!mat) return paginatedResponse([], page, limit, 0, "No products matched filters");
      const pMats = await db.select({ productId: productMaterials.productId }).from(productMaterials).where(eq(productMaterials.materialId, mat.id));
      const matProductIds = pMats.map(p => p.productId);
      if (matProductIds.length === 0) return paginatedResponse([], page, limit, 0, "No products matched filters");
      conditions.push(inArray(products.id, matProductIds));
    }

    // Filter by Theme via Junction
    if (query.themeSlug) {
      const [thm] = await db.select({ id: themes.id }).from(themes).where(eq(themes.slug, query.themeSlug)).limit(1);
      if (!thm) return paginatedResponse([], page, limit, 0, "No products matched filters");
      const pThms = await db.select({ productId: productThemes.productId }).from(productThemes).where(eq(productThemes.themeId, thm.id));
      const thmProductIds = pThms.map(p => p.productId);
      if (thmProductIds.length === 0) return paginatedResponse([], page, limit, 0, "No products matched filters");
      conditions.push(inArray(products.id, thmProductIds));
    }

    // Filter by Shape via Junction
    if (query.shapeSlug) {
      const [shp] = await db.select({ id: shapes.id }).from(shapes).where(eq(shapes.slug, query.shapeSlug)).limit(1);
      if (!shp) return paginatedResponse([], page, limit, 0, "No products matched filters");
      const pShps = await db.select({ productId: productShapes.productId }).from(productShapes).where(eq(productShapes.shapeId, shp.id));
      const shpProductIds = pShps.map(p => p.productId);
      if (shpProductIds.length === 0) return paginatedResponse([], page, limit, 0, "No products matched filters");
      conditions.push(inArray(products.id, shpProductIds));
    }

    // Filter by Collection via Junction
    if (query.collectionSlug) {
      const [col] = await db.select({ id: collections.id }).from(collections).where(eq(collections.slug, query.collectionSlug)).limit(1);
      if (!col) return paginatedResponse([], page, limit, 0, "No products matched filters");
      const pCols = await db.select({ productId: productCollections.productId }).from(productCollections).where(eq(productCollections.collectionId, col.id));
      const colProductIds = pCols.map(p => p.productId);
      if (colProductIds.length === 0) return paginatedResponse([], page, limit, 0, "No products matched filters");
      conditions.push(inArray(products.id, colProductIds));
    }

    const whereClause = and(...conditions);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(products)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const orderColumn = query.sortBy === "name" ? products.name : products.createdAt;
    const orderByClause = query.sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

    // Fetch matching products with relations using relational query builder
    const productList = await db.query.products.findMany({
      where: whereClause,
      orderBy: orderByClause,
      limit,
      offset,
      with: {
        category: { columns: { name: true, slug: true } },
        type: { columns: { name: true, slug: true } },
        images: {
          orderBy: [asc(productImages.displayOrder)],
        },
        pricingMatrix: true,
      },
    });

    // Transform and attach primary image & min/max price calculation
    const transformedData = productList.map((item) => {
      const primaryImage = item.images.find((img) => img.isPrimary) || item.images[0] || null;
      
      const prices = item.pricingMatrix.map(pm => Number(pm.pricePerPiece)).filter(p => !isNaN(p));
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        shortDescription: item.shortDescription,
        sizeUnit: item.sizeUnit,
        isFeatured: item.isFeatured,
        isActive: item.isActive,
        category: item.category,
        type: item.type,
        primaryImage: primaryImage ? { imageUrl: primaryImage.imageUrl, thumbnailUrl: primaryImage.thumbnailUrl, altText: primaryImage.altText } : null,
        priceRange: minPrice !== null ? { min: minPrice, max: maxPrice } : null,
      };
    });

    return paginatedResponse(transformedData, page, limit, total, "Products retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch products", 500, error.message);
  }
}

// POST /api/v1/products - Admin create in atomic transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.name);

    // Check slug and SKU uniqueness
    const existingSlug = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (existingSlug.length > 0) return errorResponse("Product with this slug already exists", 400);

    const existingSku = await db.select({ id: products.id }).from(products).where(eq(products.sku, data.sku)).limit(1);
    if (existingSku.length > 0) return errorResponse("Product with this SKU already exists", 400);

    // Execute atomic creation transaction
    const createdProduct = await db.transaction(async (tx) => {
      // 1. Insert product
      const [newProduct] = await tx
        .insert(products)
        .values({
          name: data.name,
          slug,
          sku: data.sku,
          shortDescription: data.shortDescription,
          detailedDescription: data.detailedDescription,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId || null,
          typeId: data.typeId,
          sizeUnit: data.sizeUnit,
          isFeatured: data.isFeatured,
          isBestseller: data.isBestseller,
          isActive: data.isActive,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          seoKeywords: data.seoKeywords,
          customizationOptions: data.customizationOptions,
          specifications: data.specifications,
        })
        .returning();

      const productId = newProduct.id;

      // 2. Parallel Batching for all independent junction & child insertions
      const tasks: Promise<any>[] = [];

      // Insert Materials
      if (data.materialIds && data.materialIds.length > 0) {
        tasks.push(
          tx.insert(productMaterials).values(
            data.materialIds.map((matId) => ({ productId, materialId: matId }))
          )
        );
      }

      // Insert Themes
      if (data.themeIds && data.themeIds.length > 0) {
        tasks.push(
          tx.insert(productThemes).values(
            data.themeIds.map((thmId) => ({ productId, themeId: thmId }))
          )
        );
      }

      // Insert Shapes
      if (data.shapeIds && data.shapeIds.length > 0) {
        tasks.push(
          tx.insert(productShapes).values(
            data.shapeIds.map((shpId) => ({ productId, shapeId: shpId }))
          )
        );
      }

      // Insert Collections with Auto-Sync for Featured & Best Sellers
      tasks.push(
        (async () => {
          let targetColIds = [...(data.collectionIds || [])];
          const [featCol, bestCol] = await Promise.all([
            tx.select().from(collections).where(eq(collections.slug, 'featured')).limit(1).then((res) => res[0]),
            tx.select().from(collections).where(eq(collections.slug, 'best-sellers')).limit(1).then((res) => res[0]),
          ]);

          if (featCol) {
            if (data.isFeatured && !targetColIds.includes(featCol.id)) {
              targetColIds.push(featCol.id);
            } else if (!data.isFeatured) {
              targetColIds = targetColIds.filter((cid) => cid !== featCol.id);
            }
          }

          if (bestCol) {
            if (data.isBestseller && !targetColIds.includes(bestCol.id)) {
              targetColIds.push(bestCol.id);
            } else if (!data.isBestseller) {
              targetColIds = targetColIds.filter((cid) => cid !== bestCol.id);
            }
          }

          if (targetColIds.length > 0) {
            await tx.insert(productCollections).values(
              targetColIds.map((colId) => ({ productId, collectionId: colId }))
            );
          }
        })()
      );

      // Insert Pricing Matrix
      if (data.pricingMatrix && data.pricingMatrix.length > 0) {
        tasks.push(
          tx.insert(pricingMatrix).values(
            data.pricingMatrix.map((pm) => ({
              productId,
              sizeLabel: pm.sizeLabel,
              length: pm.length != null ? pm.length.toString() : null,
              width: pm.width != null ? pm.width.toString() : null,
              height: pm.height != null ? pm.height.toString() : null,
              weightKg: pm.weightKg.toString(),
              quantity: Number(pm.quantity),
              pricePerPiece: pm.pricePerPiece.toString(),
            }))
          )
        );
      }

      // Insert Images
      if (data.images && data.images.length > 0) {
        tasks.push(
          tx.insert(productImages).values(
            data.images.map((img, index) => ({
              productId,
              imageUrl: img.imageUrl,
              thumbnailUrl: img.thumbnailUrl || null,
              altText: img.altText || data.name,
              displayOrder: img.displayOrder !== undefined ? img.displayOrder : index,
              isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
            }))
          )
        );
      }

      // Execute all junction insertions in a single parallel batch
      await Promise.all(tasks);

      return newProduct;
    });

    return successResponse(createdProduct, "Product created successfully", 201);
  } catch (error: any) {
    return errorResponse("Failed to create product", 500, error.message);
  }
}
