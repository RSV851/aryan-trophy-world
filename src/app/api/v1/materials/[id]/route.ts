import { NextRequest } from "next/server";
import { db } from "@/db";
import { materials, productMaterials } from "@/db/schema";
import { updateMaterialSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, count } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [item] = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
    if (!item) {
      const [itemBySlug] = await db.select().from(materials).where(eq(materials.slug, id)).limit(1);
      if (!itemBySlug) return errorResponse("Material not found", 404);
      return successResponse(itemBySlug, "Material retrieved successfully");
    }

    return successResponse(item, "Material retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch material", 500, error.message);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateMaterialSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const [existing] = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
    if (!existing) return errorResponse("Material not found", 404);

    const data = parsed.data;
    const updateData: Partial<typeof materials.$inferInsert> = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug || generateSlug(data.name || existing.name);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(materials)
      .set(updateData)
      .where(eq(materials.id, id))
      .returning();

    return successResponse(updated, "Material updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update material", 500, error.message);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [item] = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
    if (!item) return errorResponse("Material not found", 404);

    // Check dependent products via product_materials junction
    const countResult = await db
      .select({ count: count() })
      .from(productMaterials)
      .where(eq(productMaterials.materialId, id));
    const linkedProducts = Number(countResult[0]?.count || 0);

    if (linkedProducts > 0) {
      return errorResponse(
        `Cannot delete material. ${linkedProducts} product(s) are using this material. Please remove the material from those products first.`,
        400
      );
    }

    await db.delete(materials).where(eq(materials.id, id));
    return successResponse(null, "Material deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete material", 500, error.message);
  }
}
