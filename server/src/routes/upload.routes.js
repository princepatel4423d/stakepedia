import express from "express";
import { protectAny, protectAdmin } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import { uploadImage, deleteImage } from "../controllers/upload.controller.js";

const router = express.Router();

// Dynamically pick folder from query param
router.post("/image", protectAny, (req, res, next) => {
  const folder = req.query.folder || "general";
  uploadSingle(folder, "image")(req, res, next);
}, uploadImage);

router.delete("/image", protectAdmin, deleteImage);

export default router;