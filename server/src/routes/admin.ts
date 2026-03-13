/**
 * Admin-only routes: stats, heatmap clusters, user management, audit log
 */
import { Router, Request, Response, NextFunction } from "express";
import { query, param, validationResult } from "express-validator";
import prisma from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

const router = Router();

router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));

// ─── GET /admin/stats ─────────────────────────────────────────────────────────
router.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalComplaints,
      pendingReview,
      resolvedToday,
      activeCitizens,
      avgAiConfidence,
      byCategory,
      byStatus,
      byPriority,
    ] = await prisma.$transaction([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: { in: ["reported", "pending"] } } }),
      prisma.complaint.count({
        where: {
          status: "resolved",
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.user.count({ where: { role: "CITIZEN", isActive: true } }),
      prisma.complaint.aggregate({ _avg: { aiConfidence: true } }),
      prisma.complaint.groupBy({ by: ["category"], _count: true, orderBy: { category: "asc" } }),
      prisma.complaint.groupBy({ by: ["status"],   _count: true, orderBy: { status:   "asc" } }),
      prisma.complaint.groupBy({ by: ["priority"], _count: true, orderBy: { priority: "asc" } }),
    ]);

    res.json({
      success: true,
      data: {
        totalComplaints,
        pendingReview,
        resolvedToday,
        activeCitizens,
        avgAiConfidence: Math.round(avgAiConfidence._avg.aiConfidence ?? 0),
        byCategory: Object.fromEntries(byCategory.map((r) => [r.category, r._count])),
        byStatus:   Object.fromEntries(byStatus.map((r)   => [r.status,   r._count])),
        byPriority: Object.fromEntries(byPriority.map((r) => [r.priority, r._count])),
      },
    });
  } catch (err) { next(err); }
});

// ─── GET /admin/heatmap ───────────────────────────────────────────────────────
// Uses PostGIS ST_ClusterDBSCAN to group complaints into density clusters
router.get("/heatmap", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    type HeatRow = { cid: number; lat: number; lng: number; count: number };
    const clusters = await prisma.$queryRaw<HeatRow[]>`
      SELECT
        cid,
        AVG(lat)  AS lat,
        AVG(lng)  AS lng,
        COUNT(*)  AS count
      FROM (
        SELECT
          lat, lng,
          ST_ClusterDBSCAN(
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography::geometry,
            eps    := 0.01,   -- ~1 km
            minpoints := 2
          ) OVER () AS cid
        FROM complaints
        WHERE status != 'resolved'
      ) sub
      WHERE cid IS NOT NULL
      GROUP BY cid
      ORDER BY count DESC
    `;
    res.json({ success: true, data: clusters });
  } catch (err) { next(err); }
});

// ─── GET /admin/users ─────────────────────────────────────────────────────────
router.get(
  "/users",
  [
    query("page").optional().isInt({ min: 1 }),
    query("pageSize").optional().isInt({ min: 1, max: 100 }),
    query("role").optional().isIn(["CITIZEN", "ADMIN", "SUPER_ADMIN"]),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) return next(createError("Invalid params", 400));
    try {
      const page     = parseInt((req.query.page as string) ?? "1", 10);
      const pageSize = parseInt((req.query.pageSize as string) ?? "20", 10);
      const role     = req.query.role as "CITIZEN" | "ADMIN" | undefined;

      const [total, users] = await prisma.$transaction([
        prisma.user.count({ where: role ? { role } : {} }),
        prisma.user.findMany({
          where: role ? { role } : {},
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, name: true, email: true, role: true,
            district: true, isActive: true, createdAt: true,
            _count: { select: { complaints: true } },
          },
        }),
      ]);

      res.json({
        success: true,
        data: users,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      });
    } catch (err) { next(err); }
  },
);

// ─── PATCH /admin/users/:id/deactivate ───────────────────────────────────────
router.patch(
  "/users/:id/deactivate",
  param("id").isUUID(),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) return next(createError("Invalid ID", 400));
    try {
      const id = req.params.id as string;
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ success: true, data: { message: "User deactivated" } });
    } catch (err) { next(err); }
  },
);

// ─── GET /admin/audit-logs ────────────────────────────────────────────────────
router.get("/audit-logs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page     = parseInt((req.query.page as string) ?? "1", 10);
    const pageSize = parseInt((req.query.pageSize as string) ?? "50", 10);
    const [total, logs] = await prisma.$transaction([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);
    res.json({
      success: true,
      data: logs,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) { next(err); }
});

export default router;
