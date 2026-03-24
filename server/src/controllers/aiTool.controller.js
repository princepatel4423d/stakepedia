import AITool from "../models/AITool.model.js";
import Prompt from "../models/Prompt.model.js";
import Review from "../models/Review.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toYoutubeEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
};

export const getAITools = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, category, tag, pricing, sort = "-createdAt" } = req.query;
    const query = { status: "published" };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (tag) query.tags = { $in: [new RegExp(`^${escapeRegExp(tag)}$`, "i")] };
    if (pricing) query.pricing = pricing;

    const [tools, total] = await Promise.all([
      AITool.find(query)
        .populate("category", "name slug color")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      AITool.countDocuments(query),
    ]);

    return paginatedResponse(res, "AI tools fetched.", tools, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getAIToolBySlug = async (req, res) => {
  try {
    const reviewLimit = Math.min(Math.max(Number(req.query.reviewLimit || 6), 1), 20);
    const promptLimit = Math.min(Math.max(Number(req.query.promptLimit || 8), 1), 24);

    const tool = await AITool.findOne({ slug: req.params.slug, status: "published" })
      .populate("category", "name slug color")
      .populate("prompts", "title slug description content tags usageCount likeCount createdAt status");
    if (!tool) return errorResponse(res, "AI tool not found.", 404);

    const [linkedPrompts, reviews, reviewDistribution] = await Promise.all([
      Prompt.find({ tool: tool._id, status: "published" })
        .select("title slug description content tags usageCount likeCount createdAt")
        .sort("-isFeatured -createdAt")
        .limit(promptLimit),
      Review.find({ targetType: "AITool", targetId: tool._id, isApproved: true })
        .populate("user", "name avatar")
        .sort("-createdAt")
        .limit(reviewLimit),
      Review.aggregate([
        { $match: { targetType: "AITool", targetId: tool._id, isApproved: true } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

    const data = tool.toObject();
    data.tutorials = (data.tutorials || []).map((tutorial) => ({
      ...tutorial,
      youtubeEmbedUrl: toYoutubeEmbedUrl(tutorial.youtubeUrl),
    }));

    const selectedPrompts = (data.prompts || [])
      .filter((prompt) => prompt.status === "published")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, promptLimit);
    const relatedPrompts = selectedPrompts.length ? selectedPrompts : linkedPrompts;

    data.detailSections = {
      overview: {
        shortDescription: data.shortDescription || null,
        description: data.description,
        features: data.features || [],
        useCases: data.useCases || [],
        pros: data.pros || [],
        cons: data.cons || [],
      },
      tutorials: data.tutorials,
      prompts: relatedPrompts,
      pricing: {
        type: data.pricing,
        pricingDetails: data.pricingDetails || null,
        hasFreeTrial: !!data.hasFreeTrial,
        freeTrialDays: data.freeTrialDays || null,
        plans: data.pricingPlans || [],
      },
      toolInformation: {
        companyName: data.companyName || null,
        developerName: data.developerName || null,
        foundedYear: data.foundedYear || null,
        headquarters: data.headquarters || null,
        supportEmail: data.supportEmail || null,
        docsUrl: data.docsUrl || null,
        apiAvailable: !!data.apiAvailable,
      },
    };

    data.relatedPrompts = relatedPrompts;
    data.reviews = {
      items: reviews,
      distribution: reviewDistribution,
      total: tool.reviewCount || reviews.length,
      averageRating: tool.averageRating || 0,
    };

    return successResponse(res, "AI tool fetched.", data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const trackAIToolView = async (req, res) => {
  try {
    const tool = await AITool.findOne({ _id: req.params.id, status: "published" });
    if (!tool) return errorResponse(res, "AI tool not found.", 404);

    tool.viewCount = (tool.viewCount || 0) + 1;
    await tool.save();

    return successResponse(res, "AI tool view tracked.", { viewCount: tool.viewCount });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
