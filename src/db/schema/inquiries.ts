import { pgTable, pgEnum, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";

export const inquiryStatusEnum = pgEnum("inquiry_status_enum", ["new", "read", "replied", "closed"]);

export const inquiries = pgTable("inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  city: varchar("city", { length: 100 }),
  message: text("message").notNull(),
  status: inquiryStatusEnum("status").default("new").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("inquiries_status_idx").on(table.status),
  index("inquiries_created_at_idx").on(table.createdAt),
]);

export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
