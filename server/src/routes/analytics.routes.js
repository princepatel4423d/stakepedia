import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import { getDashboardStats } from "../controllers/analytics.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("viewAnalytics"));
router.get("/dashboard", getDashboardStats);

export default router;