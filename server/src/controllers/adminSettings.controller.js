import SiteSettings from "../models/SiteSettings.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

export const getSettings = async (_req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    return successResponse(res, "Settings fetched.", settings);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = new SiteSettings();

    const oldData = settings.toObject();
    Object.assign(settings, req.body);
    await settings.save();

    await createAuditLog({
      adminId:  req.admin._id,
      action:   "settings.updated",
      resource: "SiteSettings",
      oldData,
      newData:  req.body,
      ip:       getIP(req),
    });

    return successResponse(res, "Settings updated.", settings);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateLogo = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, "No file uploaded.", 400);
    const settings = await SiteSettings.findOne();
    settings.siteLogo = req.file.path;
    await settings.save();

    await createAuditLog({
      adminId:  req.admin._id,
      action:   "settings.updated",
      resource: "SiteSettings",
      newData:  { siteLogo: settings.siteLogo },
      ip:       getIP(req),
    });

    return successResponse(res, "Logo updated.", { siteLogo: settings.siteLogo });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateFavicon = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, "No file uploaded.", 400);
    const settings = await SiteSettings.findOne();
    settings.favicon = req.file.path;
    await settings.save();
    return successResponse(res, "Favicon updated.", { favicon: settings.favicon });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const toggleMaintenance = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    settings.maintenanceMode = !settings.maintenanceMode;
    await settings.save();

    await createAuditLog({
      adminId:  req.admin._id,
      action:   "settings.updated",
      resource: "SiteSettings",
      newData:  { maintenanceMode: settings.maintenanceMode },
      metadata: { action: `Maintenance mode ${settings.maintenanceMode ? "enabled" : "disabled"}` },
      ip:       getIP(req),
    });

    return successResponse(res, `Maintenance mode ${settings.maintenanceMode ? "enabled" : "disabled"}.`, settings);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};