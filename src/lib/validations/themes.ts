import { z } from "zod";

export const createThemeSchema = z.object({
  name: z.string().min(1, "Theme name is required").max(255).trim(),
  slug: z.string().max(255).trim().optional(),
  description: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateThemeSchema = createThemeSchema.partial();

export type CreateThemeInput = z.infer<typeof createThemeSchema>;
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;
