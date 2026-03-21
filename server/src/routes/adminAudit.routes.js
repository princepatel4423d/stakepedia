import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import {
  getAuditLogs, getAuditLogById,
  getAuditLogsByResource, getAuditStats,
} from "../controllers/auditLog.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("viewAuditLogs"));

router.get("/",                          getAuditLogs);
router.get("/stats",                     getAuditStats);
router.get("/:id",                       getAuditLogById);
router.get("/:resourceType/:resourceId", getAuditLogsByResource);

export default router;