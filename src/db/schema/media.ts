import { pgTable, uuid, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: varchar("alt_text", { length: 255 }),
  folder: varchar("folder", { length: 100 }).default("general").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("media_filename_idx").on(table.filename),
  index("media_folder_idx").on(table.folder),
]);

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
