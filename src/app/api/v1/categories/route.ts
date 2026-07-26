import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { createCategorySchema, paginationQuerySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { eq, ilike, count, asc, desc } from "drizzle-orm";

// GET /api/v1/categories - Public list
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

    const whereClause = query.search
      ? ilike(categories.name, `%${query.search}%`)
      : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(categories)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const orderColumn = query.sortBy === "name" ? categories.name : categories.displayOrder;
    const orderByClause = query.sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

    const items = await db
      .select()
      .from(categories)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return paginatedResponse(items, page, limit, total, "Categories retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch categories", 500, error.message);
  }
}

// POST /api/v1/categories - Admin create
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.name);

    // Check slug uniqueness
    const existing = await db.select().from(categories).where(eq(categories.slug, slug));
    if (existing.length > 0) {
      return errorResponse("Category with this slug already exists", 400);
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      })
      .returning();

    return successResponse(newCategory, "Category created successfully", 201);
  } catch (error: any) {
    return errorResponse("Failed to create category", 500, error.message);
  }
}
