import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { requireAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";
import { createError } from "../middleware/errorHandler";

const router = Router();

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
      .matches(/[0-9]/).withMessage("Password must contain a number"),
    body("district").optional().trim(),
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
      const { name, email, password, district } = req.body as {
        name: string; email: string; password: string; district?: string;
      };

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return next(createError("Email already registered", 409));

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, passwordHash, district },
        select: { id: true, name: true, email: true, role: true, district: true, createdAt: true },
      });

      const tokenPayload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = signAccessToken(tokenPayload);
      const refreshToken = signRefreshToken(tokenPayload);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(createError("Invalid credentials", 400));

    try {
      const { email, password } = req.body as { email: string; password: string };

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, role: true, district: true, passwordHash: true, isActive: true },
      });

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return next(createError("Invalid email or password", 401));
      }
      if (!user.isActive) return next(createError("Account is deactivated", 403));

      const tokenPayload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = signAccessToken(tokenPayload);
      const refreshToken = signRefreshToken(tokenPayload);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _pw, ...safeUser } = user;
      res.json({ success: true, data: { user: safeUser, accessToken, refreshToken } });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return next(createError("Refresh token is required", 400));

  try {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });

    if (!stored || stored.expiresAt < new Date()) {
      return next(createError("Refresh token expired or revoked", 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user?.isActive) return next(createError("Account is deactivated", 403));

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newRefresh = signRefreshToken({ sub: user.id, email: user.email, role: user.role });
    await prisma.refreshToken.create({
      data: {
        token: newRefresh,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
  } catch {
    next(createError("Invalid refresh token", 401));
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    try {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    } catch {
      // silent
    }
  }
  res.json({ success: true, data: { message: "Logged out" } });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sub } = (req as AuthenticatedRequest).user;
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, name: true, email: true, role: true, district: true, phone: true, avatarUrl: true, createdAt: true },
    });
    if (!user) return next(createError("User not found", 404));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
