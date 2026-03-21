import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      enum: ["admin", "user"],
      default: "admin",
      required: true,
    },
    admin: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Admin",
      default:  null,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      default:  null,
    },
    type: {
      type: String,
      enum: [
        "new_user",         // new user registered
        "new_review",       // review submitted, pending approval
        "new_comment",      // comment pending approval (unverified user)
        "failed_email",     // email delivery failure
        "new_ai_tool",      // AI tool submitted (if you add user submissions later)
        "audit_alert",      // suspicious admin activity
        "system",           // generic system notification
      ],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    link:    { type: String, default: null }, // frontend deep-link e.g. /moderation/reviews
    isRead:  { type: Boolean, default: false },
    meta:    { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ admin: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// Auto-expire notifications after 60 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

export default mongoose.model("Notification", notificationSchema);