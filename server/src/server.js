import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";

import connectDB from "./config/db.config.js";
import "./config/passport.config.js";
import { verifyCloudinaryConnection } from "./config/cloudinary.config.js";
import { verifyMailerConnection } from "./config/mailer.config.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { maintenanceCheck } from "./middleware/maintenance.middleware.js";
import { startCronJobs } from "./services/cron.service.js";
import { seedSuperAdmin, seedDefaultSettings } from "./seed/superAdmin.seed.js";

import authRoutes from "./routes/auth.routes.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminUserRoutes from "./routes/adminUser.routes.js";
import adminAIToolRoutes from "./routes/adminAITool.routes.js";
import adminBlogRoutes from "./routes/adminBlog.routes.js";
import adminCourseRoutes from "./routes/adminCourse.routes.js";
import adminPromptRoutes from "./routes/adminPrompt.routes.js";
import adminEmailRoutes from "./routes/adminEmail.routes.js";
import adminSettingsRoutes from "./routes/adminSettings.routes.js";
import adminAuditRoutes from "./routes/adminAudit.routes.js";
import adminCategoryRoutes from "./routes/adminCategory.routes.js";
import adminCommentRoutes from "./routes/comment.routes.js";
import adminNotificationRoutes from "./routes/adminNotification.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import aiToolRoutes from "./routes/aiTool.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import courseRoutes from "./routes/course.routes.js";
import promptRoutes from "./routes/prompt.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import searchRoutes from "./routes/search.routes.js";
import statsRoutes from "./routes/stats.routes.js";

const app = express();
connectDB();

app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    process.env.ADMIN_URL || "http://localhost:5174",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(maintenanceCheck);

app.get("/api/health", (_req, res) => res.json({
  success: true,
  message: "Stakepedia API is running",
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
}));

// ── Public routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ai-tools", aiToolRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/prompts", promptRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/stats", statsRoutes);

// ── Admin routes (specific paths BEFORE the broad /admin mount)
app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/ai-tools", adminAIToolRoutes);
app.use("/api/v1/admin/blogs", adminBlogRoutes);
app.use("/api/v1/admin/courses", adminCourseRoutes);
app.use("/api/v1/admin/prompts", adminPromptRoutes);
app.use("/api/v1/admin/email", adminEmailRoutes);
app.use("/api/v1/admin/settings", adminSettingsRoutes);
app.use("/api/v1/admin/audit", adminAuditRoutes);
app.use("/api/v1/admin/categories", adminCategoryRoutes);
app.use("/api/v1/admin/comments", adminCommentRoutes);
app.use("/api/v1/admin/notifications", adminNotificationRoutes);
app.use("/api/v1/admin/analytics", analyticsRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only run locally
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    console.log(`\nServer running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API Base:  http://localhost:${PORT}/api/v1`);
    console.log(`Health:   http://localhost:${PORT}/api/health\n`);

    await verifyCloudinaryConnection();
    await verifyMailerConnection();
    await seedSuperAdmin();
    await seedDefaultSettings();
    startCronJobs();
  });
}

export default app;