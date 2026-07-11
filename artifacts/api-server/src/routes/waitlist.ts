import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, waitlistTable } from "@workspace/db";
import {
  ListWaitlistResponse,
  CreateWaitlistEntryBody,
  CreateWaitlistEntryResponse,
  DeleteWaitlistEntryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/waitlist", async (_req, res): Promise<void> => {
  const entries = await db.select().from(waitlistTable);

  res.json(
    ListWaitlistResponse.parse(
      entries.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      }))
    )
  );
});

router.post("/waitlist", async (req, res): Promise<void> => {
  const parsed = CreateWaitlistEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db
    .insert(waitlistTable)
    .values({
      name: parsed.data.name,
      phone: parsed.data.phone,
      date: parsed.data.date,
      time: parsed.data.time,
      type: parsed.data.type,
      people: parsed.data.people,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  res.status(201).json(
    CreateWaitlistEntryResponse.parse({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    })
  );
});

router.delete("/waitlist/:id", async (req, res): Promise<void> => {
  const params = DeleteWaitlistEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .delete(waitlistTable)
    .where(eq(waitlistTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
