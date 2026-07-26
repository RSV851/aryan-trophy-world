import { NextRequest } from "next/server";
import { db } from "@/db";
import { materials } from "@/db/schema";
import { createMaterialSchema, paginationQuerySchema } from "@/lib/validations";
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

    const whereClause = query.search ? ilike(materials.name, `%${query.search}%`) : undefined;

    const totalResult = await db.select({ count: count() }).from(materials).where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const items = await db
      .select()
      .from(materials)
      .where(whereClause)
      .orderBy(query.sortOrder === "asc" ? asc(materials.name) : desc(materials.name))
      .limit(limit)
      .offset(offset);

    return paginatedResponse(items, page, limit, total, "Materials retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch materials", 500, error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createMaterialSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.name);

    const existing = await db.select().from(materials).where(eq(materials.slug, slug));
    if (existing.length > 0) {
      return errorResponse("Material with this slug already exists", 400);
    }

    const [newMaterial] = await db
      .insert(materials)
      .values({
        name: data.name,
        slug,
        description: data.description,
        isActive: data.isActive,
      })
      .returning();

    return successResponse(newMaterial, "Material created successfully", 201);
  } catch (error: any) {
    return errorResponse("Failed to create material", 500, error.message);
  }
}
