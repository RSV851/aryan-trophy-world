import { NextRequest } from "next/server";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, ne, and, isNull, desc } from "drizzle-orm";
import { z } from "zod";

const isUuid = (val: string) => z.string().uuid().safeParse(val).success;

// GET /api/v1/products/related/[id] - Returns 4 active products in the same category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;

    const whereCondition = isUuid(paramId)
      ? eq(products.id, paramId)
      : eq(products.slug, paramId);

    const targetProduct = await db
      .select({ id: products.id, categoryId: products.categoryId })
      .from(products)
      .where(whereCondition)
      .limit(1);

    if (targetProduct.length === 0) {
      return errorResponse("Product not found", 404);
    }

    const { id: productId, categoryId } = targetProduct[0];

    // Fetch up to 4 active related products from the same category
    const relatedList = await db.query.products.findMany({
      where: and(
        eq(products.categoryId, categoryId),
        ne(products.id, productId),
        eq(products.isActive, true),
        isNull(products.deletedAt)
      ),
      orderBy: [desc(products.createdAt)],
      limit: 4,
      with: {
        category: { columns: { name: true, slug: true } },
        type: { columns: { name: true, slug: true } },
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
        pricingMatrix: true,
      },
    });

    const transformed = relatedList.map((item) => {
      const primaryImage = item.images.find((img) => img.isPrimary) || item.images[0] || null;
      const prices = item.pricingMatrix.map(pm => Number(pm.pricePerPiece)).filter(p => !isNaN(p));
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        shortDescription: item.shortDescription,
        sizeUnit: item.sizeUnit,
        isFeatured: item.isFeatured,
        category: item.category,
        type: item.type,
        primaryImage: primaryImage ? { imageUrl: primaryImage.imageUrl, thumbnailUrl: primaryImage.thumbnailUrl, altText: primaryImage.altText } : null,
        priceRange: minPrice !== null ? { min: minPrice, max: maxPrice } : null,
      };
    });

    return successResponse(transformed, "Related products retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch related products", 500, error.message);
  }
}
