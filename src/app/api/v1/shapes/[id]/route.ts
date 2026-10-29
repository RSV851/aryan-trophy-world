import { NextRequest } from "next/server";
import { db } from "@/db";
import { shapes, productShapes } from "@/db/schema";
import { updateShapeSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { executeWithVaultAuth } from "@/lib/db/vault-session";
import { eq, count } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [item] = await db.select().from(shapes).where(eq(shapes.id, id)).limit(1);
    if (!item) {
      const [itemBySlug] = await db.select().from(shapes).where(eq(shapes.slug, id)).limit(1);
      if (!itemBySlug) return errorResponse("Shape not found", 404);
      return successResponse(itemBySlug, "Shape retrieved successfully");
    }

    return successResponse(item, "Shape retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch shape", 500, error.message);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateShapeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const [existing] = await db.select().from(shapes).where(eq(shapes.id, id)).limit(1);
    if (!existing) return errorResponse("Shape not found", 404);

    const data = parsed.data;
    const updateData: Partial<typeof shapes.$inferInsert> = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug || generateSlug(data.name || existing.name);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(shapes)
      .set(updateData)
      .where(eq(shapes.id, id))
      .returning();

    return successResponse(updated, "Shape updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update shape", 500, error.message);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [item] = await db.select().from(shapes).where(eq(shapes.id, id)).limit(1);
    if (!item) return errorResponse("Shape not found", 404);

    // Check dependent products via product_shapes junction
    const countResult = await db
      .select({ count: count() })
      .from(productShapes)
      .where(eq(productShapes.shapeId, id));
    const linkedProducts = Number(countResult[0]?.count || 0);

    if (linkedProducts > 0) {
      return errorResponse(
        `Cannot delete shape. ${linkedProducts} product(s) are using this shape. Please remove the shape from those products first.`,
        400
      );
    }

    await executeWithVaultAuth(async () => {
      await db.delete(shapes).where(eq(shapes.id, id));
    });
    return successResponse(null, "Shape deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete shape", 500, error.message);
  }
}
