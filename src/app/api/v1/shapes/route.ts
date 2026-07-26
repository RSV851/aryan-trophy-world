import { NextRequest } from "next/server";
import { db } from "@/db";
import { shapes } from "@/db/schema";
import { createShapeSchema, paginationQuerySchema } from "@/lib/validations";
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

    const whereClause = query.search ? ilike(shapes.name, `%${query.search}%`) : undefined;

    const totalResult = await db.select({ count: count() }).from(shapes).where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const items = await db
      .select()
      .from(shapes)
      .where(whereClause)
      .orderBy(query.sortOrder === "asc" ? asc(shapes.name) : desc(shapes.name))
      .limit(limit)
      .offset(offset);

    return paginatedResponse(items, page, limit, total, "Shapes retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch shapes", 500, error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createShapeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.name);

    const existing = await db.select().from(shapes).where(eq(shapes.slug, slug));
    if (existing.length > 0) {
      return errorResponse("Shape with this slug already exists", 400);
    }

    const [newShape] = await db
      .insert(shapes)
      .values({
        name: data.name,
        slug,
        description: data.description,
        isActive: data.isActive,
      })
      .returning();

    return successResponse(newShape, "Shape created successfully", 201);
  } catch (error: any) {
    return errorResponse("Failed to create shape", 500, error.message);
  }
}
