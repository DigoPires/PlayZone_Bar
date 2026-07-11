import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, availabilityPatternsTable } from "@workspace/db";
import {
  ListAvailabilityPatternsResponse,
  CreateAvailabilityPatternBody,
  CreateAvailabilityPatternResponse,
  UpdateAvailabilityPatternParams,
  UpdateAvailabilityPatternBody,
  UpdateAvailabilityPatternResponse,
  DeleteAvailabilityPatternParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/availability", async (_req, res): Promise<void> => {
  const patterns = await db.select().from(availabilityPatternsTable);
  res.json(ListAvailabilityPatternsResponse.parse(patterns));
});

router.post("/availability", async (req, res): Promise<void> => {
  const parsed = CreateAvailabilityPatternBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [pattern] = await db
    .insert(availabilityPatternsTable)
    .values({
      dayOfWeek: parsed.data.dayOfWeek,
      type: parsed.data.type,
      slots: parsed.data.slots,
      active: parsed.data.active ?? true,
    })
    .returning();

  res.status(201).json(CreateAvailabilityPatternResponse.parse(pattern));
});

router.patch("/availability/:id", async (req, res): Promise<void> => {
  const params = UpdateAvailabilityPatternParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateAvailabilityPatternBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const d = body.data;
  const updateData: Record<string, unknown> = {};
  if (d.dayOfWeek !== undefined) updateData.dayOfWeek = d.dayOfWeek;
  if (d.type !== undefined) updateData.type = d.type;
  if (d.slots !== undefined) updateData.slots = d.slots;
  if (d.active !== undefined) updateData.active = d.active;

  const [pattern] = await db
    .update(availabilityPatternsTable)
    .set(updateData)
    .where(eq(availabilityPatternsTable.id, params.data.id))
    .returning();

  if (!pattern) {
    res.status(404).json({ error: "Pattern not found" });
    return;
  }

  res.json(UpdateAvailabilityPatternResponse.parse(pattern));
});

router.delete("/availability/:id", async (req, res): Promise<void> => {
  const params = DeleteAvailabilityPatternParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pattern] = await db
    .delete(availabilityPatternsTable)
    .where(eq(availabilityPatternsTable.id, params.data.id))
    .returning();

  if (!pattern) {
    res.status(404).json({ error: "Pattern not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
