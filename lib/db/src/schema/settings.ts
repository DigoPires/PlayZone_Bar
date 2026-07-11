import { pgTable, text, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  entryPrice: numeric("entry_price"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  tiktok: text("tiktok"),
  heroTitlePurple: text("hero_title_purple"),
  heroTitleWhite: text("hero_title_white"),
  heroSubtitle: text("hero_subtitle"),
  aboutText: text("about_text"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  googleMapsUrl: text("google_maps_url"),
  openingHours: text("opening_hours"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
