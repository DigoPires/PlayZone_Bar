import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { requireAdmin } from "../middleware/auth";
import { uploadImage, deleteImage } from "../lib/cloudinary";
import multer from "multer";
import {
  ListMenuCategoriesResponse,
  CreateMenuCategoryBody,
  CreateMenuCategoryResponse,
  UpdateMenuCategoryParams,
  UpdateMenuCategoryBody,
  UpdateMenuCategoryResponse,
  DeleteMenuCategoryParams,
  ListMenuItemsQueryParams,
  ListMenuItemsResponse,
  CreateMenuItemBody,
  CreateMenuItemResponse,
  UpdateMenuItemParams,
  UpdateMenuItemBody,
  UpdateMenuItemResponse,
  DeleteMenuItemParams,
} from "@workspace/api-zod";

const router = Router();
const upload = multer({ dest: 'uploads/' });

// --- Categories ---

router.get("/menu/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select()
    .from(menuCategoriesTable)
    .orderBy(asc(menuCategoriesTable.order));

  res.json(ListMenuCategoriesResponse.parse(categories));
});

router.post("/menu/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateMenuCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [category] = await db
    .insert(menuCategoriesTable)
    .values({
      name: parsed.data.name,
      order: parsed.data.order ?? 0,
      icon: parsed.data.icon ?? null,
    })
    .returning();

  res.status(201).json(CreateMenuCategoryResponse.parse(category));
});

router.patch("/menu/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateMenuCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateMenuCategoryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.name !== undefined) updateData.name = body.data.name;
  if (body.data.order !== undefined) updateData.order = body.data.order;
  if (body.data.icon !== undefined) updateData.icon = body.data.icon;

  const [category] = await db
    .update(menuCategoriesTable)
    .set(updateData)
    .where(eq(menuCategoriesTable.id, params.data.id))
    .returning();

  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.json(UpdateMenuCategoryResponse.parse(category));
});

router.delete("/menu/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteMenuCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Check if category has items
  const itemsInCategory = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.categoryId, params.data.id));

  if (itemsInCategory.length > 0) {
    res.status(409).json({ 
      error: `Não é possível excluir esta categoria pois ela possui ${itemsInCategory.length} item(ns) vinculado(s). Remova ou mova os itens antes de excluir a categoria.` 
    });
    return;
  }

  const [category] = await db
    .delete(menuCategoriesTable)
    .where(eq(menuCategoriesTable.id, params.data.id))
    .returning();

  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.sendStatus(204);
});

// --- Items ---

// Upload endpoint for Cloudinary
router.post("/menu/items/upload", requireAdmin, upload.single('image'), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const { url, publicId } = await uploadImage(req.file, 'playzone/cardapio_test');
    res.json({ url, publicId });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.get("/menu/items", async (req, res): Promise<void> => {
  const parsed = ListMenuItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const allItems = await db
    .select({
      id: menuItemsTable.id,
      categoryId: menuItemsTable.categoryId,
      categoryName: menuCategoriesTable.name,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      imageUrl: menuItemsTable.imageUrl,
      available: menuItemsTable.available,
      createdAt: menuItemsTable.createdAt,
    })
    .from(menuItemsTable)
    .leftJoin(menuCategoriesTable, eq(menuItemsTable.categoryId, menuCategoriesTable.id));

  let filtered = allItems;
  if (parsed.data.categoryId !== undefined) {
    filtered = filtered.filter((i) => i.categoryId === parsed.data.categoryId);
  }
  if (parsed.data.availableOnly) {
    filtered = filtered.filter((i) => i.available);
  }

  res.json(
    ListMenuItemsResponse.parse(
      filtered.map((i) => ({
        ...i,
        price: Number(i.price),
        createdAt: i.createdAt.toISOString(),
      }))
    )
  );
});

router.post("/menu/items", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(menuItemsTable)
    .values({
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: String(parsed.data.price),
      imageUrl: parsed.data.imageUrl ?? null,
      available: parsed.data.available ?? true,
    })
    .returning();

  res.status(201).json(
    CreateMenuItemResponse.parse({
      ...item,
      categoryName: null,
      price: Number(item.price),
      createdAt: item.createdAt.toISOString(),
    })
  );
});

router.patch("/menu/items/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateMenuItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.categoryId !== undefined) updateData.categoryId = body.data.categoryId;
  if (body.data.name !== undefined) updateData.name = body.data.name;
  if (body.data.description !== undefined) updateData.description = body.data.description;
  if (body.data.price !== undefined) updateData.price = String(body.data.price);
  if (body.data.imageUrl !== undefined) updateData.imageUrl = body.data.imageUrl;
  if (body.data.available !== undefined) updateData.available = body.data.available;

  const [item] = await db
    .update(menuItemsTable)
    .set(updateData)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(
    UpdateMenuItemResponse.parse({
      ...item,
      categoryName: null,
      price: Number(item.price),
      createdAt: item.createdAt.toISOString(),
    })
  );
});

router.delete("/menu/items/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .delete(menuItemsTable)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
