import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const sizeUnitEnum = z.enum(["cm", "inch", "mm", "feet"]);

export const pricingMatrixItemSchema = z.object({
  sizeLabel: z.string().min(1, "Size label is required").trim(),
  length: z.string().or(z.number()).optional().nullable(),
  width: z.string().or(z.number()).optional().nullable(),
  height: z.string().or(z.number()).optional().nullable(),
  weightKg: z
    .string()
    .or(z.number())
    .refine((val) => Number(val) > 0, "Weight must be greater than 0"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
  pricePerPiece: z
    .string()
    .or(z.number())
    .refine((val) => Number(val) >= 0, "Price per piece cannot be negative"),
});

export const productImageItemSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required").trim(),
  thumbnailUrl: z.string().trim().optional().nullable(),
  altText: z.string().trim().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255).trim(),
  slug: z.string().max(255).trim().optional(),
  sku: z.string().min(1, "SKU is required").max(100).trim(),
  shortDescription: z.string().trim().optional().nullable(),
  detailedDescription: z.string().trim().optional().nullable(),
  categoryId: z.string().uuid("Invalid category ID"),
  subcategoryId: z.string().uuid("Invalid subcategory ID").optional().nullable(),
  typeId: z.string().uuid("Invalid product type ID"),
  sizeUnit: sizeUnitEnum.default("cm"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  seoTitle: z.string().max(255).trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
  seoKeywords: z.string().max(500).trim().optional().nullable(),
  customizationOptions: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.any()).default({}),
  materialIds: z.array(z.string().uuid()).default([]),
  themeIds: z.array(z.string().uuid()).default([]),
  shapeIds: z.array(z.string().uuid()).default([]),
  collectionIds: z.array(z.string().uuid()).default([]),
  pricingMatrix: z.array(pricingMatrixItemSchema).min(1, "At least one pricing matrix row is required"),
  images: z.array(productImageItemSchema).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = paginationQuerySchema.extend({
  categorySlug: z.string().trim().optional(),
  subcategorySlug: z.string().trim().optional(),
  typeSlug: z.string().trim().optional(),
  materialSlug: z.string().trim().optional(),
  themeSlug: z.string().trim().optional(),
  shapeSlug: z.string().trim().optional(),
  collectionSlug: z.string().trim().optional(),
  isFeatured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type PricingMatrixItemInput = z.infer<typeof pricingMatrixItemSchema>;
export type ProductImageItemInput = z.infer<typeof productImageItemSchema>;
