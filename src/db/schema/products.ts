import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { subcategories } from "./subcategories";
import { productTypes } from "./product-types";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  shortDescription: text("short_description"),
  detailedDescription: text("detailed_description"),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  subcategoryId: uuid("subcategory_id").references(() => subcategories.id, { onDelete: "set null" }),
  typeId: uuid("type_id").notNull().references(() => productTypes.id, { onDelete: "restrict" }),
  sizeUnit: varchar("size_unit", { length: 10 }).default("cm").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  seoKeywords: varchar("seo_keywords", { length: 500 }),
  customizationOptions: jsonb("customization_options").default([]),
  specifications: jsonb("specifications").default({}),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
}, (table) => [
  index("products_slug_idx").on(table.slug),
  index("products_sku_idx").on(table.sku),
  index("products_category_id_idx").on(table.categoryId),
  index("products_subcategory_id_idx").on(table.subcategoryId),
  index("products_type_id_idx").on(table.typeId),
]);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
