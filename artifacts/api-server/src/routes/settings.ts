import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { GetSettingsResponse, UpdateSettingsBody, UpdateSettingsResponse } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

const router = Router();

function serializeSettings(s: typeof settingsTable.$inferSelect) {
  return {
    id: s.id,
    entryPrice: s.entryPrice != null ? Number(s.entryPrice) : null,
    whatsapp: s.whatsapp,
    address: s.address,
    instagram: s.instagram,
    facebook: s.facebook,
    tiktok: s.tiktok,
    heroTitlePurple: s.heroTitlePurple || null,
    heroTitleWhite: s.heroTitleWhite || null,
    heroSubtitle: s.heroSubtitle,
    aboutText: s.aboutText,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    googleMapsUrl: s.googleMapsUrl,
    openingHours: s.openingHours,
  };
}

async function ensureSettings() {
  const rows = await db.select().from(settingsTable);
  if (rows[0]) return rows[0];

  const [created] = await db
    .insert(settingsTable)
    .values({
      heroTitlePurple: "PLAY",
      heroTitleWhite: "ZONE",
      heroSubtitle: "A melhor experiência gaming da cidade",
      aboutText:
        "O PlayZone Bar é o destino definitivo para gamers e apaixonados por entretenimento. Combinamos alta tecnologia, jogos de última geração e um bar premium para criar uma experiência inesquecível.",
      address: "Rua dos Games, 123 - Centro",
      whatsapp: "+5511999999999",
      openingHours: "Terça a Domingo: 14h às 00h",
      seoTitle: "PlayZone Bar - Gaming Lounge Premium",
      seoDescription:
        "Reserve agora!",
    })
    .returning();

  return created;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await ensureSettings();
  res.json(GetSettingsResponse.parse(serializeSettings(settings)));
});

router.patch("/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const settings = await ensureSettings();
  const d = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (d.entryPrice !== undefined) updateData.entryPrice = String(d.entryPrice);
  if (d.whatsapp !== undefined) updateData.whatsapp = d.whatsapp;
  if (d.address !== undefined) updateData.address = d.address;
  if (d.instagram !== undefined) updateData.instagram = d.instagram;
  if (d.facebook !== undefined) updateData.facebook = d.facebook;
  if (d.tiktok !== undefined) updateData.tiktok = d.tiktok;
  if (d.heroTitlePurple !== undefined) updateData.heroTitlePurple = d.heroTitlePurple;
  if (d.heroTitleWhite !== undefined) updateData.heroTitleWhite = d.heroTitleWhite;
  if (d.heroSubtitle !== undefined) updateData.heroSubtitle = d.heroSubtitle;
  if (d.aboutText !== undefined) updateData.aboutText = d.aboutText;
  if (d.seoTitle !== undefined) updateData.seoTitle = d.seoTitle;
  if (d.seoDescription !== undefined) updateData.seoDescription = d.seoDescription;
  if (d.logoUrl !== undefined) updateData.logoUrl = d.logoUrl;
  if (d.faviconUrl !== undefined) updateData.faviconUrl = d.faviconUrl;
  if (d.googleMapsUrl !== undefined) updateData.googleMapsUrl = d.googleMapsUrl;
  if (d.openingHours !== undefined) updateData.openingHours = d.openingHours;

  const [updated] = await db
    .update(settingsTable)
    .set(updateData)
    .where(eq(settingsTable.id, settings.id))
    .returning();

  res.json(UpdateSettingsResponse.parse(serializeSettings(updated)));
});

export default router;
