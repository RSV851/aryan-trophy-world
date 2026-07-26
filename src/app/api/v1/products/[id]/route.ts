import { NextRequest } from "next/server";
import { db } from "@/db";
import { 
  products, 
  productMaterials, 
  productThemes, 
  productShapes, 
  productCollections, 
  productImages, 
  pricingMatrix 
} from "@/db/schema";
import { updateProductSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq, or, and, isNull, ne } from "drizzle-orm";
import { z } from "zod";

const isUuid = (val: string) => z.string().uuid().safeParse(val).success;

// GET /api/v1/products/[id_or_slug] - Full details with ALL relational joins
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;

    const whereCondition = isUuid(paramId)
      ? and(eq(products.id, paramId), isNull(products.deletedAt))
      : and(eq(products.slug, paramId), isNull(products.deletedAt));

    const product = await db.query.products.findFirst({
      where: whereCondition,
      with: {
        category: true,
        subcategory: true,
        type: true,
        productMaterials: { with: { material: true } },
        productThemes: { with: { theme: true } },
        productShapes: { with: { shape: true } },
        productCollections: { with: { collection: true } },
        images: { orderBy: (images, { asc }) => [asc(images.displayOrder)] },
        pricingMatrix: true,
      },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    // Flatten junctions for cleaner frontend consumption
    const formattedResponse = {
      ...product,
      materials: product.productMaterials.map(pm => pm.material),
      themes: product.productThemes.map(pt => pt.theme),
      shapes: product.productShapes.map(ps => ps.shape),
      collections: product.productCollections.map(pc => pc.collection),
    };

    delete (formattedResponse as any).productMaterials;
    delete (formattedResponse as any).productThemes;
    delete (formattedResponse as any).productShapes;
    delete (formattedResponse as any).productCollections;

    return successResponse(formattedResponse, "Product retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch product", 500, error.message);
  }
}

// PUT /api/v1/products/[id] - Admin Update in atomic transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return errorResponse("Invalid Product ID format", 400);
    }

    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .limit(1);

    if (!existing) {
      return errorResponse("Product not found", 404);
    }

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;

    // Check slug / SKU conflicts if updated
    if (data.slug) {
      const slugCheck = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.slug, data.slug), ne(products.id, id)))
        .limit(1);
      if (slugCheck.length > 0) return errorResponse("Product slug already taken", 400);
    }

    if (data.sku) {
      const skuCheck = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.sku, data.sku), ne(products.id, id)))
        .limit(1);
      if (skuCheck.length > 0) return errorResponse("Product SKU already taken", 400);
    }

    const updatedProduct = await db.transaction(async (tx) => {
      // 1. Update basic product table fields
      const [updated] = await tx
        .update(products)
        .set({
          ...(data.name !== undefined && { name: data.name }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.sku !== undefined && { sku: data.sku }),
          ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
          ...(data.detailedDescription !== undefined && { detailedDescription: data.detailedDescription }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.subcategoryId !== undefined && { subcategoryId: data.subcategoryId || null }),
          ...(data.typeId !== undefined && { typeId: data.typeId }),
          ...(data.sizeUnit !== undefined && { sizeUnit: data.sizeUnit }),
          ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
          ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
          ...(data.seoKeywords !== undefined && { seoKeywords: data.seoKeywords }),
          ...(data.customizationOptions !== undefined && { customizationOptions: data.customizationOptions }),
          ...(data.specifications !== undefined && { specifications: data.specifications }),
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      // 2. Replace Materials if supplied
      if (data.materialIds !== undefined) {
        await tx.delete(productMaterials).where(eq(productMaterials.productId, id));
        if (data.materialIds.length > 0) {
          await tx.insert(productMaterials).values(
            data.materialIds.map((matId) => ({ productId: id, materialId: matId }))
          );
        }
      }

      // 3. Replace Themes if supplied
      if (data.themeIds !== undefined) {
        await tx.delete(productThemes).where(eq(productThemes.productId, id));
        if (data.themeIds.length > 0) {
          await tx.insert(productThemes).values(
            data.themeIds.map((thmId) => ({ productId: id, themeId: thmId }))
          );
        }
      }

      // 4. Replace Shapes if supplied
      if (data.shapeIds !== undefined) {
        await tx.delete(productShapes).where(eq(productShapes.productId, id));
        if (data.shapeIds.length > 0) {
          await tx.insert(productShapes).values(
            data.shapeIds.map((shpId) => ({ productId: id, shapeId: shpId }))
          );
        }
      }

      // 5. Replace Collections if supplied
      if (data.collectionIds !== undefined) {
        await tx.delete(productCollections).where(eq(productCollections.productId, id));
        if (data.collectionIds.length > 0) {
          await tx.insert(productCollections).values(
            data.collectionIds.map((colId) => ({ productId: id, collectionId: colId }))
          );
        }
      }

      // 6. Replace Pricing Matrix if supplied
      if (data.pricingMatrix !== undefined) {
        await tx.delete(pricingMatrix).where(eq(pricingMatrix.productId, id));
        if (data.pricingMatrix.length > 0) {
          await tx.insert(pricingMatrix).values(
            data.pricingMatrix.map((pm) => ({
              productId: id,
              sizeLabel: pm.sizeLabel,
              length: pm.length != null ? pm.length.toString() : null,
              width: pm.width != null ? pm.width.toString() : null,
              height: pm.height != null ? pm.height.toString() : null,
              weightKg: pm.weightKg.toString(),
              quantity: Number(pm.quantity),
              pricePerPiece: pm.pricePerPiece.toString(),
            }))
          );
        }
      }

      // 7. Replace Images if supplied
      if (data.images !== undefined) {
        await tx.delete(productImages).where(eq(productImages.productId, id));
        if (data.images.length > 0) {
          await tx.insert(productImages).values(
            data.images.map((img, index) => ({
              productId: id,
              imageUrl: img.imageUrl,
              thumbnailUrl: img.thumbnailUrl || null,
              altText: img.altText || data.name || updated.name,
              displayOrder: img.displayOrder !== undefined ? img.displayOrder : index,
              isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
            }))
          );
        }
      }

      return updated;
    });

    return successResponse(updatedProduct, "Product updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update product", 500, error.message);
  }
}

// DELETE /api/v1/products/[id] - Soft Delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return errorResponse("Invalid Product ID format", 400);
    }

    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .limit(1);

    if (!existing) {
      return errorResponse("Product not found or already deleted", 404);
    }

    // Perform soft-delete
    await db
      .update(products)
      .set({
        deletedAt: new Date(),
        isActive: false,
      })
      .where(eq(products.id, id));

    return successResponse({ deleted: true, id }, "Product soft deleted successfully");
  } catch (error: any) {
    return errorResponse("Failed to delete product", 500, error.message);
  }
}
