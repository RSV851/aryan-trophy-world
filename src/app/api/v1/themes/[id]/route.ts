import { NextRequest } from "next/server";
import { db } from "@/db";
import { themes, productThemes } from "@/db/schema";
import { updateThemeSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, count } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [item] = await db.select().from(themes).where(eq(themes.id, id)).limit(1);
    if (!item) {
      const [itemBySlug] = await db.select().from(themes).where(eq(themes.slug, id)).limit(1);
      if (!itemBySlug) return errorResponse("Theme not found", 404);
      return successResponse(itemBySlug, "Theme retrieved successfully");
    }

    return successResponse(item, "Theme retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch theme", 500, error.message);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateThemeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const [existing] = await db.select().from(themes).where(eq(themes.id, id)).limit(1);
    if (!existing) return errorResponse("Theme not found", 404);

    const data = parsed.data;
    const updateData: Partial<typeof themes.$inferInsert> = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug || generateSlug(data.name || existing.name);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(themes)
      .set(updateData)
      .where(eq(themes.id, id))
      .returning();

    return successResponse(updated, "Theme updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update theme", 500, error.message);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [item] = await db.select().from(themes).where(eq(themes.id, id)).limit(1);
    if (!item) return errorResponse("Theme not found", 404);

    // Check dependent products via product_themes junction
    const countResult = await db
      .select({ count: count() })
      .from(productThemes)
      .where(eq(productThemes.themeId, id));
    const linkedProducts = Number(countResult[0]?.count || 0);

    if (linkedProducts > 0) {
      return errorResponse(
        `Cannot delete theme. ${linkedProducts} product(s) are using this theme. Please remove the theme from those products first.`,
        400
      );
    }

    await db.delete(themes).where(eq(themes.id, id));
    return successResponse(null, "Theme deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete theme", 500, error.message);
  }
}
