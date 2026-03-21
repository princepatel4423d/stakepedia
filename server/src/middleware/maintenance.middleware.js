import SiteSettings from "../models/SiteSettings.model.js";

export const maintenanceCheck = async (req, res, next) => {
  try {
    // Always allow admin routes through
    if (req.path.startsWith("/api/v1/admin")) return next();
    if (req.path === "/api/health")           return next();

    const settings = await SiteSettings.findOne().select("maintenanceMode").lean();
    if (settings?.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: "Stakepedia is currently under maintenance. Please check back soon.",
        maintenanceMode: true,
      });
    }
    next();
  } catch {
    next(); // never block on DB error
  }
};