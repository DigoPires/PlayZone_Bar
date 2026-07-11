import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db, galleryTable } from "@workspace/db";
import { requireAdmin } from "../middleware/auth";
import { uploadImage, deleteImage } from "../lib/cloudinary";
import multer from "multer";
import {
  ListGalleryQueryParams,
  ListGalleryResponse,
  CreateGalleryImageBody,
  CreateGalleryImageResponse,
  UpdateGalleryImageParams,
  UpdateGalleryImageBody,
  UpdateGalleryImageResponse,
  DeleteGalleryImageParams,
} from "@workspace/api-zod";

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get("/gallery", async (req, res): Promise<void> => {
  const parsed = ListGalleryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(galleryTable).orderBy(asc(galleryTable.order));

  const images = await query;
  const filtered = parsed.data.activeOnly
    ? images.filter((i) => i.active)
    : images;

  res.json(
    ListGalleryResponse.parse(
      filtered.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
      }))
    )
  );
});

// Upload endpoint for Cloudinary
router.post("/gallery/upload", requireAdmin, upload.single('image'), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const { url, publicId } = await uploadImage(req.file);
    
    // Only return the Cloudinary data, don't create database entry here
    // The database entry will be created by the frontend via POST /api/gallery
    res.status(201).json({ url, publicId });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.post("/gallery", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateGalleryImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [image] = await db
    .insert(galleryTable)
    .values({
      url: parsed.data.url,
      publicId: parsed.data.publicId,
      active: parsed.data.active ?? true,
      order: parsed.data.order ?? 0,
      alt: parsed.data.alt ?? null,
    })
    .returning();

  res.status(201).json(
    CreateGalleryImageResponse.parse({
      ...image,
      createdAt: image.createdAt.toISOString(),
    })
  );
});

router.patch("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateGalleryImageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateGalleryImageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.active !== undefined) updateData.active = body.data.active;
  if (body.data.order !== undefined) updateData.order = body.data.order;
  if (body.data.alt !== undefined) updateData.alt = body.data.alt;

  const [image] = await db
    .update(galleryTable)
    .set(updateData)
    .where(eq(galleryTable.id, params.data.id))
    .returning();

  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  res.json(
    UpdateGalleryImageResponse.parse({
      ...image,
      createdAt: image.createdAt.toISOString(),
    })
  );
});

router.delete("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteGalleryImageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [image] = await db
    .delete(galleryTable)
    .where(eq(galleryTable.id, params.data.id))
    .returning();

  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  // Delete from Cloudinary
  try {
    await deleteImage(image.publicId);
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to delete from Cloudinary:', error);
  }

  res.sendStatus(204);
});

export default router;
