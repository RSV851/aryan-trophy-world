import { NextRequest } from "next/server";
import { db } from "@/db";
import { subcategories, products } from "@/db/schema";
import { updateSubcategorySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { executeWithVaultAuth } from "@/lib/db/vault-session";
import { eq, count } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/v1/subcategories/[id]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [subcategory] = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.id, id))
      .limit(1);

    if (!subcategory) {
      const [subBySlug] = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.slug, id))
        .limit(1);

      if (!subBySlug) {
        return errorResponse("Subcategory not found", 404);
      }
      return successResponse(subBySlug, "Subcategory retrieved successfully");
    }

    return successResponse(subcategory, "Subcategory retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch subcategory", 500, error.message);
  }
}

// PUT /api/v1/subcategories/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSubcategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const [existing] = await db.select().from(subcategories).where(eq(subcategories.id, id)).limit(1);
    if (!existing) {
      return errorResponse("Subcategory not found", 404);
    }

    const data = parsed.data;
    const updateData: Partial<typeof subcategories.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug || generateSlug(data.name || existing.name);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updatedSubcategory] = await db
      .update(subcategories)
      .set(updateData)
      .where(eq(subcategories.id, id))
      .returning();

    return successResponse(updatedSubcategory, "Subcategory updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update subcategory", 500, error.message);
  }
}

// DELETE /api/v1/subcategories/[id] - with dependent products check
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [subcategory] = await db.select().from(subcategories).where(eq(subcategories.id, id)).limit(1);
    if (!subcategory) {
      return errorResponse("Subcategory not found", 404);
    }

    // Check dependent products
    const productCountResult = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.subcategoryId, id));
    const linkedProducts = Number(productCountResult[0]?.count || 0);

    if (linkedProducts > 0) {
      return errorResponse(
        `Cannot delete subcategory. ${linkedProducts} product(s) are associated with it. Please reassign products first.`,
        400
      );
    }

    await executeWithVaultAuth(async () => {
      await db.delete(subcategories).where(eq(subcategories.id, id));
    });

    return successResponse(null, "Subcategory deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete subcategory", 500, error.message);
  }
}
