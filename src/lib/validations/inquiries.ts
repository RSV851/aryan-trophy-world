import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const inquiryStatusEnum = z.enum(["new", "read", "replied", "closed"]);

export const inquiryProductItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
  name: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
});

export const createInquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255).trim(),
  company: z.string().max(255).trim().optional().nullable(),
  email: z.string().email("Invalid email address").max(255).trim(),
  phone: z.string().min(8, "Phone number must be at least 8 digits").max(50).trim(),
  city: z.string().max(100).trim().optional().nullable(),
  message: z.string().min(5, "Message must be at least 5 characters").trim(),
  products: z
    .array(inquiryProductItemSchema)
    .min(1, "At least one product must be selected for inquiry"),
});

export const updateInquiryStatusSchema = z.object({
  status: inquiryStatusEnum,
  adminNotes: z.string().trim().optional().nullable(),
});

export const inquiryQuerySchema = paginationQuerySchema.extend({
  status: inquiryStatusEnum.optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
export type InquiryQueryInput = z.infer<typeof inquiryQuerySchema>;
export type InquiryProductItemInput = z.infer<typeof inquiryProductItemSchema>;
