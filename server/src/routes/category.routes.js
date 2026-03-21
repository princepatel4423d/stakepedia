import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import {
  getAllCategories, getCategoryById, createCategory,
  updateCategory, deleteCategory,
} from "../controllers/adminCategory.controller.js";
import Category from "../models/Category.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const router = express.Router();

// Public
router.get("/public", async (_req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("name");
    return successResponse(res, "Categories fetched.", categories);
  } catch (err) { return errorResponse(res, err.message, 500); }
});

// Admin
router.get   ("/",              protectAdmin, requirePermission("manageAITools"), getAllCategories);
router.post  ("/",              protectAdmin, requirePermission("manageAITools"), createCategory);
router.get   ("/:id",           protectAdmin, requirePermission("manageAITools"), getCategoryById);
router.put   ("/:id",           protectAdmin, requirePermission("manageAITools"), updateCategory);
router.delete("/:id",           protectAdmin, requirePermission("manageAITools"), deleteCategory);

export default router;