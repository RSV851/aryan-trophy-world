import { NextRequest } from "next/server";
import { db } from "@/db";
import { collections, products, productCollections, productImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, inArray, and } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/v1/collections/[id]/products - Get all products linked to a collection
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Find collection by ID or Slug
    let collectionId = id;
    const [col] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    if (!col) {
      const [colBySlug] = await db.select().from(collections).where(eq(collections.slug, id)).limit(1);
      if (!colBySlug) return errorResponse("Collection not found", 404);
      collectionId = colBySlug.id;
    }

    const linkedRows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        isActive: products.isActive,
      })
      .from(productCollections)
      .innerJoin(products, eq(productCollections.productId, products.id))
      .where(eq(productCollections.collectionId, collectionId));

    // Get primary images
    const productIds = linkedRows.map((p) => p.id);
    let imageMap: Record<string, string> = {};
    if (productIds.length > 0) {
      const imgs = await db
        .select()
        .from(productImages)
        .where(inArray(productImages.productId, productIds));
      imgs.forEach((img) => {
        if (!imageMap[img.productId] || img.isPrimary) {
          imageMap[img.productId] = img.imageUrl;
        }
      });
    }

    const items = linkedRows.map((p) => ({
      ...p,
      imageUrl: imageMap[p.id] || null,
    }));

    return successResponse(items, "Collection products retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch collection products", 500, error.message);
  }
}

// POST /api/v1/collections/[id]/products - Add products to collection by IDs
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return errorResponse("Please provide an array of productIds to add", 400);
    }

    // Resolve collection ID & entity
    let collectionId = id;
    let targetCol = null;
    const [col] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    if (col) {
      targetCol = col;
    } else {
      const [colBySlug] = await db.select().from(collections).where(eq(collections.slug, id)).limit(1);
      if (!colBySlug) return errorResponse("Collection not found", 404);
      collectionId = colBySlug.id;
      targetCol = colBySlug;
    }

    // Insert ignoring existing duplicates
    for (const pid of productIds) {
      const existing = await db
        .select()
        .from(productCollections)
        .where(and(eq(productCollections.collectionId, collectionId), eq(productCollections.productId, pid)));

      if (existing.length === 0) {
        await db.insert(productCollections).values({
          collectionId,
          productId: pid,
        });
      }
    }

    // Bi-Directional Sync with products table flags
    if (targetCol.slug === 'featured') {
      await db.update(products).set({ isFeatured: true, updatedAt: new Date() }).where(inArray(products.id, productIds));
    } else if (targetCol.slug === 'best-sellers') {
      await db.update(products).set({ isBestseller: true, updatedAt: new Date() }).where(inArray(products.id, productIds));
    }

    return successResponse(null, `${productIds.length} product(s) added to collection`);
  } catch (error: any) {
    return errorResponse("Failed to add products to collection", 500, error.message);
  }
}

// DELETE /api/v1/collections/[id]/products - Remove individual product or Clear All
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const clearAll = searchParams.get("clearAll") === "true";

    // Resolve collection ID & entity
    let collectionId = id;
    let targetCol = null;
    const [col] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    if (col) {
      targetCol = col;
    } else {
      const [colBySlug] = await db.select().from(collections).where(eq(collections.slug, id)).limit(1);
      if (!colBySlug) return errorResponse("Collection not found", 404);
      collectionId = colBySlug.id;
      targetCol = colBySlug;
    }

    if (clearAll) {
      const rows = await db.select({ productId: productCollections.productId }).from(productCollections).where(eq(productCollections.collectionId, collectionId));
      const pids = rows.map((r) => r.productId);

      await db.delete(productCollections).where(eq(productCollections.collectionId, collectionId));

      if (pids.length > 0) {
        if (targetCol.slug === 'featured') {
          await db.update(products).set({ isFeatured: false, updatedAt: new Date() }).where(inArray(products.id, pids));
        } else if (targetCol.slug === 'best-sellers') {
          await db.update(products).set({ isBestseller: false, updatedAt: new Date() }).where(inArray(products.id, pids));
        }
      }

      return successResponse(null, "All products cleared from collection");
    }

    if (productId) {
      await db
        .delete(productCollections)
        .where(
          and(
            eq(productCollections.collectionId, collectionId),
            eq(productCollections.productId, productId)
          )
        );

      if (targetCol.slug === 'featured') {
        await db.update(products).set({ isFeatured: false, updatedAt: new Date() }).where(eq(products.id, productId));
      } else if (targetCol.slug === 'best-sellers') {
        await db.update(products).set({ isBestseller: false, updatedAt: new Date() }).where(eq(products.id, productId));
      }

      return successResponse(null, "Product removed from collection");
    }

    return errorResponse("Specify productId or clearAll=true", 400);
  } catch (error: any) {
    return errorResponse("Failed to modify collection products", 500, error.message);
  }
}
