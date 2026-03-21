import User from "../models/User.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip }       = getPagination(req.query);
    const { search, isActive, role, authProvider, banStatus } = req.query;
    const query = {};
    if (search)       query.$or          = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (role)         query.role         = role;
    if (authProvider) query.authProvider = authProvider;
    if (banStatus)    query.banStatus    = banStatus;

    const [users, total] = await Promise.all([
      User.find(query).sort("-createdAt").skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return paginatedResponse(res, "Users fetched.", users, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("likedTools", "name slug logo pricing")
      .populate("savedTools", "name slug logo pricing");
    if (!user) return errorResponse(res, "User not found.", 404);
    return successResponse(res, "User fetched.", user);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found.", 404);

    const oldStatus  = user.isActive;
    user.isActive    = !user.isActive;
    await user.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       user.isActive ? "user.activated" : "user.deactivated",
      resource:     "User",
      resourceId:   user._id,
      resourceName: user.email,
      oldData:      { isActive: oldStatus },
      newData:      { isActive: user.isActive },
      ip:           getIP(req),
    });

    return successResponse(res, `User ${user.isActive ? "activated" : "deactivated"}.`, user);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found.", 404);

    await user.deleteOne();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "user.deleted",
      resource:     "User",
      resourceId:   user._id,
      resourceName: user.email,
      oldData:      { name: user.name, email: user.email },
      ip:           getIP(req),
    });

    return successResponse(res, "User deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const setUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found.", 404);

    const { banStatus = "none", banReason = null, bannedUntil = null } = req.body || {};
    if (!["none", "temporary", "permanent"].includes(banStatus))
      return errorResponse(res, "Invalid ban status.", 400);

    if (banStatus === "temporary" && !bannedUntil)
      return errorResponse(res, "bannedUntil is required for temporary bans.", 400);

    const oldData = {
      banStatus: user.banStatus,
      banReason: user.banReason,
      bannedAt: user.bannedAt,
      bannedUntil: user.bannedUntil,
    };

    if (banStatus === "none") {
      user.banStatus = "none";
      user.banReason = null;
      user.bannedAt = null;
      user.bannedUntil = null;
      user.bannedBy = null;
    } else {
      user.banStatus = banStatus;
      user.banReason = banReason || null;
      user.bannedAt = new Date();
      user.bannedUntil = banStatus === "temporary" ? new Date(bannedUntil) : null;
      user.bannedBy = req.admin._id;
    }

    await user.save();

    await createAuditLog({
      adminId: req.admin._id,
      action: banStatus === "none" ? "user.unbanned" : "user.banned",
      resource: "User",
      resourceId: user._id,
      resourceName: user.email,
      oldData,
      newData: {
        banStatus: user.banStatus,
        banReason: user.banReason,
        bannedAt: user.bannedAt,
        bannedUntil: user.bannedUntil,
      },
      ip: getIP(req),
    });

    const message = banStatus === "none" ? "User unbanned." : "User ban status updated.";
    return successResponse(res, message, user);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getUserStats = async (req, res) => {
  try {
    const [total, active, verified, google, last30, banned] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ authProvider: "google" }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ banStatus: { $ne: "none" } }),
    ]);

    return successResponse(res, "User stats fetched.", {
      total, active, verified,
      googleOAuth: google,
      newLast30Days: last30,
      inactive: total - active,
      banned,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};