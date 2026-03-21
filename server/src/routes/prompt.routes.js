import express from "express";
import { optionalAuth, protect } from "../middleware/auth.middleware.js";
import { getPrompts, getPromptBySlug, getPromptCategories, toggleLikePrompt, trackPromptUsage } from "../controllers/prompt.controller.js";

const router = express.Router();

router.get("/categories",  getPromptCategories);
router.get("/",            optionalAuth, getPrompts);
router.get("/:slug",       optionalAuth, getPromptBySlug);
router.post("/:id/like",   protect, toggleLikePrompt);
router.post("/:id/track-usage", protect, trackPromptUsage);

export default router;