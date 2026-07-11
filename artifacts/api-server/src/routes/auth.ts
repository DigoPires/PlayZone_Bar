import { Router } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { LoginBody, GetMeResponse } from "@workspace/api-zod";

const router = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  console.log('Login request body:', req.body);
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    console.log('Login validation error:', parsed.error);
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;
  console.log('Login attempting with username:', username);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));

  if (!user) {
    console.log('Login: User not found');
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    console.log('Login: Invalid password');
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Set user in session
  req.session!.userId = user.id;
  console.log('Login: Session set with userId:', user.id);
  console.log('Login: Session ID:', req.sessionID);
  console.log('Login: Cookie headers:', req.headers.cookie);
  
  res.json(GetMeResponse.parse({ id: user.id, username: user.username, name: user.name, role: user.role }));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  console.log('GetMe: Session ID:', req.sessionID);
  console.log('GetMe: Session:', req.session);
  console.log('GetMe: Cookie headers:', req.headers.cookie);
  
  const userId = req.session?.userId;
  if (!userId) {
    console.log('GetMe: No userId in session');
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(GetMeResponse.parse({ id: user.id, username: user.username, name: user.name, role: user.role }));
});

export default router;
