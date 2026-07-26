import { pgTable, uuid, unique, index } from "drizzle-orm/pg-core";
import { products } from "./products";
import { collections } from "./collections";

export const productCollections = pgTable("product_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  collectionId: uuid("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
}, (table) => [
  unique("product_collections_unq").on(table.productId, table.collectionId),
  index("product_collections_product_id_idx").on(table.productId),
  index("product_collections_collection_id_idx").on(table.collectionId),
]);

export type ProductCollection = typeof productCollections.$inferSelect;
export type NewProductCollection = typeof productCollections.$inferInsert;
