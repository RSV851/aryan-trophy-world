import { NextRequest } from "next/server";
import { db } from "@/db";
import { themes } from "@/db/schema";
import { createThemeSchema, paginationQuerySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { eq, ilike, count, asc, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = paginationQuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });

    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const whereClause = query.search ? ilike(themes.name, `%${query.search}%`) : undefined;

    const totalResult = await db.select({ count: count() }).from(themes).where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const items = await db
      .select()
      .from(themes)
      .where(whereClause)
      .orderBy(query.sortOrder === "asc" ? asc(themes.name) : desc(themes.name))
      .limit(limit)
      .offset(offset);

    return paginatedResponse(items, page, limit, total, "Themes retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch themes", 500, error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createThemeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.name);

    const existing = await db.select().from(themes).where(eq(themes.slug, slug));
    if (existing.length > 0) {
      return errorResponse("Theme with this slug already exists", 400);
    }

    const [newTheme] = await db
      .insert(themes)
      .values({
        name: data.name,
        slug,
        description: data.description,
        isActive: data.isActive,
      })
      .returning();

    return successResponse(newTheme, "Theme created successfully", 201);
  } catch (error: any) {
    return errorResponse("Failed to create theme", 500, error.message);
  }
}
