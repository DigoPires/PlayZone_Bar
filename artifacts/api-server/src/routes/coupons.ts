import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";
import { requireAdmin } from "../middleware/auth";
import {
  ListCouponsResponse,
  CreateCouponBody,
  CreateCouponResponse,
  UpdateCouponParams,
  UpdateCouponBody,
  UpdateCouponResponse,
  DeleteCouponParams,
  ValidateCouponBody,
  ValidateCouponResponse,
} from "@workspace/api-zod";

const router = Router();

function serializeCoupon(c: typeof couponsTable.$inferSelect) {
  return {
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    discountValue: Number(c.discountValue),
    validUntil: c.validUntil?.toISOString() ?? null,
    maxUses: c.maxUses,
    uses: c.uses,
    active: c.active,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/coupons", requireAdmin, async (_req, res): Promise<void> => {
  const coupons = await db.select().from(couponsTable);
  res.json(ListCouponsResponse.parse(coupons.map(serializeCoupon)));
});

router.post("/coupons", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const [coupon] = await db
    .insert(couponsTable)
    .values({
      code: d.code.toUpperCase(),
      discountType: d.discountType,
      discountValue: String(d.discountValue),
      validUntil: d.validUntil ? new Date(d.validUntil) : null,
      maxUses: d.maxUses ?? null,
      active: d.active ?? true,
      uses: 0,
    })
    .returning();

  res.status(201).json(CreateCouponResponse.parse(serializeCoupon(coupon)));
});

router.patch("/coupons/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCouponParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateCouponBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const d = body.data;
  const updateData: Record<string, unknown> = {};
  if (d.code !== undefined) updateData.code = d.code.toUpperCase();
  if (d.discountType !== undefined) updateData.discountType = d.discountType;
  if (d.discountValue !== undefined) updateData.discountValue = String(d.discountValue);
  if (d.validUntil !== undefined) updateData.validUntil = new Date(d.validUntil);
  if (d.maxUses !== undefined) updateData.maxUses = d.maxUses;
  if (d.active !== undefined) updateData.active = d.active;

  const [coupon] = await db
    .update(couponsTable)
    .set(updateData)
    .where(eq(couponsTable.id, params.data.id))
    .returning();

  if (!coupon) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }

  res.json(UpdateCouponResponse.parse(serializeCoupon(coupon)));
});

router.delete("/coupons/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCouponParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [coupon] = await db
    .delete(couponsTable)
    .where(eq(couponsTable.id, params.data.id))
    .returning();

  if (!coupon) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/coupons/validate", async (req, res): Promise<void> => {
  const parsed = ValidateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(and(eq(couponsTable.code, parsed.data.code.toUpperCase()), eq(couponsTable.active, true)));

  if (!coupon) {
    res.json(ValidateCouponResponse.parse({ valid: false, coupon: undefined, message: "Coupon not found or inactive" }));
    return;
  }

  if (coupon.validUntil && coupon.validUntil < new Date()) {
    res.json(ValidateCouponResponse.parse({ valid: false, coupon: undefined, message: "Coupon has expired" }));
    return;
  }

  if (coupon.maxUses != null && coupon.uses >= coupon.maxUses) {
    res.json(ValidateCouponResponse.parse({ valid: false, coupon: undefined, message: "Coupon usage limit reached" }));
    return;
  }

  res.json(ValidateCouponResponse.parse({ valid: true, coupon: serializeCoupon(coupon), message: null }));
});

export default router;
