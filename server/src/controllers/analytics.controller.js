import User      from "../models/User.model.js";
import AITool    from "../models/AITool.model.js";
import Blog      from "../models/Blog.model.js";
import Course    from "../models/Course.model.js";
import Prompt    from "../models/Prompt.model.js";
import Review    from "../models/Review.model.js";
import AuditLog  from "../models/AuditLog.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getDashboardStats = async (req, res) => {
  try {
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last7  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);

    const [
      totalUsers, newUsersLast30, newUsersLast7,
      totalTools, publishedTools, draftTools,
      totalBlogs, publishedBlogs, draftBlogs,
      totalCourses, publishedCourses, draftCourses,
      totalPrompts, publishedPrompts, draftPrompts,
      totalReviews, pendingReviews,
      recentAuditLogs,
      topTools,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: last30 } }),
      User.countDocuments({ createdAt: { $gte: last7 } }),
      AITool.countDocuments(),
      AITool.countDocuments({ status: "published" }),
      AITool.countDocuments({ status: "draft" }),
      Blog.countDocuments(),
      Blog.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "draft" }),
      Course.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Course.countDocuments({ status: "draft" }),
      Prompt.countDocuments(),
      Prompt.countDocuments({ status: "published" }),
      Prompt.countDocuments({ status: "draft" }),
      Review.countDocuments(),
      Review.countDocuments({ isApproved: false }),
      AuditLog.find()
        .populate("admin", "name avatar role")
        .sort("-createdAt")
        .limit(10),
      AITool.find({ status: "published" })
        .sort("-viewCount")
        .limit(5)
        .select("name slug logo viewCount likeCount averageRating"),
    ]);

    return successResponse(res, "Dashboard stats fetched.", {
      users: {
        total:      totalUsers,
        last30Days: newUsersLast30,
        last7Days:  newUsersLast7,
      },
      content: {
        aiTools:  { total: totalTools,   published: publishedTools,   draft: draftTools },
        blogs:    { total: totalBlogs,   published: publishedBlogs,   draft: draftBlogs },
        courses:  { total: totalCourses, published: publishedCourses, draft: draftCourses },
        prompts:  { total: totalPrompts, published: publishedPrompts, draft: draftPrompts },
      },
      reviews: {
        total:   totalReviews,
        pending: pendingReviews,
      },
      recentActivity: recentAuditLogs,
      topTools,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getPublicStats = async (_req, res) => {
  try {
    const [
      usersTotal,
      toolsTotal,
      blogsTotal,
      coursesTotal,
      promptsTotal,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      AITool.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "published" }),
      Course.countDocuments({ status: "published" }),
      Prompt.countDocuments({ status: "published" }),
    ]);

    return successResponse(res, "Public stats fetched.", {
      users: { total: usersTotal },
      content: {
        aiTools: { total: toolsTotal },
        blogs: { total: blogsTotal },
        courses: { total: coursesTotal },
        prompts: { total: promptsTotal },
      },
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};