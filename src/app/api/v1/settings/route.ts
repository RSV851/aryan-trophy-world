import { NextRequest } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { updateSettingSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const bulkUpdateSettingsSchema = z.union([
  updateSettingSchema,
  z.array(updateSettingSchema).min(1, "At least one setting required for update"),
]);

// GET /api/v1/settings - Get settings (can filter by group or return all / public subset)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");
    const isPublicOnly = searchParams.get("public") === "true";

    let whereClause = undefined;
    if (group) {
      whereClause = eq(settings.group, group);
    } else if (isPublicOnly) {
      // Return general public subsets (branding, contact, social, seo)
      whereClause = inArray(settings.group, ["branding", "contact", "social", "seo", "general"]);
    }

    const items = await db
      .select()
      .from(settings)
      .where(whereClause);

    // Also build an accessible key-value map for quick frontend UI rendering
    const settingsMap: Record<string, any> = {};
    items.forEach((item) => {
      settingsMap[item.key] = item.value;
    });

    return successResponse(
      { list: items, map: settingsMap },
      "Settings retrieved successfully"
    );
  } catch (error: any) {
    return errorResponse("Failed to fetch site settings", 500, error.message);
  }
}

// PUT /api/v1/settings - Admin Upsert (Single or Bulk Settings)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bulkUpdateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const updates = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    const results: any[] = [];

    // Perform upsert (insert or update on duplicate key) in transaction
    await db.transaction(async (tx) => {
      for (const item of updates) {
        const existing = await tx
          .select({ id: settings.id })
          .from(settings)
          .where(eq(settings.key, item.key))
          .limit(1);

        if (existing.length > 0) {
          const [updated] = await tx
            .update(settings)
            .set({
              value: item.value,
              group: item.group,
              updatedAt: new Date(),
            })
            .where(eq(settings.key, item.key))
            .returning();
          results.push(updated);
        } else {
          const [created] = await tx
            .insert(settings)
            .values({
              key: item.key,
              group: item.group,
              value: item.value,
            })
            .returning();
          results.push(created);
        }
      }
    });

    return successResponse(results, "Settings updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update site settings", 500, error.message);
  }
}
