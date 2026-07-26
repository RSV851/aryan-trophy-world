import { z } from "zod";

export const createMaterialSchema = z.object({
  name: z.string().min(1, "Material name is required").max(255).trim(),
  slug: z.string().max(255).trim().optional(),
  description: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
