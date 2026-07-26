import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories, products, subcategories } from "@/db/schema";
import { updateCategorySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, count } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/v1/categories/[id] - Get by ID or Slug
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      // Try fetching by slug
      const [catBySlug] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, id))
        .limit(1);

      if (!catBySlug) {
        return errorResponse("Category not found", 404);
      }
      return successResponse(catBySlug, "Category retrieved successfully");
    }

    return successResponse(category, "Category retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch category", 500, error.message);
  }
}

// PUT /api/v1/categories/[id] - Admin update
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!existing) {
      return errorResponse("Category not found", 404);
    }

    const data = parsed.data;
    const updateData: Partial<typeof categories.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug || generateSlug(data.name || existing.name);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    return successResponse(updatedCategory, "Category updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update category", 500, error.message);
  }
}

// DELETE /api/v1/categories/[id] - Admin delete with dependency check
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!category) {
      return errorResponse("Category not found", 404);
    }

    // Check dependent products
    const productCountResult = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.categoryId, id));
    const linkedProducts = Number(productCountResult[0]?.count || 0);

    if (linkedProducts > 0) {
      return errorResponse(
        `Cannot delete category. ${linkedProducts} product(s) are currently associated with it. Please reassign or delete the products first.`,
        400
      );
    }

    // Check dependent subcategories
    const subcatCountResult = await db
      .select({ count: count() })
      .from(subcategories)
      .where(eq(subcategories.categoryId, id));
    const linkedSubcategories = Number(subcatCountResult[0]?.count || 0);

    if (linkedSubcategories > 0) {
      return errorResponse(
        `Cannot delete category. ${linkedSubcategories} subcategory(ies) belong to it. Please delete or reassign subcategories first.`,
        400
      );
    }

    await db.delete(categories).where(eq(categories.id, id));

    return successResponse(null, "Category deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete category", 500, error.message);
  }
}
