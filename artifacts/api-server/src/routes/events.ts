import { Router } from "express";
import { eq, desc, gte } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";
import { requireAdmin } from "../middleware/auth";
import { uploadImage, deleteImage } from "../lib/cloudinary";
import multer from "multer";
import {
  ListEventsQueryParams,
  ListEventsResponse,
  CreateEventBody,
  CreateEventResponse,
  GetEventParams,
  GetEventResponse,
  UpdateEventParams,
  UpdateEventBody,
  UpdateEventResponse,
  DeleteEventParams,
} from "@workspace/api-zod";

const router = Router();
const upload = multer({ dest: 'uploads/' });

function serializeEvent(e: typeof eventsTable.$inferSelect) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date.toISOString(),
    endDate: e.endDate?.toISOString() ?? null,
    imageUrl: e.imageUrl,
    price: e.price != null ? Number(e.price) : null,
    capacity: e.capacity,
    location: e.location,
    featured: e.featured,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/events", async (req, res): Promise<void> => {
  const parsed = ListEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const events = parsed.data.upcoming
    ? await db.select().from(eventsTable).where(gte(eventsTable.date, now)).orderBy(eventsTable.date)
    : await db.select().from(eventsTable).orderBy(desc(eventsTable.date));

  res.json(ListEventsResponse.parse(events.map(serializeEvent)));
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const params = GetEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, params.data.id));

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(GetEventResponse.parse(serializeEvent(event)));
});

// Upload endpoint for Cloudinary
router.post("/events/upload", requireAdmin, upload.single('image'), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const { url, publicId } = await uploadImage(req.file, 'playzone/campeonatos_test');
    res.json({ url, publicId });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.post("/events", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const [event] = await db
    .insert(eventsTable)
    .values({
      title: d.title,
      description: d.description ?? null,
      date: new Date(d.date),
      endDate: d.endDate ? new Date(d.endDate) : null,
      imageUrl: d.imageUrl ?? null,
      price: d.price != null ? String(d.price) : null,
      capacity: d.capacity ?? null,
      location: d.location ?? null,
      featured: d.featured ?? false,
    })
    .returning();

  res.status(201).json(CreateEventResponse.parse(serializeEvent(event)));
});

router.patch("/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateEventBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const d = body.data;
  const updateData: Record<string, unknown> = {};
  if (d.title !== undefined) updateData.title = d.title;
  if (d.description !== undefined) updateData.description = d.description;
  if (d.date !== undefined) updateData.date = new Date(d.date);
  if (d.endDate !== undefined) updateData.endDate = new Date(d.endDate);
  if (d.imageUrl !== undefined) updateData.imageUrl = d.imageUrl;
  if (d.price !== undefined) updateData.price = String(d.price);
  if (d.capacity !== undefined) updateData.capacity = d.capacity;
  if (d.location !== undefined) updateData.location = d.location;
  if (d.featured !== undefined) updateData.featured = d.featured;

  const [event] = await db
    .update(eventsTable)
    .set(updateData)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(UpdateEventResponse.parse(serializeEvent(event)));
});

router.delete("/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .delete(eventsTable)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
