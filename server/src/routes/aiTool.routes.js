// src/routes/aiTool.routes.js
import express from "express";
import { optionalAuth, protect } from "../middleware/auth.middleware.js";
import { getAITools, getAIToolBySlug, trackAIToolView } from "../controllers/aiTool.controller.js";

const router = express.Router();

router.get("/", getAITools);
router.get("/:slug", optionalAuth, getAIToolBySlug);
router.post("/:id/track-view", protect, trackAIToolView);

export default router;