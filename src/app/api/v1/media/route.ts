import { NextRequest } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { paginationQuerySchema } from "@/lib/validations";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { eq, ilike, count, asc, desc, or } from "drizzle-orm";
import { z } from "zod";

const createMediaSchema = z.object({
  filename: z.string().min(1, "Filename is required").max(255),
  originalFilename: z.string().min(1, "Original filename is required").max(255),
  url: z.string().url("Invalid URL"),
  thumbnailUrl: z.string().url().optional().nullable(),
  mimeType: z.string().max(100),
  sizeBytes: z.coerce.number().int().nonnegative(),
  width: z.coerce.number().int().optional().nullable(),
  height: z.coerce.number().int().optional().nullable(),
  altText: z.string().max(255).optional().nullable(),
  folder: z.string().max(100).default("general"),
});

// GET /api/v1/media - Paginated list of media items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = paginationQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? "createdAt",
      sortOrder: searchParams.get("sortOrder") ?? "desc",
    });

    const folder = searchParams.get("folder") || undefined;

    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (folder) {
      conditions.push(eq(media.folder, folder));
    }

    if (query.search) {
      conditions.push(
        or(
          ilike(media.filename, `%${query.search}%`),
          ilike(media.originalFilename, `%${query.search}%`),
          ilike(media.altText, `%${query.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? conditions[0] : undefined; // simple single or condition combination

    const totalResult = await db
      .select({ count: count() })
      .from(media)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const orderColumn = query.sortBy === "filename" ? media.filename : media.createdAt;
    const orderByClause = query.sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

    const items = await db
      .select()
      .from(media)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return paginatedResponse(items, page, limit, total, "Media items retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch media list", 500, error.message);
  }
}

// POST /api/v1/media - Register new uploaded media file metadata
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createMediaSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;

    const [created] = await db
      .insert(media)
      .values({
        filename: data.filename,
        originalFilename: data.originalFilename,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl || null,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        width: data.width || null,
        height: data.height || null,
        altText: data.altText || data.originalFilename,
        folder: data.folder,
      })
      .returning();

    return successResponse(created, "Media record created successfully", 201);
  } catch (error: any) {
    return errorResponse("Failed to register media item", 500, error.message);
  }
}
