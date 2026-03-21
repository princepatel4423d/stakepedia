import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";
import Admin from "../models/Admin.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

const resolveNotificationRecipients = async ({ audience, userIds = [], adminIds = [] }) => {
  switch (audience) {
    case "all_users": {
      const users = await User.find({ isActive: true }).select("_id").lean();
      return users.map((u) => ({ recipientType: "user", user: u._id }));
    }
    case "selected_users": {
      const users = await User.find({ _id: { $in: userIds }, isActive: true }).select("_id").lean();
      return users.map((u) => ({ recipientType: "user", user: u._id }));
    }
    case "all_admins": {
      const admins = await Admin.find({ isActive: true }).select("_id").lean();
      return admins.map((a) => ({ recipientType: "admin", admin: a._id }));
    }
    case "selected_admins": {
      const admins = await Admin.find({ _id: { $in: adminIds }, isActive: true }).select("_id").lean();
      return admins.map((a) => ({ recipientType: "admin", admin: a._id }));
    }
    default:
      return [];
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { isRead }            = req.query;
    const query = { recipientType: "admin", admin: req.admin._id };
    if (isRead !== undefined) query.isRead = isRead === "true";

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort("-createdAt").skip(skip).limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipientType: "admin", admin: req.admin._id, isRead: false }),
    ]);

    return paginatedResponse(
      res,
      "Notifications fetched.",
      { notifications, unreadCount },
      buildPaginationMeta(total, page, limit)
    );
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id:   req.params.id,
      recipientType: "admin",
      admin: req.admin._id,
    });
    if (!notification) return errorResponse(res, "Notification not found.", 404);

    notification.isRead = true;
    await notification.save();
    return successResponse(res, "Marked as read.", notification);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientType: "admin", admin: req.admin._id, isRead: false },
      { isRead: true }
    );
    return successResponse(res, "All notifications marked as read.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id:   req.params.id,
      recipientType: "admin",
      admin: req.admin._id,
    });
    if (!notification) return errorResponse(res, "Notification not found.", 404);
    return successResponse(res, "Notification deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipientType: "admin", admin: req.admin._id });
    return successResponse(res, "All notifications cleared.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientType: "admin",
      admin:  req.admin._id,
      isRead: false,
    });
    return successResponse(res, "Unread count fetched.", { count });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getNotificationRecipients = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const searchRegex = search ? new RegExp(search, "i") : null;

    const [users, admins, userCount, adminCount] = await Promise.all([
      User.find({
        isActive: true,
        ...(searchRegex && { $or: [{ name: searchRegex }, { email: searchRegex }] }),
      }).select("name email").sort("name").limit(100).lean(),
      Admin.find({
        isActive: true,
        ...(searchRegex && { $or: [{ name: searchRegex }, { email: searchRegex }] }),
      }).select("name email role").sort("name").limit(100).lean(),
      User.countDocuments({ isActive: true }),
      Admin.countDocuments({ isActive: true }),
    ]);

    return successResponse(res, "Notification recipients fetched.", {
      users,
      admins,
      counts: {
        users: userCount,
        admins: adminCount,
      },
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const sendNotificationCampaign = async (req, res) => {
  try {
    const {
      audience,
      userIds,
      adminIds,
      title,
      message,
      link,
      type,
      meta,
      campaignId,
    } = req.body;

    if (!audience)
      return errorResponse(res, "Audience is required.", 400);
    if (!title || !message)
      return errorResponse(res, "Title and message are required.", 400);

    const recipients = await resolveNotificationRecipients({ audience, userIds, adminIds });

    if (!recipients.length)
      return errorResponse(res, "No recipients found for selected audience.", 400);

    const now = new Date();
    await Notification.insertMany(
      recipients.map((recipient) => ({
        ...recipient,
        type: type || "system",
        title,
        message,
        link: link || null,
        meta: {
          ...(meta || {}),
          campaignId: campaignId || `notif_${Date.now()}`,
          sentByAdmin: req.admin._id,
        },
        createdAt: now,
        updatedAt: now,
      }))
    );

    await createAuditLog({
      adminId: req.admin._id,
      action: "notification.campaign.sent",
      resource: "NotificationCampaign",
      newData: {
        audience,
        total: recipients.length,
        type: type || "system",
        title,
        campaignId: campaignId || null,
      },
      ip: getIP(req),
    });

    return successResponse(res, "Notification campaign sent.", {
      audience,
      total: recipients.length,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};