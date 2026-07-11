import { Router } from "express";
import { eq, count, sql, gte } from "drizzle-orm";
import { db, reservationsTable, eventsTable, menuItemsTable, galleryTable } from "@workspace/db";
import { GetStatsResponse, GetReservationsByDayResponse, GetPeakHoursResponse } from "@workspace/api-zod";

const router = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const [totalRes, pendingRes, confirmedToday, totalEvents, activeItems, activeGallery, recentRes] = await Promise.all([
    db.select({ count: count() }).from(reservationsTable),
    db.select({ count: count() }).from(reservationsTable).where(eq(reservationsTable.status, "pending")),
    db.select({ count: count() }).from(reservationsTable).where(
      sql`${reservationsTable.date} = ${today} AND ${reservationsTable.status} IN ('confirmed', 'checkin')`
    ),
    db.select({ count: count() }).from(eventsTable),
    db.select({ count: count() }).from(menuItemsTable).where(eq(menuItemsTable.available, true)),
    db.select({ count: count() }).from(galleryTable).where(eq(galleryTable.active, true)),
    db.select().from(reservationsTable).orderBy(sql`${reservationsTable.createdAt} DESC`).limit(5),
  ]);

  const total = totalRes[0]?.count ?? 0;
  const confirmed = confirmedToday[0]?.count ?? 0;
  const occupancyRate = total > 0 ? Math.round((confirmed / Math.max(total, 1)) * 100) : 0;

  const recent = recentRes.map((r) => ({
    ...r,
    discountApplied: r.discountApplied != null ? Number(r.discountApplied) : null,
    checkedInAt: r.checkedInAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(
    GetStatsResponse.parse({
      totalReservations: totalRes[0]?.count ?? 0,
      pendingReservations: pendingRes[0]?.count ?? 0,
      confirmedToday: confirmed,
      occupancyRate,
      totalEvents: totalEvents[0]?.count ?? 0,
      activeMenuItems: activeItems[0]?.count ?? 0,
      galleryImages: activeGallery[0]?.count ?? 0,
      recentReservations: recent,
    })
  );
});

router.get("/stats/reservations-by-day", async (_req, res): Promise<void> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

  const rows = await db
    .select({
      date: reservationsTable.date,
      count: count(),
      salaoCount: sql<number>`count(*) filter (where ${reservationsTable.type} = 'salao')`,
      gamerCount: sql<number>`count(*) filter (where ${reservationsTable.type} = 'gamer')`,
    })
    .from(reservationsTable)
    .where(gte(reservationsTable.date, dateStr))
    .groupBy(reservationsTable.date)
    .orderBy(reservationsTable.date);

  res.json(
    GetReservationsByDayResponse.parse(
      rows.map((r) => ({
        date: r.date,
        count: r.count,
        salaoCount: Number(r.salaoCount),
        gamerCount: Number(r.gamerCount),
      }))
    )
  );
});

router.get("/stats/peak-hours", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      hour: reservationsTable.time,
      count: count(),
    })
    .from(reservationsTable)
    .groupBy(reservationsTable.time)
    .orderBy(sql`count(*) DESC`)
    .limit(12);

  res.json(
    GetPeakHoursResponse.parse(
      rows.map((r) => ({ hour: r.hour, count: r.count }))
    )
  );
});

export default router;
