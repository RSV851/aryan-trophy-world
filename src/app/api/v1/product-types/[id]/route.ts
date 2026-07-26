import { NextRequest } from "next/server";
import { db } from "@/db";
import { productTypes, products } from "@/db/schema";
import { updateProductTypeSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, count } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [typeItem] = await db.select().from(productTypes).where(eq(productTypes.id, id)).limit(1);
    if (!typeItem) {
      const [typeBySlug] = await db.select().from(productTypes).where(eq(productTypes.slug, id)).limit(1);
      if (!typeBySlug) return errorResponse("Product type not found", 404);
      return successResponse(typeBySlug, "Product type retrieved successfully");
    }

    return successResponse(typeItem, "Product type retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch product type", 500, error.message);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductTypeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const [existing] = await db.select().from(productTypes).where(eq(productTypes.id, id)).limit(1);
    if (!existing) return errorResponse("Product type not found", 404);

    const data = parsed.data;
    const updateData: Partial<typeof productTypes.$inferInsert> = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug || generateSlug(data.name || existing.name);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updatedType] = await db
      .update(productTypes)
      .set(updateData)
      .where(eq(productTypes.id, id))
      .returning();

    return successResponse(updatedType, "Product type updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update product type", 500, error.message);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [typeItem] = await db.select().from(productTypes).where(eq(productTypes.id, id)).limit(1);
    if (!typeItem) return errorResponse("Product type not found", 404);

    // Check dependent products
    const productCountResult = await db.select({ count: count() }).from(products).where(eq(products.typeId, id));
    const linkedProducts = Number(productCountResult[0]?.count || 0);

    if (linkedProducts > 0) {
      return errorResponse(
        `Cannot delete product type. ${linkedProducts} product(s) are associated with it. Please reassign products first.`,
        400
      );
    }

    await db.delete(productTypes).where(eq(productTypes.id, id));
    return successResponse(null, "Product type deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete product type", 500, error.message);
  }
}
