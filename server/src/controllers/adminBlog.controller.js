import Blog from "../models/Blog.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { generateUniqueSlug } from "../utils/slug.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeStringArray = (items = []) => {
  const map = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const raw = typeof item === "string" ? item : item?.name;
    const value = (raw || "").trim();
    if (!value) return;
    const key = value.toLowerCase();
    if (!map.has(key)) map.set(key, value);
  });
  return [...map.values()];
};

export const getAllBlogs = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, status, isFeatured, tag, category } = req.query;
    const query = {};
    if (search)     query.$text       = { $search: search };
    if (status)     query.status      = status;
    if (isFeatured) query.isFeatured  = isFeatured === "true";
    if (tag)        query.tags        = { $in: [new RegExp(`^${escapeRegExp(tag)}$`, "i")] };
    if (category)   query.categories  = { $in: [new RegExp(`^${escapeRegExp(category)}$`, "i")] };

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("author", "name email avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(query),
    ]);

    return paginatedResponse(res, "Blogs fetched.", blogs, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email avatar");
    if (!blog) return errorResponse(res, "Blog not found.", 404);
    return successResponse(res, "Blog fetched.", blog);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const createBlog = async (req, res) => {
  try {
    const slug = await generateUniqueSlug(req.body.title, Blog);

    // Auto-calculate read time (avg 200 words/min)
    const wordCount = req.body.content?.split(/\s+/).length || 0;
    const readTime  = Math.ceil(wordCount / 200);

    const tags = normalizeStringArray(req.body.tags || []);
    const categories = normalizeStringArray(req.body.categories || []);

    const blog = await Blog.create({
      ...req.body,
      tags,
      categories,
      slug,
      readTime,
      author:      req.admin._id,
      publishedAt: req.body.status === "published" ? new Date() : null,
    });

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "blog.created",
      resource:     "Blog",
      resourceId:   blog._id,
      resourceName: blog.title,
      newData:      { title: blog.title, slug: blog.slug, status: blog.status },
      ip:           getIP(req),
      userAgent:    req.headers["user-agent"],
    });

    return successResponse(res, "Blog created.", blog, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return errorResponse(res, "Blog not found.", 404);

    const oldData = { title: blog.title, status: blog.status, isFeatured: blog.isFeatured };

    if (req.body.title && req.body.title !== blog.title)
      req.body.slug = await generateUniqueSlug(req.body.title, Blog, blog._id);

    if (req.body.content) {
      const wordCount  = req.body.content.split(/\s+/).length;
      req.body.readTime = Math.ceil(wordCount / 200);
    }

    if (req.body.tags) req.body.tags = normalizeStringArray(req.body.tags);
    if (req.body.categories) req.body.categories = normalizeStringArray(req.body.categories);

    // Set publishedAt when first publishing
    if (req.body.status === "published" && blog.status !== "published")
      req.body.publishedAt = new Date();

    Object.assign(blog, req.body);
    await blog.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "blog.updated",
      resource:     "Blog",
      resourceId:   blog._id,
      resourceName: blog.title,
      oldData,
      newData:      req.body,
      ip:           getIP(req),
    });

    return successResponse(res, "Blog updated.", blog);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return errorResponse(res, "Blog not found.", 404);

    await blog.deleteOne();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "blog.deleted",
      resource:     "Blog",
      resourceId:   blog._id,
      resourceName: blog.title,
      oldData:      { title: blog.title, slug: blog.slug },
      ip:           getIP(req),
    });

    return successResponse(res, "Blog deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const publishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return errorResponse(res, "Blog not found.", 404);

    blog.status      = "published";
    blog.publishedAt = blog.publishedAt || new Date();
    await blog.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "blog.published",
      resource:     "Blog",
      resourceId:   blog._id,
      resourceName: blog.title,
      ip:           getIP(req),
    });

    return successResponse(res, "Blog published.", blog);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const archiveBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: "archived" },
      { new: true }
    );
    if (!blog) return errorResponse(res, "Blog not found.", 404);

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "blog.archived",
      resource:     "Blog",
      resourceId:   blog._id,
      resourceName: blog.title,
      ip:           getIP(req),
    });

    return successResponse(res, "Blog archived.", blog);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const toggleFeaturedBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return errorResponse(res, "Blog not found.", 404);
    blog.isFeatured = !blog.isFeatured;
    await blog.save();
    return successResponse(res, `Blog ${blog.isFeatured ? "featured" : "unfeatured"}.`, blog);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};