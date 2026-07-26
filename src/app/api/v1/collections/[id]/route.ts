import { NextRequest } from "next/server";
import { db } from "@/db";
import { collections, productCollections } from "@/db/schema";
import { updateCollectionSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, count } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [item] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    if (!item) {
      const [itemBySlug] = await db.select().from(collections).where(eq(collections.slug, id)).limit(1);
      if (!itemBySlug) return errorResponse("Collection not found", 404);
      return successResponse(itemBySlug, "Collection retrieved successfully");
    }

    return successResponse(item, "Collection retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch collection", 500, error.message);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const [existing] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    if (!existing) return errorResponse("Collection not found", 404);

    const data = parsed.data;
    const updateData: Partial<typeof collections.$inferInsert> = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug || generateSlug(data.name || existing.name);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(collections)
      .set(updateData)
      .where(eq(collections.id, id))
      .returning();

    return successResponse(updated, "Collection updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update collection", 500, error.message);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [item] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    if (!item) return errorResponse("Collection not found", 404);

    // Check dependent products via product_collections junction
    const countResult = await db
      .select({ count: count() })
      .from(productCollections)
      .where(eq(productCollections.collectionId, id));
    const linkedProducts = Number(countResult[0]?.count || 0);

    if (linkedProducts > 0) {
      return errorResponse(
        `Cannot delete collection. ${linkedProducts} product(s) belong to this collection. Please remove the collection from those products first.`,
        400
      );
    }

    await db.delete(collections).where(eq(collections.id, id));
    return successResponse(null, "Collection deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete collection", 500, error.message);
  }
}
