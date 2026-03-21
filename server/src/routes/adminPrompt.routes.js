import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createPromptValidator, updatePromptValidator } from "../validators/prompt.validators.js";
import {
  getAllPrompts, getPromptById, createPrompt, updatePrompt,
  deletePrompt, publishPrompt, toggleFeaturedPrompt,
} from "../controllers/adminPrompt.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("managePrompts"));

router.get   ("/",             getAllPrompts);
router.post  ("/",             createPromptValidator, validate, createPrompt);
router.get   ("/:id",          getPromptById);
router.put   ("/:id",          updatePromptValidator, validate, updatePrompt);
router.delete("/:id",          deletePrompt);
router.patch ("/:id/publish",  publishPrompt);
router.patch ("/:id/featured", toggleFeaturedPrompt);

export default router;