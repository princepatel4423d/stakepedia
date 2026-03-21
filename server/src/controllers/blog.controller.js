import Blog    from "../models/Blog.model.js";
import User    from "../models/User.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getBlogs = async (req, res) => {
  try {
    const { page, limit, skip }        = getPagination(req.query);
    const { search, tag, category, isFeatured, sort = "-publishedAt" } = req.query;
    const query = { status: "published" };
    if (search)     query.$text      = { $search: search };
    if (tag)        query.tags       = { $in: [new RegExp(`^${escapeRegExp(tag)}$`, "i")] };
    if (category)   query.categories = { $in: [new RegExp(`^${escapeRegExp(category)}$`, "i")] };
    if (isFeatured) query.isFeatured = isFeatured === "true";

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("author", "name avatar")
        .select("-content")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(query),
    ]);

    return paginatedResponse(res, "Blogs fetched.", blogs, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: "published" })
      .populate("author", "name avatar bio");

    if (!blog) return errorResponse(res, "Blog not found.", 404);

    // Check if current user liked this blog
    const isLiked = req.user
      ? await User.exists({ _id: req.user._id, likedBlogs: blog._id })
      : false;

    return successResponse(res, "Blog fetched.", { ...blog.toJSON(), isLiked: !!isLiked });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const trackBlogView = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, status: "published" });
    if (!blog) return errorResponse(res, "Blog not found.", 404);

    blog.viewCount = (blog.viewCount || 0) + 1;
    await blog.save();

    return successResponse(res, "Blog view tracked.", { viewCount: blog.viewCount });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const toggleLikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: "published" });
    if (!blog) return errorResponse(res, "Blog not found.", 404);

    const user    = await User.findById(req.user._id);
    const isLiked = user.likedBlogs.includes(blog._id);

    if (isLiked) {
      user.likedBlogs = user.likedBlogs.filter((id) => id.toString() !== blog._id.toString());
      blog.likeCount  = Math.max(0, blog.likeCount - 1);
    } else {
      user.likedBlogs.push(blog._id);
      blog.likeCount++;
    }

    await Promise.all([user.save(), blog.save()]);
    return successResponse(res, isLiked ? "Blog unliked." : "Blog liked.", { isLiked: !isLiked, likeCount: blog.likeCount });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getFeaturedBlogs = async (_req, res) => {
  try {
    const blogs = await Blog.find({ status: "published", isFeatured: true })
      .populate("author", "name avatar")
      .select("-content")
      .sort("-publishedAt")
      .limit(6);
    return successResponse(res, "Featured blogs fetched.", blogs);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};