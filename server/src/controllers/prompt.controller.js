import Prompt from "../models/Prompt.model.js";
import User from "../models/User.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getPrompts = async (req, res) => {
  try {
    const { page, limit, skip }                               = getPagination(req.query);
    const { search, category, tag, tool, isFeatured, sort = "-createdAt" } = req.query;
    const query = { status: "published" };
    if (search)     query.$text      = { $search: search };
    if (category) {
      query.$or = [
        { category },
        { categories: category },
      ];
    }
    if (tag)        query.tags       = { $in: [new RegExp(`^${escapeRegExp(tag)}$`, "i")] };
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
    if (isFeatured) query.isFeatured = isFeatured === "true";

    const [prompts, total] = await Promise.all([
      Prompt.find(query)
        .populate("tool", "name slug logo")
        .populate("tools", "name slug logo")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Prompt.countDocuments(query),
    ]);

    const likedPromptIds = req.user
      ? new Set((req.user.likedPrompts || []).map((id) => id.toString()))
      : null;

    const promptsWithLikeState = prompts.map((prompt) => {
      const data = prompt.toJSON();
      return {
        ...data,
        isLiked: likedPromptIds ? likedPromptIds.has(prompt._id.toString()) : false,
      };
    });

    return paginatedResponse(res, "Prompts fetched.", promptsWithLikeState, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getPromptBySlug = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({ slug: req.params.slug, status: "published" })
      .populate("tool", "name slug logo url")
      .populate("tools", "name slug logo url");
    if (!prompt) return errorResponse(res, "Prompt not found.", 404);

    const isLiked = req.user
      ? (req.user.likedPrompts || []).some((id) => id.toString() === prompt._id.toString())
      : false;

    return successResponse(res, "Prompt fetched.", { ...prompt.toJSON(), isLiked });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const trackPromptUsage = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, status: "published" });
    if (!prompt) return errorResponse(res, "Prompt not found.", 404);

    prompt.usageCount = (prompt.usageCount || 0) + 1;
    await prompt.save();

    return successResponse(res, "Prompt usage tracked.", { usageCount: prompt.usageCount });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const toggleLikePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt || prompt.status !== "published") return errorResponse(res, "Prompt not found.", 404);

    const user = await User.findById(req.user._id);
    const likedPromptIds = user.likedPrompts || [];
    const isLiked = likedPromptIds.some((id) => id.toString() === prompt._id.toString());

    if (isLiked) {
      user.likedPrompts = likedPromptIds.filter((id) => id.toString() !== prompt._id.toString());
      prompt.likeCount = Math.max(0, (prompt.likeCount || 0) - 1);
    } else {
      user.likedPrompts = [...likedPromptIds, prompt._id];
      prompt.likeCount = (prompt.likeCount || 0) + 1;
    }

    await Promise.all([user.save(), prompt.save()]);
    return successResponse(res, isLiked ? "Prompt unliked." : "Prompt liked.", {
      isLiked: !isLiked,
      likeCount: prompt.likeCount,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getPromptCategories = async (_req, res) => {
  try {
    const categories = await Prompt.distinct("category", { status: "published" });
    return successResponse(res, "Prompt categories fetched.", categories);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};