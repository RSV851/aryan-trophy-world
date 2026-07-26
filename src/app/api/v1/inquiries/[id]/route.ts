import { NextRequest } from "next/server";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { updateInquiryStatusSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq } from "drizzle-orm";
import { z } from "zod";

const isUuid = (val: string) => z.string().uuid().safeParse(val).success;

// GET /api/v1/inquiries/[id] - Admin view single inquiry detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return errorResponse("Invalid Inquiry ID format", 400);
    }

    const inquiry = await db.query.inquiries.findFirst({
      where: eq(inquiries.id, id),
      with: {
        inquiryProducts: {
          with: {
            product: {
              with: {
                category: { columns: { name: true } },
                type: { columns: { name: true } },
                images: {
                  where: (images, { eq }) => eq(images.isPrimary, true),
                  limit: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!inquiry) {
      return errorResponse("Inquiry not found", 404);
    }

    const linkedProducts = inquiry.inquiryProducts.map((ip) => {
      const p = ip.product;
      const primaryImg = p?.images?.[0] || null;
      return {
        inquiryProductId: ip.id,
        productId: ip.productId,
        quantity: ip.quantity,
        productDetails: p ? {
          name: p.name,
          sku: p.sku,
          slug: p.slug,
          sizeUnit: p.sizeUnit,
          categoryName: p.category?.name,
          typeName: p.type?.name,
          primaryImage: primaryImg ? primaryImg.imageUrl : null,
        } : null,
      };
    });

    const formatted = {
      id: inquiry.id,
      name: inquiry.name,
      company: inquiry.company,
      email: inquiry.email,
      phone: inquiry.phone,
      city: inquiry.city,
      message: inquiry.message,
      status: inquiry.status,
      adminNotes: inquiry.adminNotes,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
      linkedProducts,
    };

    return successResponse(formatted, "Inquiry retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch inquiry detail", 500, error.message);
  }
}

// PUT /api/v1/inquiries/[id] - Admin update status & notes
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return errorResponse("Invalid Inquiry ID format", 400);
    }

    const body = await request.json();
    const parsed = updateInquiryStatusSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const [existing] = await db.select({ id: inquiries.id }).from(inquiries).where(eq(inquiries.id, id)).limit(1);
    if (!existing) {
      return errorResponse("Inquiry not found", 404);
    }

    const [updated] = await db
      .update(inquiries)
      .set({
        status: parsed.data.status,
        ...(parsed.data.adminNotes !== undefined && { adminNotes: parsed.data.adminNotes || null }),
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, id))
      .returning();

    return successResponse(updated, "Inquiry updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update inquiry", 500, error.message);
  }
}

// DELETE /api/v1/inquiries/[id] - Admin delete inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return errorResponse("Invalid Inquiry ID format", 400);
    }

    const [existing] = await db.select({ id: inquiries.id }).from(inquiries).where(eq(inquiries.id, id)).limit(1);
    if (!existing) {
      return errorResponse("Inquiry not found", 404);
    }

    await db.delete(inquiries).where(eq(inquiries.id, id));

    return successResponse({ deleted: true, id }, "Inquiry deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete inquiry", 500, error.message);
  }
}
