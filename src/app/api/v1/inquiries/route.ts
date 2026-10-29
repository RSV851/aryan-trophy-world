import { NextRequest } from "next/server";
import { db } from "@/db";
import { inquiries, inquiryProducts } from "@/db/schema";
import { createInquirySchema, inquiryQuerySchema } from "@/lib/validations";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { eq, ilike, count, asc, desc, or, and } from "drizzle-orm";

// POST /api/v1/inquiries - Public multi-product inquiry submission (Rate limited in middleware)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createInquirySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;

    const createdInquiry = await db.transaction(async (tx) => {
      // Create a clear summary of all attached SKUs and quantities for Admin CMS viewing
      let formattedMessage = data.message;
      if (data.products && data.products.length > 0) {
        const skuDetails = data.products
          .map((p) => `${p.name || "Trophy"} (SKU: ${p.sku || p.productId}, Qty: ${p.quantity})`)
          .join(" | ");
        formattedMessage = `[Attached Quotation SKUs: ${skuDetails}]\n\n${data.message}`;
      }

      // 1. Insert core inquiry info
      const [newInquiry] = await tx
        .insert(inquiries)
        .values({
          name: data.name,
          company: data.company || null,
          email: data.email,
          phone: data.phone,
          city: data.city || null,
          message: formattedMessage,
          status: "new",
        })
        .returning();

      // 2. Safely insert linked database items (only valid UUIDs that exist in PostgreSQL schema)
      const validDbProducts = data.products.filter((p) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.productId)
      );
      if (validDbProducts.length > 0) {
        await tx.insert(inquiryProducts).values(
          validDbProducts.map((p) => ({
            inquiryId: newInquiry.id,
            productId: p.productId,
            quantity: p.quantity,
          }))
        );
      }

      return newInquiry;
    });

    return successResponse(
      createdInquiry,
      "Inquiry submitted successfully. We will get back to you soon!",
      201
    );
  } catch (error: any) {
    return errorResponse("Failed to submit inquiry", 500, error.message);
  }
}

// GET /api/v1/inquiries - Admin List view with linked product names & quantities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = inquiryQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? "createdAt",
      sortOrder: searchParams.get("sortOrder") ?? "desc",
      status: searchParams.get("status") ?? undefined,
    });

    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.status) {
      conditions.push(eq(inquiries.status, query.status));
    }

    if (query.search) {
      conditions.push(
        or(
          ilike(inquiries.name, `%${query.search}%`),
          ilike(inquiries.company, `%${query.search}%`),
          ilike(inquiries.email, `%${query.search}%`),
          ilike(inquiries.phone, `%${query.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(inquiries)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const orderColumn = query.sortBy === "name" ? inquiries.name : inquiries.createdAt;
    const orderByClause = query.sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

    const inquiryList = await db.query.inquiries.findMany({
      where: whereClause,
      orderBy: orderByClause,
      limit,
      offset,
      with: {
        inquiryProducts: {
          with: {
            product: {
              columns: { id: true, name: true, sku: true, slug: true },
            },
          },
        },
      },
    });

    // Format output to present clean product arrays
    const formatted = inquiryList.map((item) => {
      const linkedProducts = item.inquiryProducts.map((ip) => ({
        inquiryProductId: ip.id,
        productId: ip.productId,
        quantity: ip.quantity,
        product: ip.product || { name: "Product Deleted or Missing", sku: "N/A", slug: "#" },
      }));

      return {
        id: item.id,
        name: item.name,
        company: item.company,
        email: item.email,
        phone: item.phone,
        city: item.city,
        message: item.message,
        status: item.status,
        adminNotes: item.adminNotes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        linkedProducts,
        totalProducts: linkedProducts.length,
        totalItems: linkedProducts.reduce((sum, p) => sum + p.quantity, 0),
      };
    });

    return paginatedResponse(formatted, page, limit, total, "Inquiries retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch inquiries", 500, error.message);
  }
}
