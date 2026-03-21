import Notification from "../models/Notification.model.js";
import Admin        from "../models/Admin.model.js";

/**
 * Send a notification to specific admin(s) or all superadmins
 */
export const createNotification = async ({ adminId, type, title, message, link = null, meta = {} }) => {
  try {
    await Notification.create({
      recipientType: "admin",
      admin: adminId,
      type,
      title,
      message,
      link,
      meta,
    });
  } catch (err) {
    console.error("Notification create error:", err.message);
  }
};

export const notifyAllSuperAdmins = async ({ type, title, message, link = null, meta = {} }) => {
  try {
    const superAdmins = await Admin.find({ role: "superadmin", isActive: true }).select("_id");
    if (!superAdmins.length) return;
    await Notification.insertMany(
      superAdmins.map((a) => ({
        recipientType: "admin",
        admin: a._id,
        type,
        title,
        message,
        link,
        meta,
      }))
    );
  } catch (err) {
    console.error("Notify superadmins error:", err.message);
  }
};

export const notifyAllAdmins = async ({ type, title, message, link = null, meta = {} }) => {
  try {
    const admins = await Admin.find({ isActive: true }).select("_id");
    if (!admins.length) return;
    await Notification.insertMany(
      admins.map((a) => ({
        recipientType: "admin",
        admin: a._id,
        type,
        title,
        message,
        link,
        meta,
      }))
    );
  } catch (err) {
    console.error("Notify all admins error:", err.message);
  }
};