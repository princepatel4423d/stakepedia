import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCategoryValidator, updateCategoryValidator } from "../validators/category.validators.js";
import {
  getAllCategories, getCategoryById, createCategory,
  updateCategory, deleteCategory,
} from "../controllers/adminCategory.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("manageAITools"));

router.get   ("/",          getAllCategories);
router.post  ("/",          createCategoryValidator, validate, createCategory);
router.get   ("/:id",       getCategoryById);
router.put   ("/:id",       updateCategoryValidator, validate, updateCategory);
router.delete("/:id",       deleteCategory);

export default router;