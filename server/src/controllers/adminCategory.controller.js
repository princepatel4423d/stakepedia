import Category from "../models/Category.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { generateUniqueSlug } from "../utils/slug.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

export const getAllCategories = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, isActive }  = req.query;
    const query = {};
    if (search)             query.name     = new RegExp(search, "i");
    if (isActive !== undefined) query.isActive = isActive === "true";

    const [categories, total] = await Promise.all([
      Category.find(query).sort("name").skip(skip).limit(limit),
      Category.countDocuments(query),
    ]);

    return paginatedResponse(res, "Categories fetched.", categories, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return errorResponse(res, "Category not found.", 404);
    return successResponse(res, "Category fetched.", category);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const createCategory = async (req, res) => {
  try {
    const slug     = await generateUniqueSlug(req.body.name, Category);
    const category = await Category.create({ ...req.body, slug });

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "category.created",
      resource:     "Category",
      resourceId:   category._id,
      resourceName: category.name,
      newData:      { name: category.name, slug },
      ip:           getIP(req),
    });

    return successResponse(res, "Category created.", category, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return errorResponse(res, "Category not found.", 404);

    const oldData = { name: category.name, isActive: category.isActive };

    if (req.body.name && req.body.name !== category.name)
      req.body.slug = await generateUniqueSlug(req.body.name, Category, category._id);

    Object.assign(category, req.body);
    await category.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "category.updated",
      resource:     "Category",
      resourceId:   category._id,
      resourceName: category.name,
      oldData,
      newData:      req.body,
      ip:           getIP(req),
    });

    return successResponse(res, "Category updated.", category);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return errorResponse(res, "Category not found.", 404);
    if (category.toolCount > 0)
      return errorResponse(res, `Cannot delete — ${category.toolCount} tools use this category.`, 400);

    await category.deleteOne();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "category.deleted",
      resource:     "Category",
      resourceId:   category._id,
      resourceName: category.name,
      ip:           getIP(req),
    });

    return successResponse(res, "Category deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};