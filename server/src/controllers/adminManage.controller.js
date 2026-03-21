import Admin from "../models/Admin.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

export const getAllAdmins = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, isActive }  = req.query;
    const query = { role: "admin" };
    if (search)    query.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
    if (isActive !== undefined) query.isActive = isActive === "true";

    const [admins, total] = await Promise.all([
      Admin.find(query).populate("createdBy", "name email").sort("-createdAt").skip(skip).limit(limit),
      Admin.countDocuments(query),
    ]);

    return paginatedResponse(res, "Admins fetched.", admins, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    if (await Admin.findOne({ email })) return errorResponse(res, "Email already exists.", 409);

    const admin = await Admin.create({
      name, email, password, role: "admin",
      createdBy: req.admin._id,
      ...(permissions && { permissions }),
    });

    await createAuditLog({
      adminId: req.admin._id, action: "admin.created", resource: "Admin",
      resourceId: admin._id, resourceName: admin.email,
      newData: { name, email, permissions },
      ip: getIP(req), userAgent: req.headers["user-agent"],
    });

    return successResponse(res, "Admin created.", admin, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate("createdBy", "name email");
    if (!admin) return errorResponse(res, "Admin not found.", 404);
    return successResponse(res, "Admin fetched.", admin);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const admin = await Admin.findById(req.params.id);
    if (!admin) return errorResponse(res, "Admin not found.", 404);
    if (admin.role === "superadmin") return errorResponse(res, "Cannot modify super admin.", 403);

    const oldData = { name: admin.name, isActive: admin.isActive };
    admin.name     = name     ?? admin.name;
    admin.isActive = isActive ?? admin.isActive;
    await admin.save();

    await createAuditLog({
      adminId: req.admin._id, action: "admin.updated", resource: "Admin",
      resourceId: admin._id, resourceName: admin.email,
      oldData, newData: { name: admin.name, isActive: admin.isActive },
      ip: getIP(req),
    });

    return successResponse(res, "Admin updated.", admin);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateAdminPermissions = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return errorResponse(res, "Admin not found.", 404);
    if (admin.role === "superadmin") return errorResponse(res, "Cannot change superadmin permissions.", 403);

    const oldPermissions = { ...admin.permissions.toObject() };
    admin.permissions = { ...admin.permissions.toObject(), ...req.body.permissions };
    await admin.save();

    await createAuditLog({
      adminId: req.admin._id, action: "admin.permissions.updated", resource: "Admin",
      resourceId: admin._id, resourceName: admin.email,
      oldData: oldPermissions, newData: admin.permissions,
      ip: getIP(req),
    });

    return successResponse(res, "Permissions updated.", admin);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return errorResponse(res, "Admin not found.", 404);
    if (admin.role === "superadmin") return errorResponse(res, "Cannot delete super admin.", 403);

    await admin.deleteOne();

    await createAuditLog({
      adminId: req.admin._id, action: "admin.deleted", resource: "Admin",
      resourceId: admin._id, resourceName: admin.email,
      oldData: { name: admin.name, email: admin.email },
      ip: getIP(req),
    });

    return successResponse(res, "Admin deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};