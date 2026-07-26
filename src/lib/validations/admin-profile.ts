import { z } from "zod";

export const updateAdminProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).trim(),
  email: z.string().email("Invalid email address").max(255).trim(),
  phone: z.string().max(50).trim().optional().nullable(),
  businessName: z.string().max(255).trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  city: z.string().max(100).trim().optional().nullable(),
  state: z.string().max(100).trim().optional().nullable(),
  pincode: z.string().max(20).trim().optional().nullable(),
  avatarUrl: z.string().trim().optional().nullable(),
  bio: z.string().trim().optional().nullable(),
});

export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
