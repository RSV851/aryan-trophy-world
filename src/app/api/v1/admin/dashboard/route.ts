import { NextRequest } from "next/server";
import { db } from "@/db";
import { products, inquiries, categories, inquiryProducts } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, isNull, count, desc, and } from "drizzle-orm";

// GET /api/v1/admin/dashboard - Real-time Executive Admin Dashboard Diagnostics
export async function GET(request: NextRequest) {
  try {
    const [
      [productsRes],
      [inquiriesRes],
      [newInquiriesRes],
      [categoriesRes],
      rawRecentInquiries
    ] = await Promise.all([
      // 1. Active Products Count
      db
        .select({ count: count() })
        .from(products)
        .where(and(isNull(products.deletedAt), eq(products.isActive, true))),

      // 2. Total Inquiries Count
      db
        .select({ count: count() })
        .from(inquiries),

      // 3. New Pending Inquiries Count
      db
        .select({ count: count() })
        .from(inquiries)
        .where(eq(inquiries.status, "new")),

      // 4. Master Categories Count
      db
        .select({ count: count() })
        .from(categories),

      // 5. Top 5 Recent Customer Inquiries
      db.query.inquiries.findMany({
        orderBy: [desc(inquiries.createdAt)],
        limit: 5,
        with: {
          inquiryProducts: {
            columns: { productId: true, quantity: true },
          },
        },
      }),
    ]);

    const stats = {
      productsCount: Number(productsRes?.count || 0),
      inquiriesCount: Number(inquiriesRes?.count || 0),
      newInquiriesCount: Number(newInquiriesRes?.count || 0),
      categoriesCount: Number(categoriesRes?.count || 0),
    };

    const recentInquiries = rawRecentInquiries.map((inq) => ({
      id: inq.id,
      name: inq.name,
      email: inq.email,
      company: inq.company || null,
      status: inq.status,
      createdAt: inq.createdAt.toISOString(),
      itemCount: inq.inquiryProducts?.length || 0,
      products: inq.inquiryProducts || [],
    }));

    return successResponse(
      {
        stats,
        recentInquiries,
      },
      "Real-time Executive Dashboard diagnostics fetched successfully"
    );
  } catch (error: any) {
    return errorResponse("Failed to fetch dashboard diagnostics", 500, error.message);
  }
}
