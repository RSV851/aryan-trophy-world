import { pgTable, uuid, varchar, decimal, integer, timestamp, index } from "drizzle-orm/pg-core";
import { products } from "./products";

export const pricingMatrix = pgTable("pricing_matrix", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sizeLabel: varchar("size_label", { length: 100 }).notNull(),
  length: decimal("length", { precision: 10, scale: 2 }),
  width: decimal("width", { precision: 10, scale: 2 }),
  height: decimal("height", { precision: 10, scale: 2 }),
  weightKg: decimal("weight_kg", { precision: 10, scale: 3 }).notNull(),
  quantity: integer("quantity").notNull(),
  pricePerPiece: decimal("price_per_piece", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("pricing_matrix_composite_idx").on(table.productId, table.sizeLabel, table.quantity),
  index("pricing_matrix_product_id_idx").on(table.productId),
]);

export type PricingMatrix = typeof pricingMatrix.$inferSelect;
export type NewPricingMatrix = typeof pricingMatrix.$inferInsert;
