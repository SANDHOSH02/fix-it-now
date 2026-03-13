import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import prisma from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

const router = Router();

// ─── GET /departments ─────────────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { complaints: true } },
      },
    });
    res.json({ success: true, data: departments });
  } catch (err) { next(err); }
});

// ─── GET /departments/:id ─────────────────────────────────────────────────────
router.get("/:id", param("id").isUUID(), async (req: Request, res: Response, next: NextFunction) => {
  if (!validationResult(req).isEmpty()) return next(createError("Invalid ID", 400));
  try {
    const id = req.params.id as string;
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { complaints: true } } },
    });
    if (!dept) return next(createError("Department not found", 404));
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
});

// ─── POST /departments ────────────────────────────────────────────────────────
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description").optional().trim(),
    body("contactEmail").optional().isEmail(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(createError("Validation failed", 422));
    try {
      const { name, description, contactEmail } = req.body as {
        name: string; description?: string; contactEmail?: string;
      };
      const dept = await prisma.department.create({ data: { name, description, contactEmail } });
      res.status(201).json({ success: true, data: dept });
    } catch (err) { next(err); }
  },
);

export default router;
