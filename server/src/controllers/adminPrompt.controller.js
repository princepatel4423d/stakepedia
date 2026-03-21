import Prompt from "../models/Prompt.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { generateUniqueSlug } from "../utils/slug.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeStringArray = (items = []) => {
  const map = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const value = typeof item === "string" ? item.trim() : "";
    if (!value) return;
    const key = value.toLowerCase();
    if (!map.has(key)) map.set(key, value);
  });
  return [...map.values()];
};

const normalizePromptCategory = (payload = {}) => {
  if (typeof payload?.category === "string" && payload.category.trim()) {
    return payload.category.trim();
  }
  if (Array.isArray(payload?.categories) && payload.categories.length) {
    const first = String(payload.categories[0] || "").trim();
    if (first) return first;
  }
  return "";
};

const normalizePromptCategories = (payload = {}) => {
  const fromArray = normalizeStringArray(payload?.categories || []);
  const fromSingle = normalizePromptCategory(payload);
  const merged = normalizeStringArray(fromSingle ? [fromSingle, ...fromArray] : fromArray);
  return {
    categories: merged,
    primaryCategory: merged[0] || "",
  };
};

const normalizePromptTools = (payload = {}) => {
  const incoming = Array.isArray(payload?.tools) && payload.tools.length
    ? payload.tools
    : (payload?.tool ? [payload.tool] : []);

  const unique = [...new Set(incoming.map((item) => String(item).trim()).filter(Boolean))];

  return {
    tools: unique,
    primaryTool: unique[0] || null,
  };
};

export const getAllPrompts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, status, category, isFeatured, tool } = req.query;
    const query = {};
    if (search)     query.$text      = { $search: search };
    if (status)     query.status     = status;
    if (category) {
      query.$or = [
        { category },
        { categories: category },
      ];
    }
    if (isFeatured) query.isFeatured = isFeatured === "true";
    if (tool) {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { tool },
            { tools: tool },
          ],
        },
      ];
    }
    if (req.query.tag) query.tags    = { $in: [new RegExp(`^${escapeRegExp(req.query.tag)}$`, "i")] };

    const [prompts, total] = await Promise.all([
      Prompt.find(query)
        .populate("tool", "name slug logo")
        .populate("tools", "name slug logo")
        .populate("addedBy", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Prompt.countDocuments(query),
    ]);

    return paginatedResponse(res, "Prompts fetched.", prompts, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getPromptById = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id)
      .populate("tool", "name slug logo")
      .populate("tools", "name slug logo")
      .populate("addedBy", "name email");
    if (!prompt) return errorResponse(res, "Prompt not found.", 404);
    return successResponse(res, "Prompt fetched.", prompt);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const createPrompt = async (req, res) => {
  try {
    const slug   = await generateUniqueSlug(req.body.title, Prompt);
    const tags = normalizeStringArray(req.body.tags || []);
    const { categories, primaryCategory } = normalizePromptCategories(req.body);
    const { tools, primaryTool } = normalizePromptTools(req.body);

    if (!primaryCategory) {
      return errorResponse(res, "Category is required.", 400);
    }

    const prompt = await Prompt.create({
      ...req.body,
      category: primaryCategory,
      categories,
      tool: primaryTool,
      tools,
      tags,
      slug,
      addedBy: req.admin._id,
    });

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "prompt.created",
      resource:     "Prompt",
      resourceId:   prompt._id,
      resourceName: prompt.title,
      newData:      {
        title: prompt.title,
        slug: prompt.slug,
        category: prompt.category,
        categories: prompt.categories,
        tool: prompt.tool,
        tools: prompt.tools,
      },
      ip:           getIP(req),
      userAgent:    req.headers["user-agent"],
    });

    return successResponse(res, "Prompt created.", prompt, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updatePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return errorResponse(res, "Prompt not found.", 404);

    const oldData = {
      title: prompt.title,
      status: prompt.status,
      category: prompt.category,
      categories: prompt.categories,
    };

    if (req.body.title && req.body.title !== prompt.title)
      req.body.slug = await generateUniqueSlug(req.body.title, Prompt, prompt._id);

    if (req.body.tags) req.body.tags = normalizeStringArray(req.body.tags);

    if (req.body.category !== undefined || req.body.categories !== undefined) {
      const { categories, primaryCategory } = normalizePromptCategories(req.body);
      if (!primaryCategory) return errorResponse(res, "Category is required.", 400);
      req.body.category = primaryCategory;
      req.body.categories = categories;
    }

    if (req.body.tool !== undefined || req.body.tools !== undefined) {
      const { tools, primaryTool } = normalizePromptTools(req.body);
      req.body.tools = tools;
      req.body.tool = primaryTool;
    }

    Object.assign(prompt, req.body);
    await prompt.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "prompt.updated",
      resource:     "Prompt",
      resourceId:   prompt._id,
      resourceName: prompt.title,
      oldData,
      newData:      req.body,
      ip:           getIP(req),
    });

    return successResponse(res, "Prompt updated.", prompt);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return errorResponse(res, "Prompt not found.", 404);

    await prompt.deleteOne();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "prompt.deleted",
      resource:     "Prompt",
      resourceId:   prompt._id,
      resourceName: prompt.title,
      oldData:      { title: prompt.title, slug: prompt.slug },
      ip:           getIP(req),
    });

    return successResponse(res, "Prompt deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const publishPrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return errorResponse(res, "Prompt not found.", 404);

    prompt.status = "published";
    prompt.publishedAt = prompt.publishedAt || new Date();
    await prompt.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "prompt.published",
      resource:     "Prompt",
      resourceId:   prompt._id,
      resourceName: prompt.title,
      ip:           getIP(req),
    });

    return successResponse(res, "Prompt published.", prompt);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const toggleFeaturedPrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return errorResponse(res, "Prompt not found.", 404);
    prompt.isFeatured = !prompt.isFeatured;
    await prompt.save();
    return successResponse(res, `Prompt ${prompt.isFeatured ? "featured" : "unfeatured"}.`, prompt);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};