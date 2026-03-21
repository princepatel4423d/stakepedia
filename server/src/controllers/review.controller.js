import Review from "../models/Review.model.js";
import AITool from "../models/AITool.model.js";
import Course from "../models/Course.model.js";
import Blog from "../models/Blog.model.js";
import Prompt from "../models/Prompt.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";
import { notifyAllAdmins } from "../services/notification.service.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

// Map target type to its model for rating recalculation
const TARGET_MODELS = {
  AITool: AITool,
  Course: Course,
  Blog: Blog,
  Prompt: Prompt,
};

const recalculateRating = async (targetType, targetId) => {
  const Model = TARGET_MODELS[targetType];
  if (!Model) return;

  const stats = await Review.aggregate([
    { $match: { targetType, targetId, isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const avgRating = stats[0]?.avgRating || 0;
  const reviewCount = stats[0]?.count || 0;

  await Model.findByIdAndUpdate(targetId, {
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount,
  });
};

// ── Public ────────────────────────────────────────────────────────────────────

export const getReviews = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { page, limit, skip } = getPagination(req.query);

    if (!TARGET_MODELS[targetType])
      return errorResponse(res, "Invalid target type.", 400);

    const query = { targetType, targetId, isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("user", "name avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    // Rating distribution
    const distribution = await Review.aggregate([
      { $match: query },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    return paginatedResponse(res, "Reviews fetched.", { reviews, distribution }, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const createReview = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { rating, title, content } = req.body;

    if (!TARGET_MODELS[targetType])
      return errorResponse(res, "Invalid target type.", 400);

    // Prevent duplicate reviews
    const existing = await Review.findOne({ user: req.user._id, targetType, targetId });
    if (existing) return errorResponse(res, "You have already reviewed this.", 409);

    const review = await Review.create({
      user: req.user._id,
      targetType,
      targetId,
      rating,
      title,
      content,
      isApproved: false,
    });
    await review.populate("user", "name avatar");

    notifyAllAdmins({
      type: "new_review",
      title: "New review submitted",
      message: `A new ${targetType} review is waiting for approval.`,
      link: "/moderation/reviews",
      meta: { targetType, targetId },
    }).catch(() => { });

    return successResponse(res, "Review submitted and awaiting moderation.", review, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });
    if (!review) return errorResponse(res, "Review not found.", 404);

    const { rating, title, content } = req.body;
    review.rating = rating ?? review.rating;
    review.title = title ?? review.title;
    review.content = content ?? review.content;
    await review.save();

    await recalculateRating(review.targetType, review.targetId);
    return successResponse(res, "Review updated.", review);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });
    if (!review) return errorResponse(res, "Review not found.", 404);

    const { targetType, targetId } = review;
    await review.deleteOne();
    await recalculateRating(targetType, targetId);

    return successResponse(res, "Review deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    if (!review) return errorResponse(res, "Review not found.", 404);
    return successResponse(res, "Marked as helpful.", { helpfulCount: review.helpfulCount });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminGetAllReviews = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { targetType, isApproved, rating } = req.query;
    const query = {};
    if (targetType) query.targetType = targetType;
    if (isApproved !== undefined) query.isApproved = isApproved === "true";
    if (rating) query.rating = Number(rating);

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("user", "name email avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    return paginatedResponse(res, "Reviews fetched.", reviews, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const adminApproveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { isApproved: true },
      { new: true }
    ).populate("user", "name email");
    if (!review) return errorResponse(res, "Review not found.", 404);

    await recalculateRating(review.targetType, review.targetId);

    await createAuditLog({
      adminId: req.admin._id,
      action: "review.approved",
      resource: "Review",
      resourceId: review._id,
      resourceName: `${review.targetType} review by ${review.user?.name}`,
      ip: getIP(req),
    });

    return successResponse(res, "Review approved.", review);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const adminRejectReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { isApproved: false },
      { new: true }
    ).populate("user", "name email");
    if (!review) return errorResponse(res, "Review not found.", 404);

    await recalculateRating(review.targetType, review.targetId);

    await createAuditLog({
      adminId: req.admin._id,
      action: "review.rejected",
      resource: "Review",
      resourceId: review._id,
      resourceName: `${review.targetType} review by ${review.user?.name}`,
      ip: getIP(req),
    });

    return successResponse(res, "Review rejected.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return errorResponse(res, "Review not found.", 404);

    const { targetType, targetId } = review;
    await review.deleteOne();
    await recalculateRating(targetType, targetId);

    await createAuditLog({
      adminId: req.admin._id,
      action: "review.deleted",
      resource: "Review",
      resourceId: review._id,
      resourceName: `${review.targetType} review`,
      ip: getIP(req),
    });

    return successResponse(res, "Review deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};