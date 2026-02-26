import { Router, Request, Response, NextFunction } from "express";
import { body, query, param, validationResult } from "express-validator";
import prisma from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { AuthenticatedRequest, ComplaintsFilter } from "../types";
import { ComplaintCategory, ComplaintStatus, Priority } from "@prisma/client";

const router = Router();

const VALID_STATUSES = Object.values(ComplaintStatus);
const VALID_CATEGORIES = Object.values(ComplaintCategory);
const VALID_PRIORITIES = Object.values(Priority);

function parsePagination(filter: ComplaintsFilter) {
  const page = Math.max(1, parseInt(filter.page ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(filter.pageSize ?? "20", 10)));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

// ─── GET /complaints ──────────────────────────────────────────────────────────
// Public: returns all complaints with optional filtering/pagination
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("pageSize").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(VALID_STATUSES),
    query("category").optional().isIn(VALID_CATEGORIES),
    query("priority").optional().isIn(VALID_PRIORITIES),
    query("search").optional().trim(),
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(createError("Invalid query parameters", 400));

    try {
      const filter = req.query as ComplaintsFilter;
      const { page, pageSize, skip } = parsePagination(filter);

      const where: Parameters<typeof prisma.complaint.findMany>[0]["where"] = {};

      if (filter.status)     where.status     = filter.status as ComplaintStatus;
      if (filter.category)   where.category   = filter.category as ComplaintCategory;
      if (filter.priority)   where.priority   = filter.priority as Priority;
      if (filter.departmentId) where.departmentId = filter.departmentId;

      if (filter.dateFrom || filter.dateTo) {
        where.createdAt = {
          ...(filter.dateFrom && { gte: new Date(filter.dateFrom) }),
          ...(filter.dateTo   && { lte: new Date(filter.dateTo) }),
        };
      }

      if (filter.search) {
        where.OR = [
          { title:       { contains: filter.search, mode: "insensitive" } },
          { description: { contains: filter.search, mode: "insensitive" } },
          { city:        { contains: filter.search, mode: "insensitive" } },
          { address:     { contains: filter.search, mode: "insensitive" } },
        ];
      }

      const [total, items] = await prisma.$transaction([
        prisma.complaint.count({ where }),
        prisma.complaint.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, refId: true, title: true, category: true, status: true,
            priority: true, lat: true, lng: true, address: true, city: true,
            district: true, photoUrl: true, aiConfidence: true, upvotes: true,
            isDuplicate: true, createdAt: true,
            reporter: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
          },
        }),
      ]);

      res.json({
        success: true,
        data: items,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── GET /complaints/:id ──────────────────────────────────────────────────────
router.get("/:id", param("id").isUUID(), async (req: Request, res: Response, next: NextFunction) => {
  if (!validationResult(req).isEmpty()) return next(createError("Invalid complaint ID", 400));

  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        reporter:   { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!complaint) return next(createError("Complaint not found", 404));
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
});

// ─── POST /complaints ─────────────────────────────────────────────────────────
// Requires auth. Performs PostGIS 500m duplicate detection.
router.post(
  "/",
  requireAuth,
  [
    body("title").trim().isLength({ min: 10 }).withMessage("Title must be at least 10 characters"),
    body("category").isIn(VALID_CATEGORIES).withMessage("Invalid category"),
    body("description").trim().isLength({ min: 30 }).withMessage("Description must be at least 30 characters"),
    body("lat").isFloat({ min: -90, max: 90 }),
    body("lng").isFloat({ min: -180, max: 180 }),
    body("address").trim().notEmpty(),
    body("city").trim().notEmpty(),
    body("district").trim().notEmpty(),
    body("photoUrl").optional().isURL(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const details = errors.array().reduce<Record<string, string[]>>((acc, e) => {
        const field = (e as { path: string }).path;
        acc[field] = [...(acc[field] ?? []), e.msg];
        return acc;
      }, {});
      return next(createError("Validation failed", 422, details));
    }

    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const { title, category, description, lat, lng, address, city, district, photoUrl } = req.body as {
        title: string; category: ComplaintCategory; description: string;
        lat: number; lng: number; address: string; city: string; district: string;
        photoUrl?: string;
      };

      // ── PostGIS duplicate detection: 500m radius, last 30 days ─────────────
      type DupRow = { id: string; refId: string; distance: number };
      const duplicates = await prisma.$queryRaw<DupRow[]>`
        SELECT id, "refId",
          ST_Distance(
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
          ) AS distance
        FROM complaints
        WHERE category = ${category}::"ComplaintCategory"
          AND "createdAt" > NOW() - INTERVAL '30 days'
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            500
          )
        ORDER BY distance ASC
        LIMIT 1
      `;

      const isDuplicate = duplicates.length > 0;
      const duplicateOfId = isDuplicate ? duplicates[0].id : undefined;

      // ── Generate ref ID ─────────────────────────────────────────────────────
      const year = new Date().getFullYear();
      const count = await prisma.complaint.count();
      const refId = `FIX-${year}-${String(count + 1).padStart(3, "0")}`;

      const complaint = await prisma.complaint.create({
        data: {
          refId,
          title,
          category,
          description,
          lat: parseFloat(String(lat)),
          lng: parseFloat(String(lng)),
          address,
          city,
          district,
          photoUrl,
          isDuplicate,
          duplicateOfId,
          reporterId: sub,
          statusHistory: {
            create: [{ status: ComplaintStatus.reported, note: "Complaint submitted" }],
          },
        },
        include: {
          reporter: { select: { id: true, name: true } },
          statusHistory: true,
        },
      });

      res.status(201).json({ success: true, data: { complaint, isDuplicate, duplicateOfId } });
    } catch (err) {
      next(err);
    }
  },
);

// ─── PATCH /complaints/:id/status ─────────────────────────────────────────────
// Admin or complaint reporter can update status
router.patch(
  "/:id/status",
  requireAuth,
  [
    param("id").isUUID(),
    body("status").isIn(VALID_STATUSES).withMessage("Invalid status"),
    body("note").optional().trim(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) return next(createError("Invalid request", 400));

    try {
      const { sub, role } = (req as AuthenticatedRequest).user;
      const { status, note } = req.body as { status: ComplaintStatus; note?: string };

      const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
      if (!complaint) return next(createError("Complaint not found", 404));
      if (role === "CITIZEN" && complaint.reporterId !== sub) {
        return next(createError("Forbidden", 403));
      }

      const updated = await prisma.complaint.update({
        where: { id: req.params.id },
        data: {
          status,
          statusHistory: {
            create: { status, note: note ?? `Status changed to ${status}`, changedById: sub },
          },
        },
        include: { statusHistory: { orderBy: { createdAt: "asc" } } },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// ─── PATCH /complaints/:id/assign ─────────────────────────────────────────────
// Admin only — assign to department
router.patch(
  "/:id/assign",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  [
    param("id").isUUID(),
    body("departmentId").isUUID().withMessage("Valid department ID required"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) return next(createError("Invalid request", 400));

    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const { departmentId } = req.body as { departmentId: string };

      const [dept, complaint] = await Promise.all([
        prisma.department.findUnique({ where: { id: departmentId } }),
        prisma.complaint.findUnique({ where: { id: req.params.id } }),
      ]);
      if (!dept)      return next(createError("Department not found", 404));
      if (!complaint) return next(createError("Complaint not found", 404));

      const updated = await prisma.complaint.update({
        where: { id: req.params.id },
        data: {
          departmentId,
          status: ComplaintStatus.assigned,
          statusHistory: {
            create: {
              status: ComplaintStatus.assigned,
              note: `Assigned to ${dept.name}`,
              changedById: sub,
            },
          },
        },
        include: {
          department: { select: { id: true, name: true } },
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /complaints/:id/upvote ──────────────────────────────────────────────
router.post(
  "/:id/upvote",
  requireAuth,
  param("id").isUUID(),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) return next(createError("Invalid complaint ID", 400));
    try {
      const updated = await prisma.complaint.update({
        where: { id: req.params.id },
        data: { upvotes: { increment: 1 } },
        select: { id: true, upvotes: true },
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// ─── DELETE /complaints/:id ───────────────────────────────────────────────────
// Admin or reporter (only if still in "reported" status)
router.delete(
  "/:id",
  requireAuth,
  param("id").isUUID(),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) return next(createError("Invalid ID", 400));

    try {
      const { sub, role } = (req as AuthenticatedRequest).user;
      const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
      if (!complaint) return next(createError("Complaint not found", 404));

      const canDelete =
        role === "ADMIN" ||
        role === "SUPER_ADMIN" ||
        (complaint.reporterId === sub && complaint.status === ComplaintStatus.reported);

      if (!canDelete) return next(createError("Cannot delete this complaint", 403));

      await prisma.complaint.delete({ where: { id: req.params.id } });
      res.json({ success: true, data: { message: "Complaint deleted" } });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
