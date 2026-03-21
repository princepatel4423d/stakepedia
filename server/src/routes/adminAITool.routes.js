import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import { uploadFields } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createAIToolValidator, updateAIToolValidator } from "../validators/aitool.validators.js";
import {
  getAllAITools, getAIToolById, createAITool,
  updateAITool, deleteAITool, publishAITool, archiveAITool, toggleFeaturedAITool,
} from "../controllers/adminAITool.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("manageAITools"));

router.get   ("/",            getAllAITools);
router.post  ("/",            uploadFields("ai-tools", [{ name: "logo", maxCount: 1 }, { name: "coverImage", maxCount: 1 }, { name: "screenshots", maxCount: 5 }]), createAIToolValidator, validate, createAITool);
router.get   ("/:id",         getAIToolById);
router.put   ("/:id",         uploadFields("ai-tools", [{ name: "logo", maxCount: 1 }, { name: "coverImage", maxCount: 1 }, { name: "screenshots", maxCount: 5 }]), updateAIToolValidator, validate, updateAITool);
router.delete("/:id",         deleteAITool);
router.patch ("/:id/publish", publishAITool);
router.patch ("/:id/archive", archiveAITool);
router.patch ("/:id/featured", toggleFeaturedAITool);

export default router;