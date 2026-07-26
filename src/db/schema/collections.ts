import { pgTable, uuid, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("collections_slug_idx").on(table.slug),
]);

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
