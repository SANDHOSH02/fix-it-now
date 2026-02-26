import { Router } from "express";
import authRoutes        from "./auth";
import complaintsRoutes  from "./complaints";
import usersRoutes       from "./users";
import departmentsRoutes from "./departments";
import adminRoutes       from "./admin";

const router = Router();

// ── Health check ──────────────────────────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

router.use("/auth",        authRoutes);
router.use("/complaints",  complaintsRoutes);
router.use("/users",       usersRoutes);
router.use("/departments", departmentsRoutes);
router.use("/admin",       adminRoutes);

export default router;
