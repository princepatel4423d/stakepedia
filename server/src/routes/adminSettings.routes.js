import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getSettings, updateSettings,
  updateLogo, updateFavicon, toggleMaintenance,
} from "../controllers/adminSettings.controller.js";

const router = express.Router();
router.use(protectAdmin);

router.get   ("/",            getSettings);
router.put   ("/",            requirePermission("manageSettings"), updateSettings);
router.patch ("/logo",        requirePermission("manageSettings"), uploadSingle("settings", "logo"),    updateLogo);
router.patch ("/favicon",     requirePermission("manageSettings"), uploadSingle("settings", "favicon"), updateFavicon);
router.patch ("/maintenance", requirePermission("manageSettings"), toggleMaintenance);

export default router;