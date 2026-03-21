import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import { adminGetAllComments, adminApproveComment, adminDeleteComment } from "../controllers/comment.controller.js";

const router = express.Router();

// Admin-only standalone comment management
router.use(protectAdmin, requirePermission("manageModeration"));

router.get   ("/",                       adminGetAllComments);
router.patch ("/:commentId/approve",     adminApproveComment);
router.delete("/:commentId",             adminDeleteComment);

export default router;