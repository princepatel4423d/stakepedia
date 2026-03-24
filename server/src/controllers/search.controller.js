import AITool  from "../models/AITool.model.js";
import Blog    from "../models/Blog.model.js";
import Course  from "../models/Course.model.js";
import Prompt  from "../models/Prompt.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isTextIndexError = (error) => {
  const message = error?.message || "";
  return /text index required for \$text query/i.test(message);
};

const searchWithFallback = async ({
  model,
  query,
  textFields,
  select,
  populate,
  limit,
}) => {
  const textQuery = { $text: { $search: query }, status: "published" };
  const scoreProject = { score: { $meta: "textScore" } };
  const scoreSort = { score: { $meta: "textScore" } };

  try {
    let q = model.find(textQuery, scoreProject).select(select).sort(scoreSort).limit(limit);
    if (populate) q = q.populate(populate);
    return await q.lean();
  } catch (error) {
    if (!isTextIndexError(error)) throw error;

    const regex = new RegExp(escapeRegex(query), "i");
    const regexQuery = {
      status: "published",
      $or: textFields.map((field) => ({ [field]: regex })),
    };
    let q = model.find(regexQuery).select(select).limit(limit);
    if (populate) q = q.populate(populate);
    return await q.lean();
  }
};

export const globalSearch = async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q || q.trim().length < 2)
      return errorResponse(res, "Search query must be at least 2 characters.", 400);

    const query = q.trim();
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50);
    const normalizedType = String(type || "").toLowerCase();

    const searches = [];

    if (!normalizedType || normalizedType === "tools" || normalizedType === "aitool")
      searches.push(
        searchWithFallback({
          model: AITool,
          query,
          textFields: ["name", "description", "shortDescription"],
          select: "name slug logo shortDescription pricing averageRating categories viewCount",
          populate: { path: "categories", select: "name slug color" },
          limit,
        }).then((r) => ({
          type: "AITool",
          results: r.map((item) => ({
            ...item,
            category: item.categories?.[0] || null,
          })),
        }))
      );

    if (!normalizedType || normalizedType === "blogs" || normalizedType === "blog")
      searches.push(
        searchWithFallback({
          model: Blog,
          query,
          textFields: ["title", "content", "excerpt"],
          select: "title slug excerpt coverImage publishedAt readTime author viewCount",
          populate: { path: "author", select: "name avatar" },
          limit,
        }).then((r) => ({ type: "Blog", results: r }))
      );

    if (!normalizedType || normalizedType === "courses" || normalizedType === "course")
      searches.push(
        searchWithFallback({
          model: Course,
          query,
          textFields: ["title", "description", "shortDescription", "instructor", "category"],
          select: "title slug shortDescription coverImage level pricing price averageRating enrollmentCount",
          limit,
        }).then((r) => ({ type: "Course", results: r }))
      );

    if (!normalizedType || normalizedType === "prompts" || normalizedType === "prompt")
      searches.push(
        searchWithFallback({
          model: Prompt,
          query,
          textFields: ["title", "content", "description", "category"],
          select: "title slug description category tool usageCount",
          populate: { path: "tool", select: "name slug logo" },
          limit,
        }).then((r) => ({ type: "Prompt", results: r }))
      );

    if (!searches.length) {
      return successResponse(res, "No matching search type selected.", {
        results: [],
        grouped: {},
      });
    }

    const groupedResults = await Promise.all(searches);
    const grouped = Object.fromEntries(groupedResults.map((r) => [r.type, r.results]));
    const results = groupedResults.flatMap((group) =>
      group.results.map((item) => ({ ...item, type: group.type }))
    );
    const totalCount = results.length;

    return successResponse(res, `Found ${totalCount} results for "${query}".`, {
      results,
      grouped,
      totalCount,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};