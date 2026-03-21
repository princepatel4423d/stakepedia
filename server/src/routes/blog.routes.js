import express from "express";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCommentValidator, updateCommentValidator } from "../validators/comment.validators.js";
import { getBlogs, getBlogBySlug, toggleLikeBlog, getFeaturedBlogs, trackBlogView } from "../controllers/blog.controller.js";
import {
  getComments, createComment, updateComment, deleteComment, likeComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get ("/",                                        getBlogs);
router.get ("/featured",                                getFeaturedBlogs);
router.get ("/:slug",                   optionalAuth,   getBlogBySlug);
router.post("/:slug/like",              protect,        toggleLikeBlog);
router.post("/:id/track-view",          protect,        trackBlogView);

router.get   ("/:blogId/comments",                      optionalAuth, getComments);
router.post  ("/:blogId/comments",                      protect, createCommentValidator, validate, createComment);
router.put   ("/:blogId/comments/:commentId",           protect, updateCommentValidator, validate, updateComment);
router.delete("/:blogId/comments/:commentId",           protect, deleteComment);
router.post  ("/:blogId/comments/:commentId/like",      protect, likeComment);

export default router;