import Comment from "../models/Comment.model.js";
import Blog from "../models/Blog.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

export const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page, limit, skip } = getPagination(req.query);

    // Only top-level comments (no parentComment)
    const query = { blog: blogId, isApproved: true, parentComment: null };

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate("user", "name avatar isEmailVerified")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(query),
    ]);

    // Attach replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id,
          isApproved: true,
        }).populate("user", "name avatar isEmailVerified").sort("createdAt");

        return { ...comment.toJSON(), replies };
      })
    );

    return paginatedResponse(res, "Comments fetched.", commentsWithReplies, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const createComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, parentComment } = req.body;

    const blog = await Blog.findOne({ _id: blogId, status: "published" });
    if (!blog) return errorResponse(res, "Blog not found.", 404);

    // Auto-approve for verified users, pending for unverified
    const isApproved = req.user.isEmailVerified;

    const comment = await Comment.create({
      user: req.user._id,
      blog: blogId,
      content,
      parentComment: parentComment || null,
      isApproved,
    });

    // Only bump count for top-level approved comments
    if (!parentComment && isApproved) {
      blog.commentCount++;
      await blog.save();
    }

    await comment.populate("user", "name avatar isEmailVerified");

    const message = isApproved
      ? "Comment posted."
      : "Comment submitted and awaiting approval (email not verified).";

    return successResponse(res, message, comment, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, user: req.user._id });
    if (!comment) return errorResponse(res, "Comment not found.", 404);

    comment.content = req.body.content;
    await comment.save();
    return successResponse(res, "Comment updated.", comment);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, user: req.user._id });
    if (!comment) return errorResponse(res, "Comment not found.", 404);

    // Delete replies too
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    // Decrement blog comment count
    if (!comment.parentComment && comment.isApproved) {
      await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentCount: -1 } });
    }

    return successResponse(res, "Comment deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { $inc: { likeCount: 1 } },
      { new: true }
    );
    if (!comment) return errorResponse(res, "Comment not found.", 404);
    return successResponse(res, "Comment liked.", { likeCount: comment.likeCount });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminGetAllComments = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { isApproved, blogId } = req.query;
    const query = {};
    if (blogId) query.blog = blogId;
    if (isApproved !== undefined) query.isApproved = isApproved === "true";

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate("user", "name email avatar")
        .populate("blog", "title slug")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(query),
    ]);

    return paginatedResponse(res, "Comments fetched.", comments, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const adminApproveComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { isApproved: true },
      { new: true }
    ).populate("user", "name email").populate("blog", "title");
    if (!comment) return errorResponse(res, "Comment not found.", 404);

    if (!comment.parentComment) {
      await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentCount: 1 } });
    }

    await createAuditLog({
      adminId: req.admin._id,
      action: "comment.approved",
      resource: "Comment",
      resourceId: comment._id,
      resourceName: `Comment by ${comment.user?.name}`,
      ip: getIP(req),
    });

    return successResponse(res, "Comment approved.", comment);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const adminDeleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return errorResponse(res, "Comment not found.", 404);

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    if (!comment.parentComment && comment.isApproved) {
      await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentCount: -1 } });
    }

    await createAuditLog({
      adminId: req.admin._id,
      action: "comment.deleted",
      resource: "Comment",
      resourceId: comment._id,
      resourceName: `Comment by user`,
      ip: getIP(req),
    });

    return successResponse(res, "Comment deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};