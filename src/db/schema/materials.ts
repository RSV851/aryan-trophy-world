import { pgTable, uuid, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const materials = pgTable("materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("materials_slug_idx").on(table.slug),
]);

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;
