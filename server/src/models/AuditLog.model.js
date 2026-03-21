import mongoose from "mongoose";

const ACTIONS = [
  // Auth
  "admin.login", "admin.logout", "admin.login.failed", "admin.2fa.setup",
  "admin.2fa.enabled", "admin.2fa.disabled", "admin.password.reset",
  // Admins
  "admin.created", "admin.updated", "admin.deleted", "admin.permissions.updated",
  // Users
  "user.created", "user.updated", "user.deleted", "user.activated", "user.deactivated",
  // AI Tools
  "aitool.created", "aitool.updated", "aitool.deleted", "aitool.published", "aitool.archived",
  // Blogs
  "blog.created", "blog.updated", "blog.deleted", "blog.published", "blog.archived",
  // Courses
  "course.created", "course.updated", "course.deleted", "course.published",
  "lesson.created", "lesson.updated", "lesson.deleted",
  // Prompts
  "prompt.created", "prompt.updated", "prompt.deleted", "prompt.published",
  // Categories
  "category.created", "category.updated", "category.deleted",
  // Reviews & Comments
  "review.approved", "review.rejected", "review.deleted",
  "comment.approved", "comment.deleted",
  // Email
  "email.template.created", "email.template.updated", "email.template.deleted",
  "email.campaign.sent",
  // Notifications
  "notification.campaign.sent",
  // Settings
  "settings.updated",
  // Uploads
  "upload.deleted",
];

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ACTIONS,
    },
    resource: {
      type: String,
      required: true,
      enum: [
        "Admin", "User", "AITool", "Blog", "Course", "Lesson",
        "Prompt", "Category", "Review", "Comment",
        "EmailTemplate", "EmailCampaign", "NotificationCampaign", "SiteSettings", "Upload",
      ],
    },
    resourceId:   { type: mongoose.Schema.Types.ObjectId, default: null },
    resourceName: { type: String, default: null },
    oldData:      { type: mongoose.Schema.Types.Mixed, default: null },
    newData:      { type: mongoose.Schema.Types.Mixed, default: null },
    metadata:     { type: mongoose.Schema.Types.Mixed, default: {} },
    ip:           { type: String, default: null },
    userAgent:    { type: String, default: null },
    status:       { type: String, enum: ["success", "failed"], default: "success" },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes for fast querying
auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ status: 1 });

// Auto-expire logs after 90 days (optional — remove if you want permanent logs)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AUDIT_ACTIONS = ACTIONS;
export default mongoose.model("AuditLog", auditLogSchema);