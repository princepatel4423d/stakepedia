import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import {
  getMyNotifications, markAsRead, markAllAsRead,
  deleteNotification, clearAllNotifications, getUnreadCount,
  getNotificationRecipients, sendNotificationCampaign,
} from "../controllers/notification.controller.js";

const router = express.Router();
router.use(protectAdmin);

router.get   ("/",              getMyNotifications);
router.get   ("/unread-count",  getUnreadCount);
router.get   ("/recipients",    requirePermission("manageNotifications"), getNotificationRecipients);
router.post  ("/campaigns/send",requirePermission("manageNotifications"), sendNotificationCampaign);
router.patch ("/read-all",      markAllAsRead);
router.delete("/clear-all",     clearAllNotifications);
router.patch ("/:id/read",      markAsRead);
router.delete("/:id",           deleteNotification);

export default router;