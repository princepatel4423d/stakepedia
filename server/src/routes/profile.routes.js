import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getProfile, updateProfile, updateAvatar,
  changePassword, getSavedTools, getUserActivity,
} from "../controllers/profile.controller.js";

const router = express.Router();
router.use(protect);

router.get   ("/",              getProfile);
router.put   ("/",              updateProfile);
router.patch ("/avatar",        uploadSingle("avatars", "avatar"), updateAvatar);
router.patch ("/change-password", changePassword);
router.get   ("/saved-tools",   getSavedTools);
router.get   ("/activity",      getUserActivity);

export default router;