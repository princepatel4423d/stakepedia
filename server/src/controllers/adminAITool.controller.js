import AITool   from "../models/AITool.model.js";
import Category from "../models/Category.model.js";
import Prompt   from "../models/Prompt.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { generateUniqueSlug } from "../utils/slug.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

const normalizeCategoryIds = (payload) => {
  const raw = Array.isArray(payload?.categories) && payload.categories.length
    ? payload.categories
    : (payload?.category ? [payload.category] : []);
  return [...new Set(raw.map((id) => String(id)).filter(Boolean))];
};

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

export const getAllAITools = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, status, category, isFeatured, pricing } = req.query;
    const query = {};
    if (search)     query.$text = { $search: search };
    if (status)     query.status = status;
    if (category)   query.categories = category;
    if (isFeatured) query.isFeatured = isFeatured === "true";
    if (pricing)    query["pricing"] = pricing;
    if (req.query.tag) query.tags = { $in: [new RegExp(`^${escapeRegExp(req.query.tag)}$`, "i")] };

    const [tools, total] = await Promise.all([
      AITool.find(query)
        .populate("categories", "name slug color")
        .populate("prompts", "title slug status")
        .populate("addedBy", "name email")
        .sort("-createdAt").skip(skip).limit(limit),
      AITool.countDocuments(query),
    ]);

    return paginatedResponse(res, "AI tools fetched.", tools, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getAIToolById = async (req, res) => {
  try {
    const tool = await AITool.findById(req.params.id)
      .populate("categories", "name slug color")
      .populate("prompts", "title slug status")
      .populate("addedBy", "name email");
    if (!tool) return errorResponse(res, "AI tool not found.", 404);
    return successResponse(res, "AI tool fetched.", tool);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const createAITool = async (req, res) => {
  try {
    const normalizedCategories = normalizeCategoryIds(req.body);
    const normalizedTags = normalizeStringArray(req.body.tags || []);
    if (!normalizedCategories.length) return errorResponse(res, "At least one category is required.", 400);

    const slug = await generateUniqueSlug(req.body.name, AITool);
    const tool = await AITool.create({
      ...req.body,
      categories: normalizedCategories,
      tags: normalizedTags,
      slug,
      addedBy: req.admin._id,
    });

    if (req.body.prompts?.length) {
      await Prompt.updateMany(
        { _id: { $in: req.body.prompts } },
        { $set: { tool: tool._id } }
      );
    }

    await Category.updateMany({ _id: { $in: normalizedCategories } }, { $inc: { toolCount: 1 } });

    await createAuditLog({
      adminId: req.admin._id, action: "aitool.created", resource: "AITool",
      resourceId: tool._id, resourceName: tool.name,
      newData: { name: tool.name, slug: tool.slug, status: tool.status },
      ip: getIP(req),
    });

    return successResponse(res, "AI tool created.", tool, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateAITool = async (req, res) => {
  try {
    const tool = await AITool.findById(req.params.id);
    if (!tool) return errorResponse(res, "AI tool not found.", 404);
    const oldData = { name: tool.name, status: tool.status, isFeatured: tool.isFeatured };

    if (req.body.name && req.body.name !== tool.name)
      req.body.slug = await generateUniqueSlug(req.body.name, AITool, tool._id);

    // Sync category toolCount when categories change
    if (req.body.categories || req.body.category) {
      const oldCategories = (tool.categories || []).map((id) => String(id));
      const newCategories = normalizeCategoryIds(req.body);

      if (!newCategories.length) {
        return errorResponse(res, "At least one category is required.", 400);
      }

      const removed = oldCategories.filter((id) => !newCategories.includes(id));
      const added = newCategories.filter((id) => !oldCategories.includes(id));

      if (removed.length) {
        await Category.updateMany({ _id: { $in: removed } }, { $inc: { toolCount: -1 } });
      }
      if (added.length) {
        await Category.updateMany({ _id: { $in: added } }, { $inc: { toolCount: 1 } });
      }

      req.body.categories = newCategories;

      delete req.body.category;
    }

    if (req.body.prompts) {
      const oldPromptIds = (tool.prompts || []).map((id) => String(id));
      const newPromptIds = req.body.prompts.map((id) => String(id));
      const removedPromptIds = oldPromptIds.filter((id) => !newPromptIds.includes(id));
      const addedPromptIds = newPromptIds.filter((id) => !oldPromptIds.includes(id));

      if (removedPromptIds.length) {
        await Prompt.updateMany(
          { _id: { $in: removedPromptIds }, tool: tool._id },
          { $set: { tool: null } }
        );
      }

      if (addedPromptIds.length) {
        await Prompt.updateMany(
          { _id: { $in: addedPromptIds } },
          { $set: { tool: tool._id } }
        );
      }
    }

    if (req.body.tags) {
      req.body.tags = normalizeStringArray(req.body.tags);
    }

    Object.assign(tool, req.body);
    await tool.save();

    await createAuditLog({
      adminId: req.admin._id, action: "aitool.updated", resource: "AITool",
      resourceId: tool._id, resourceName: tool.name,
      oldData, newData: req.body,
      ip: getIP(req),
    });

    return successResponse(res, "AI tool updated.", tool);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteAITool = async (req, res) => {
  try {
    const tool = await AITool.findById(req.params.id);
    if (!tool) return errorResponse(res, "AI tool not found.", 404);

    if (tool.categories?.length) {
      await Category.updateMany({ _id: { $in: tool.categories } }, { $inc: { toolCount: -1 } });
    }
    await Prompt.updateMany({ tool: tool._id }, { $set: { tool: null } });
    await tool.deleteOne();

    await createAuditLog({
      adminId: req.admin._id, action: "aitool.deleted", resource: "AITool",
      resourceId: tool._id, resourceName: tool.name,
      oldData: { name: tool.name, slug: tool.slug },
      ip: getIP(req),
    });

    return successResponse(res, "AI tool deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const publishAITool = async (req, res) => {
  try {
    const tool = await AITool.findById(req.params.id);
    if (!tool) return errorResponse(res, "AI tool not found.", 404);

    tool.status = "published";
    tool.publishedAt = tool.publishedAt || new Date();
    await tool.save();

    await createAuditLog({
      adminId: req.admin._id, action: "aitool.published", resource: "AITool",
      resourceId: tool._id, resourceName: tool.name,
      ip: getIP(req),
    });

    return successResponse(res, "AI tool published.", tool);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const archiveAITool = async (req, res) => {
  try {
    const tool = await AITool.findByIdAndUpdate(
      req.params.id, { status: "archived" }, { new: true }
    );
    if (!tool) return errorResponse(res, "AI tool not found.", 404);

    await createAuditLog({
      adminId: req.admin._id, action: "aitool.archived", resource: "AITool",
      resourceId: tool._id, resourceName: tool.name,
      ip: getIP(req),
    });

    return successResponse(res, "AI tool archived.", tool);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const toggleFeaturedAITool = async (req, res) => {
  try {
    const tool = await AITool.findById(req.params.id);
    if (!tool) return errorResponse(res, "AI tool not found.", 404);

    tool.isFeatured = !tool.isFeatured;
    await tool.save();

    await createAuditLog({
      adminId: req.admin._id,
      action: tool.isFeatured ? "aitool.featured" : "aitool.unfeatured",
      resource: "AITool",
      resourceId: tool._id,
      resourceName: tool.name,
      newData: { isFeatured: tool.isFeatured },
      ip: getIP(req),
    });

    return successResponse(
      res,
      `AI tool ${tool.isFeatured ? "featured" : "unfeatured"}.`,
      tool
    );
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};