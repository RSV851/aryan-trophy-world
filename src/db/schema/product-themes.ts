import { pgTable, uuid, unique, index } from "drizzle-orm/pg-core";
import { products } from "./products";
import { themes } from "./themes";

export const productThemes = pgTable("product_themes", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  themeId: uuid("theme_id").notNull().references(() => themes.id, { onDelete: "cascade" }),
}, (table) => [
  unique("product_themes_unq").on(table.productId, table.themeId),
  index("product_themes_product_id_idx").on(table.productId),
  index("product_themes_theme_id_idx").on(table.themeId),
]);

export type ProductTheme = typeof productThemes.$inferSelect;
export type NewProductTheme = typeof productThemes.$inferInsert;
