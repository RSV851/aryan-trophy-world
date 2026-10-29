import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
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

    // Perform upsert (insert or update on duplicate key) in transaction with Promise.all
    await db.transaction(async (tx) => {
      const upsertItem = async (item: typeof updates[0]) => {
        const existing = await tx
          .select({ id: settings.id })
          .from(settings)
          .where(eq(settings.key, item.key))
          .limit(1);

        if (existing.length > 0) {
          // Auto-delete replaced old image from Supabase Storage
          const [oldSetting] = await tx.select().from(settings).where(eq(settings.key, item.key)).limit(1);
          const oldVal = typeof oldSetting?.value === 'string' ? oldSetting.value : '';
          const newVal = typeof item.value === 'string' ? item.value : '';

          if (oldVal && newVal && oldVal !== newVal && oldVal.includes('/branding/')) {
            try {
              const filename = oldVal.split('/branding/').pop()?.split('?')[0];
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
              const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
              if (filename && supabaseUrl && serviceRoleKey) {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(supabaseUrl, serviceRoleKey);
                await supabase.storage.from('branding').remove([filename]);
                console.log(`✓ Automatically deleted replaced old ${item.key} from Supabase Storage:`, filename);
              }
            } catch (err) {
              console.error('Failed to cleanup old setting file:', err);
            }
          }

          const [updated] = await tx
            .update(settings)
            .set({
              value: item.value,
              group: item.group,
              updatedAt: new Date(),
            })
            .where(eq(settings.key, item.key))
            .returning();
          return updated;
        } else {
          const [created] = await tx
            .insert(settings)
            .values({
              key: item.key,
              group: item.group,
              value: item.value,
            })
            .returning();
          return created;
        }
      };

      const res = await Promise.all(updates.map((item) => upsertItem(item)));
      results.push(...res);
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin', 'layout');
    } catch {
      // Ignore cache revalidation errors
    }

    return successResponse(results, "Settings updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update site settings", 500, error.message);
  }
}
