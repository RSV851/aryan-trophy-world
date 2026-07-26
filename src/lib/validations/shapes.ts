import { z } from "zod";

export const createShapeSchema = z.object({
  name: z.string().min(1, "Shape name is required").max(255).trim(),
  slug: z.string().max(255).trim().optional(),
  description: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateShapeSchema = createShapeSchema.partial();

export type CreateShapeInput = z.infer<typeof createShapeSchema>;
export type UpdateShapeInput = z.infer<typeof updateShapeSchema>;
