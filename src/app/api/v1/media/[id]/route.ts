import { NextRequest } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq } from "drizzle-orm";
import { z } from "zod";

const isUuid = (val: string) => z.string().uuid().safeParse(val).success;

// DELETE /api/v1/media/[id] - Delete media record by UUID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return errorResponse("Invalid Media ID format", 400);
    }

    const [existing] = await db
      .select({ id: media.id })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    if (!existing) {
      return errorResponse("Media item not found", 404);
    }

    await db.delete(media).where(eq(media.id, id));

    return successResponse({ deleted: true, id }, "Media record deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete media item", 500, error.message);
  }
}
