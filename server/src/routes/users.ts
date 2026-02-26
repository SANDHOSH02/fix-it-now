import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";
import { createError } from "../middleware/errorHandler";

const router = Router();

// ─── GET /users/me ────────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sub } = (req as AuthenticatedRequest).user;
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: {
        id: true, name: true, email: true, role: true,
        district: true, phone: true, avatarUrl: true, createdAt: true,
      },
    });
    if (!user) return next(createError("User not found", 404));
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// ─── PATCH /users/me ──────────────────────────────────────────────────────────
router.patch(
  "/me",
  requireAuth,
  [
    body("name").optional().trim().notEmpty(),
    body("phone").optional().isMobilePhone("any"),
    body("district").optional().trim(),
    body("avatarUrl").optional().isURL(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) return next(createError("Validation failed", 422));

    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const { name, phone, district, avatarUrl } = req.body as {
        name?: string; phone?: string; district?: string; avatarUrl?: string;
      };
      const updated = await prisma.user.update({
        where: { id: sub },
        data: { name, phone, district, avatarUrl },
        select: { id: true, name: true, email: true, role: true, district: true, phone: true, avatarUrl: true },
      });
      res.json({ success: true, data: updated });
    } catch (err) { next(err); }
  },
);

// ─── GET /users/me/complaints ─────────────────────────────────────────────────
router.get("/me/complaints", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sub } = (req as AuthenticatedRequest).user;
    const complaints = await prisma.complaint.findMany({
      where: { reporterId: sub },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, refId: true, title: true, category: true, status: true,
        priority: true, city: true, district: true, createdAt: true, upvotes: true,
        department: { select: { name: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });
    res.json({ success: true, data: complaints });
  } catch (err) { next(err); }
});

// ─── GET /users/me/notifications ─────────────────────────────────────────────
router.get("/me/notifications", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sub } = (req as AuthenticatedRequest).user;
    const notifications = await prisma.notification.findMany({
      where: { userId: sub },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

// ─── PATCH /users/me/notifications/:id/read ──────────────────────────────────
router.patch(
  "/me/notifications/:id/read",
  requireAuth,
  param("id").isUUID(),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) return next(createError("Invalid ID", 400));
    try {
      const { sub } = (req as AuthenticatedRequest).user;
      await prisma.notification.updateMany({
        where: { id: req.params.id, userId: sub },
        data: { isRead: true },
      });
      res.json({ success: true, data: { message: "Marked as read" } });
    } catch (err) { next(err); }
  },
);

export default router;
