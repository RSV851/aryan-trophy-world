import { z } from "zod";

export const siteInfoSettingsSchema = z.object({
  site_name: z.string().min(1, "Site name is required").trim(),
  tagline: z.string().trim().optional(),
  logo_url: z.string().trim().optional(),
  contact_email: z.string().email("Invalid email").trim(),
  contact_phone: z.string().min(5, "Phone is required").trim(),
  address: z.string().trim().optional(),
});

export const seoSettingsSchema = z.object({
  seo_title: z.string().min(1, "SEO title is required").trim(),
  seo_description: z.string().min(1, "SEO description is required").trim(),
  seo_keywords: z.string().trim().optional(),
});

export const socialLinksSettingsSchema = z.object({
  facebook: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  twitter: z.string().trim().optional(),
  linkedin: z.string().trim().optional(),
});

export const updateSettingSchema = z.object({
  key: z.string().min(1, "Setting key is required").trim(),
  group: z.string().min(1, "Setting group is required").trim(),
  value: z.record(z.string(), z.any()).or(z.array(z.any())).or(z.string()),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
