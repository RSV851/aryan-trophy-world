import { z } from "zod";

/**
 * Common pagination and query params schema for list endpoints.
 */
export const paginationQuerySchema = z.object({
  page: z.preprocess((val) => (val === null || val === '' ? undefined : val), z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess((val) => (val === null || val === '' ? undefined : val), z.coerce.number().int().min(1).max(100).default(10)),
  search: z.preprocess((val) => (val === null || val === '' ? undefined : val), z.string().trim().optional()),
  sortBy: z.preprocess((val) => (val === null || val === '' ? undefined : val), z.string().trim().optional()),
  sortOrder: z.preprocess((val) => (val === null || val === '' ? undefined : val), z.enum(["asc", "desc"]).default("desc")),
});

/**
 * Schema for validating UUID path parameters.
 */
export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

/**
 * Schema for validating slug path parameters.
 */
export const slugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required").trim(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
