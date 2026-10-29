import { NextRequest } from "next/server";
import { db } from "@/db";
import { 
  products, 
  collections,
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
          ...(data.isBestseller !== undefined && { isBestseller: data.isBestseller }),
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

      // 2. Parallel Replacement Tasks for independent junction & child entities
      const tasks: Promise<any>[] = [];

      // Replace Materials
      if (data.materialIds !== undefined) {
        tasks.push(
          (async () => {
            await tx.delete(productMaterials).where(eq(productMaterials.productId, id));
            if (data.materialIds!.length > 0) {
              await tx.insert(productMaterials).values(
                data.materialIds!.map((matId) => ({ productId: id, materialId: matId }))
              );
            }
          })()
        );
      }

      // Replace Themes
      if (data.themeIds !== undefined) {
        tasks.push(
          (async () => {
            await tx.delete(productThemes).where(eq(productThemes.productId, id));
            if (data.themeIds!.length > 0) {
              await tx.insert(productThemes).values(
                data.themeIds!.map((thmId) => ({ productId: id, themeId: thmId }))
              );
            }
          })()
        );
      }

      // Replace Shapes
      if (data.shapeIds !== undefined) {
        tasks.push(
          (async () => {
            await tx.delete(productShapes).where(eq(productShapes.productId, id));
            if (data.shapeIds!.length > 0) {
              await tx.insert(productShapes).values(
                data.shapeIds!.map((shpId) => ({ productId: id, shapeId: shpId }))
              );
            }
          })()
        );
      }

      // Replace Collections with Auto-Sync for Featured & Best Sellers
      if (data.collectionIds !== undefined || data.isFeatured !== undefined || data.isBestseller !== undefined) {
        tasks.push(
          (async () => {
            let currentCols = await tx.select({ collectionId: productCollections.collectionId }).from(productCollections).where(eq(productCollections.productId, id));
            let targetColIds = data.collectionIds !== undefined ? [...data.collectionIds] : currentCols.map((c) => c.collectionId);

            const activeFeatured = data.isFeatured !== undefined ? data.isFeatured : updated.isFeatured;
            const activeBestseller = data.isBestseller !== undefined ? data.isBestseller : updated.isBestseller;

            const [featCol, bestCol] = await Promise.all([
              tx.select().from(collections).where(eq(collections.slug, 'featured')).limit(1).then((res) => res[0]),
              tx.select().from(collections).where(eq(collections.slug, 'best-sellers')).limit(1).then((res) => res[0]),
            ]);

            if (featCol) {
              if (activeFeatured && !targetColIds.includes(featCol.id)) {
                targetColIds.push(featCol.id);
              } else if (!activeFeatured) {
                targetColIds = targetColIds.filter((cid) => cid !== featCol.id);
              }
            }

            if (bestCol) {
              if (activeBestseller && !targetColIds.includes(bestCol.id)) {
                targetColIds.push(bestCol.id);
              } else if (!activeBestseller) {
                targetColIds = targetColIds.filter((cid) => cid !== bestCol.id);
              }
            }

            await tx.delete(productCollections).where(eq(productCollections.productId, id));
            if (targetColIds.length > 0) {
              await tx.insert(productCollections).values(
                targetColIds.map((colId) => ({ productId: id, collectionId: colId }))
              );
            }
          })()
        );
      }

      // Replace Pricing Matrix
      if (data.pricingMatrix !== undefined) {
        tasks.push(
          (async () => {
            await tx.delete(pricingMatrix).where(eq(pricingMatrix.productId, id));
            if (data.pricingMatrix!.length > 0) {
              await tx.insert(pricingMatrix).values(
                data.pricingMatrix!.map((pm) => ({
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
          })()
        );
      }

      // Execute all DB replacement tasks in parallel
      await Promise.all(tasks);

      // Phase 3: Replace Images if supplied & cleanup deleted files from Storage
      if (data.images !== undefined) {
        const oldImages = await tx.select().from(productImages).where(eq(productImages.productId, id));
        const newUrls = new Set(data.images.map((i) => i.imageUrl));

        for (const oldImg of oldImages) {
          if (oldImg.imageUrl && !newUrls.has(oldImg.imageUrl) && oldImg.imageUrl.includes('/products/')) {
            try {
              const filename = oldImg.imageUrl.split('/products/').pop()?.split('?')[0];
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
              const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
              if (filename && supabaseUrl && serviceRoleKey) {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(supabaseUrl, serviceRoleKey);
                await supabase.storage.from('products').remove([filename]);
                console.log('✓ Automatically deleted removed product image from Supabase Storage:', filename);
              }
            } catch (err) {
              console.error('Failed to cleanup old product image file:', err);
            }
          }
        }

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
