import { NextRequest } from "next/server";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { createCollectionSchema, paginationQuerySchema } from "@/lib/validations";
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

    const whereClause = query.search ? ilike(collections.name, `%${query.search}%`) : undefined;

    const totalResult = await db.select({ count: count() }).from(collections).where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const items = await db
      .select()
      .from(collections)
      .where(whereClause)
      .orderBy(query.sortOrder === "asc" ? asc(collections.name) : desc(collections.name))
      .limit(limit)
      .offset(offset);

    return paginatedResponse(items, page, limit, total, "Collections retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch collections", 500, error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.name);

    const existing = await db.select().from(collections).where(eq(collections.slug, slug));
    if (existing.length > 0) {
      return errorResponse("Collection with this slug already exists", 400);
    }

    const [newCollection] = await db
      .insert(collections)
      .values({
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
      })
      .returning();

    return successResponse(newCollection, "Collection created successfully", 201);
  } catch (error: any) {
    return errorResponse("Failed to create collection", 500, error.message);
  }
}
