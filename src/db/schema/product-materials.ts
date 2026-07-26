import { pgTable, uuid, unique, index } from "drizzle-orm/pg-core";
import { products } from "./products";
import { materials } from "./materials";

export const productMaterials = pgTable("product_materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  materialId: uuid("material_id").notNull().references(() => materials.id, { onDelete: "cascade" }),
}, (table) => [
  unique("product_materials_unq").on(table.productId, table.materialId),
  index("product_materials_product_id_idx").on(table.productId),
  index("product_materials_material_id_idx").on(table.materialId),
]);

export type ProductMaterial = typeof productMaterials.$inferSelect;
export type NewProductMaterial = typeof productMaterials.$inferInsert;
