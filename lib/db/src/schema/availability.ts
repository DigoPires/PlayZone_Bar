import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const availabilityPatternsTable = pgTable("availability_patterns", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 6 = Saturday
  type: text("type").notNull().default("salao"), // salao | gamer
  slots: text("slots").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
});

export const insertAvailabilityPatternSchema = createInsertSchema(availabilityPatternsTable).omit({ id: true });
export type InsertAvailabilityPattern = z.infer<typeof insertAvailabilityPatternSchema>;
export type AvailabilityPattern = typeof availabilityPatternsTable.$inferSelect;
