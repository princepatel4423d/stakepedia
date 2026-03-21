import AuditLog from "../models/AuditLog.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { adminId, action, resource, status, from, to, search } = req.query;

    const query = {};
    if (adminId)   query.admin    = adminId;
    if (action)    query.action   = action;
    if (resource)  query.resource = resource;
    if (status)    query.status   = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to)   query.createdAt.$lte = new Date(to);
    }
    if (search) query.$or = [
      { resourceName: new RegExp(search, "i") },
      { action:       new RegExp(search, "i") },
    ];

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("admin", "name email role avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return paginatedResponse(res, "Audit logs fetched.", logs, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate("admin", "name email role");
    if (!log) return errorResponse(res, "Audit log not found.", 404);
    return successResponse(res, "Audit log fetched.", log);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getAuditLogsByResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const { page, limit, skip } = getPagination(req.query);

    const [logs, total] = await Promise.all([
      AuditLog.find({ resource: resourceType, resourceId })
        .populate("admin", "name email role")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments({ resource: resourceType, resourceId }),
    ]);

    return paginatedResponse(res, "Resource audit trail fetched.", logs, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getAuditStats = async (req, res) => {
  try {
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [byAction, byResource, byAdmin, failedCount, totalCount] = await Promise.all([
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: last30 } } },
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: last30 } } },
        { $group: { _id: "$resource", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: last30 } } },
        { $group: { _id: "$admin", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "admins", localField: "_id", foreignField: "_id", as: "admin" } },
        { $unwind: "$admin" },
        { $project: { count: 1, "admin.name": 1, "admin.email": 1 } },
      ]),
      AuditLog.countDocuments({ status: "failed", createdAt: { $gte: last30 } }),
      AuditLog.countDocuments({ createdAt: { $gte: last30 } }),
    ]);

    return successResponse(res, "Audit stats fetched.", {
      totalLast30Days: totalCount,
      failedLast30Days: failedCount,
      byAction,
      byResource,
      topAdmins: byAdmin,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};