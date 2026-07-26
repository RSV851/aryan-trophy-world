import { pgTable, uuid, unique, index } from "drizzle-orm/pg-core";
import { products } from "./products";
import { shapes } from "./shapes";

export const productShapes = pgTable("product_shapes", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  shapeId: uuid("shape_id").notNull().references(() => shapes.id, { onDelete: "cascade" }),
}, (table) => [
  unique("product_shapes_unq").on(table.productId, table.shapeId),
  index("product_shapes_product_id_idx").on(table.productId),
  index("product_shapes_shape_id_idx").on(table.shapeId),
]);

export type ProductShape = typeof productShapes.$inferSelect;
export type NewProductShape = typeof productShapes.$inferInsert;
