import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createBlogValidator, updateBlogValidator } from "../validators/blog.validators.js";
import {
  getAllBlogs, getBlogById, createBlog, updateBlog,
  deleteBlog, publishBlog, archiveBlog, toggleFeaturedBlog,
} from "../controllers/adminBlog.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("manageBlogs"));

router.get   ("/",             getAllBlogs);
router.post  ("/",             uploadSingle("blogs", "coverImage"), createBlogValidator, validate, createBlog);
router.get   ("/:id",          getBlogById);
router.put   ("/:id",          uploadSingle("blogs", "coverImage"), updateBlogValidator, validate, updateBlog);
router.delete("/:id",          deleteBlog);
router.patch ("/:id/publish",  publishBlog);
router.patch ("/:id/archive",  archiveBlog);
router.patch ("/:id/featured", toggleFeaturedBlog);

export default router;