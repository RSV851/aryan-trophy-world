import { pgTable, uuid, integer, index } from "drizzle-orm/pg-core";
import { inquiries } from "./inquiries";
import { products } from "./products";

export const inquiryProducts = pgTable("inquiry_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  inquiryId: uuid("inquiry_id").notNull().references(() => inquiries.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  quantity: integer("quantity").default(1).notNull(),
}, (table) => [
  index("inquiry_products_inquiry_id_idx").on(table.inquiryId),
  index("inquiry_products_product_id_idx").on(table.productId),
]);

export type InquiryProduct = typeof inquiryProducts.$inferSelect;
export type NewInquiryProduct = typeof inquiryProducts.$inferInsert;
