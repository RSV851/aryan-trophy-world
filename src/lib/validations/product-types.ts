import { z } from "zod";

export const createProductTypeSchema = z.object({
  name: z.string().min(1, "Product type name is required").max(255).trim(),
  slug: z.string().max(255).trim().optional(),
  description: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateProductTypeSchema = createProductTypeSchema.partial();

export type CreateProductTypeInput = z.infer<typeof createProductTypeSchema>;
export type UpdateProductTypeInput = z.infer<typeof updateProductTypeSchema>;
