import { pgTable, text, serial, timestamp, integer, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  people: integer("people").notNull().default(1),
  date: date("date", { mode: "string" }).notNull(),
  time: text("time").notNull(),
  type: text("type").notNull().default("salao"), // salao | gamer
  status: text("status").notNull().default("pending"), // pending | confirmed | cancelled | completed | checkin
  notes: text("notes"),
  couponCode: text("coupon_code"),
  discountApplied: numeric("discount_applied"),
  qrCode: text("qr_code"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReservationSchema = createInsertSchema(reservationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservationsTable.$inferSelect;
