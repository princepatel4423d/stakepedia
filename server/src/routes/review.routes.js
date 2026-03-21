import express from "express";
import { protect, protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createReviewValidator, updateReviewValidator } from "../validators/review.validators.js";
import {
  getReviews, createReview, updateReview, deleteReview, markHelpful,
  adminGetAllReviews, adminApproveReview, adminRejectReview, adminDeleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

router.get   ("/admin/all",               protectAdmin, requirePermission("manageModeration"), adminGetAllReviews);
router.patch ("/admin/:reviewId/approve", protectAdmin, requirePermission("manageModeration"), adminApproveReview);
router.patch ("/admin/:reviewId/reject",  protectAdmin, requirePermission("manageModeration"), adminRejectReview);
router.delete("/admin/:reviewId",         protectAdmin, requirePermission("manageModeration"), adminDeleteReview);

router.get   ("/:targetType/:targetId",                getReviews);
router.post  ("/:targetType/:targetId",                protect, createReviewValidator, validate, createReview);
router.put   ("/:targetType/:targetId/:reviewId",      protect, updateReviewValidator, validate, updateReview);
router.delete("/:targetType/:targetId/:reviewId",      protect, deleteReview);
router.post  ("/:targetType/:targetId/:reviewId/helpful", protect, markHelpful);

export default router;