import Admin         from "../models/Admin.model.js";
import SiteSettings  from "../models/SiteSettings.model.js";

export const seedSuperAdmin = async () => {
  try {
    const existing = await Admin.findOne({ role: "superadmin" });
    if (existing) return console.log("Super admin already exists");

    await Admin.create({
      name:  process.env.SUPER_ADMIN_NAME     || "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL    || "superadmin@stakepedia.com",
      password: process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@123",
      role: "superadmin",
      isActive: true,
      permissions: {
        manageUsers: true, manageAITools: true, manageBlogs: true,
        manageCourses: true, managePrompts: true, manageEmail: true,
        manageModeration: true,
        manageAdmins: true, manageSettings: true, viewAnalytics: true, viewAuditLogs: true,
      },
    });
    console.log("Super admin seeded:", process.env.SUPER_ADMIN_EMAIL);
  } catch (err) {
    console.error("Super admin seed error:", err.message);
  }
};

export const seedDefaultSettings = async () => {
  try {
    const existing = await SiteSettings.findOne();
    if (!existing) {
      await SiteSettings.create({});
      console.log("Default site settings seeded");
    }
  } catch (err) {
    console.error("Settings seed error:", err.message);
  }
};
