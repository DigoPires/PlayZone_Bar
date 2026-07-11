import { Router } from "express";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { db, reservationsTable, couponsTable } from "@workspace/db";
import { requireAdmin } from "../middleware/auth";
import {
  ListReservationsQueryParams,
  ListReservationsResponse,
  CreateReservationBody,
  CreateReservationResponse,
  GetReservationParams,
  GetReservationResponse,
  UpdateReservationParams,
  UpdateReservationBody,
  UpdateReservationResponse,
  DeleteReservationParams,
  CheckInReservationParams,
  CheckInReservationResponse,
  GetAvailabilityQueryParams,
  GetAvailabilityResponse,
} from "@workspace/api-zod";
import { availabilityPatternsTable } from "@workspace/db";
import crypto from "crypto";

const router = Router();

router.get("/reservations/availability", async (req, res): Promise<void> => {
  const parsed = GetAvailabilityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date, type } = parsed.data;
  const d = new Date(date);
  const dayOfWeek = d.getDay();

  const patterns = await db
    .select()
    .from(availabilityPatternsTable)
    .where(
      and(
        eq(availabilityPatternsTable.dayOfWeek, dayOfWeek),
        eq(availabilityPatternsTable.type, type),
        eq(availabilityPatternsTable.active, true)
      )
    );

  const existingReservations = await db
    .select({ time: reservationsTable.time })
    .from(reservationsTable)
    .where(
      and(
        eq(reservationsTable.date, date),
        eq(reservationsTable.type, type),
        sql`${reservationsTable.status} NOT IN ('cancelled')`
      )
    );

  const bookedTimes = new Set(existingReservations.map((r) => r.time));
  const allSlots = patterns.flatMap((p) => p.slots ?? []);
  const availableSlots = [...new Set(allSlots)].filter((s) => !bookedTimes.has(s)).sort();

  res.json(GetAvailabilityResponse.parse({ date, type, slots: availableSlots }));
});

router.get("/reservations", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ListReservationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, type, date, page = 1, limit = 20 } = parsed.data;
  const conditions = [];

  if (status) conditions.push(eq(reservationsTable.status, status));
  if (type) conditions.push(eq(reservationsTable.type, type));
  if (date) conditions.push(eq(reservationsTable.date, date));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [reservations, totalResult] = await Promise.all([
    db
      .select()
      .from(reservationsTable)
      .where(where)
      .orderBy(desc(reservationsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(reservationsTable).where(where),
  ]);

  const total = totalResult[0]?.count ?? 0;

  const mapped = reservations.map((r) => ({
    ...r,
    discountApplied: r.discountApplied != null ? Number(r.discountApplied) : null,
    checkedInAt: r.checkedInAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(ListReservationsResponse.parse({ reservations: mapped, total, page, limit }));
});

router.post("/reservations", async (req, res): Promise<void> => {
  const parsed = CreateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  let discountApplied: string | null = null;

  // Apply coupon if provided
  if (data.couponCode) {
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(and(eq(couponsTable.code, data.couponCode), eq(couponsTable.active, true)));

    if (coupon) {
      if (coupon.discountType === "percent") {
        discountApplied = String(Number(coupon.discountValue));
      } else {
        discountApplied = String(Number(coupon.discountValue));
      }
      // Increment coupon uses
      await db
        .update(couponsTable)
        .set({ uses: coupon.uses + 1 })
        .where(eq(couponsTable.id, coupon.id));
    }
  }

  const qrCode = crypto.randomUUID();

  const [reservation] = await db
    .insert(reservationsTable)
    .values({
      name: data.name,
      phone: data.phone,
      people: data.people,
      date: data.date,
      time: data.time,
      type: data.type,
      notes: data.notes ?? null,
      couponCode: data.couponCode ?? null,
      discountApplied,
      qrCode,
      status: "pending",
    })
    .returning();

  res.status(201).json(
    CreateReservationResponse.parse({
      ...reservation,
      discountApplied: reservation.discountApplied != null ? Number(reservation.discountApplied) : null,
      checkedInAt: null,
      createdAt: reservation.createdAt.toISOString(),
    })
  );
});

router.get("/reservations/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetReservationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [reservation] = await db
    .select()
    .from(reservationsTable)
    .where(eq(reservationsTable.id, params.data.id));

  if (!reservation) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  res.json(
    GetReservationResponse.parse({
      ...reservation,
      discountApplied: reservation.discountApplied != null ? Number(reservation.discountApplied) : null,
      checkedInAt: reservation.checkedInAt?.toISOString() ?? null,
      createdAt: reservation.createdAt.toISOString(),
    })
  );
});

router.patch("/reservations/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateReservationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateReservationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  const d = body.data;
  if (d.name !== undefined) updateData.name = d.name;
  if (d.phone !== undefined) updateData.phone = d.phone;
  if (d.people !== undefined) updateData.people = d.people;
  if (d.date !== undefined) updateData.date = d.date;
  if (d.time !== undefined) updateData.time = d.time;
  if (d.type !== undefined) updateData.type = d.type;
  if (d.status !== undefined) updateData.status = d.status;
  if (d.notes !== undefined) updateData.notes = d.notes;

  const [reservation] = await db
    .update(reservationsTable)
    .set(updateData)
    .where(eq(reservationsTable.id, params.data.id))
    .returning();

  if (!reservation) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  res.json(
    UpdateReservationResponse.parse({
      ...reservation,
      discountApplied: reservation.discountApplied != null ? Number(reservation.discountApplied) : null,
      checkedInAt: reservation.checkedInAt?.toISOString() ?? null,
      createdAt: reservation.createdAt.toISOString(),
    })
  );
});

router.delete("/reservations/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteReservationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [reservation] = await db
    .delete(reservationsTable)
    .where(eq(reservationsTable.id, params.data.id))
    .returning();

  if (!reservation) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/reservations/:id/checkin", requireAdmin, async (req, res): Promise<void> => {
  const params = CheckInReservationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [reservation] = await db
    .update(reservationsTable)
    .set({ status: "checkin", checkedInAt: new Date() })
    .where(eq(reservationsTable.id, params.data.id))
    .returning();

  if (!reservation) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  res.json(
    CheckInReservationResponse.parse({
      ...reservation,
      discountApplied: reservation.discountApplied != null ? Number(reservation.discountApplied) : null,
      checkedInAt: reservation.checkedInAt?.toISOString() ?? null,
      createdAt: reservation.createdAt.toISOString(),
    })
  );
});

export default router;
