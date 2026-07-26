import { NextRequest } from "next/server";
import { db } from "@/db";
import { subcategories } from "@/db/schema";
import { createSubcategorySchema, paginationQuerySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils/slug";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { eq, ilike, count, asc, desc, and } from "drizzle-orm";

// GET /api/v1/subcategories - Public list (supports filtering by categoryId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

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

    const conditions = [];
    if (query.search) conditions.push(ilike(subcategories.name, `%${query.search}%`));
    if (categoryId) conditions.push(eq(subcategories.categoryId, categoryId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(subcategories)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const orderColumn = query.sortBy === "name" ? subcategories.name : subcategories.displayOrder;
    const orderByClause = query.sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

    const items = await db
      .select()
      .from(subcategories)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return paginatedResponse(items, page, limit, total, "Subcategories retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch subcategories", 500, error.message);
  }
}

// POST /api/v1/subcategories - Admin create
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSubcategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.name);

    const existing = await db.select().from(subcategories).where(eq(subcategories.slug, slug));
    if (existing.length > 0) {
      return errorResponse("Subcategory with this slug already exists", 400);
    }

    const [newSubcategory] = await db
      .insert(subcategories)
      .values({
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      })
      .returning();

    return successResponse(newSubcategory, "Subcategory created successfully", 201);
  } catch (error: any) {
    return errorResponse("Failed to create subcategory", 500, error.message);
  }
}
