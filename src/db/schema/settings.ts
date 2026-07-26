import { pgTable, uuid, varchar, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  group: varchar("group", { length: 100 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("settings_key_idx").on(table.key),
  index("settings_group_idx").on(table.group),
]);

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
