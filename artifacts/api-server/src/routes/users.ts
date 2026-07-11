import { Router } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, usersTable } from "@workspace/db";
import {
  ListUsersResponse,
  CreateUserResponse,
  UpdateUserParams,
  UpdateUserResponse,
  DeleteUserParams,
} from "@workspace/api-zod";

const router = Router();

const createUserSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.string().optional().default("admin"),
});

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
});

function serializeUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  res.json(ListUsersResponse.parse(users.map(serializeUser)));
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({
      username: parsed.data.username,
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role,
    })
    .returning();

  res.status(201).json(CreateUserResponse.parse(serializeUser(user)));
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = updateUserSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const d = body.data;
  const updateData: Record<string, unknown> = {};
  if (d.username !== undefined) updateData.username = d.username;
  if (d.name !== undefined) updateData.name = d.name;
  if (d.role !== undefined) updateData.role = d.role;
  if (d.password !== undefined) updateData.passwordHash = await bcrypt.hash(d.password, 12);

  const [user] = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(UpdateUserResponse.parse(serializeUser(user)));
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
