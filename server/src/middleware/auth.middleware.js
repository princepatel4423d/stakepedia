import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Admin from "../models/Admin.model.js";

const extractToken = (req) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.split(" ")[1];
  return null;
};

const isUserBanned = (user) => {
  if (!user || user.banStatus === "none") return false;
  if (user.banStatus === "permanent") return true;
  if (user.banStatus === "temporary" && user.bannedUntil) return new Date(user.bannedUntil) > new Date();
  return false;
};

export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: "No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.preAuth) return res.status(401).json({ success: false, message: "2FA required." });

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: "Unauthorized." });
    if (isUserBanned(user)) return res.status(403).json({ success: false, message: "Account is suspended." });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

export const protectAdmin = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: "No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.preAuth) return res.status(401).json({ success: false, message: "2FA required." });

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) return res.status(401).json({ success: false, message: "Unauthorized." });

    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  const entity = req.admin || req.user;
  if (!entity || !roles.includes(entity.role))
    return res.status(403).json({ success: false, message: "Forbidden." });
  next();
};

export const requirePermission = (...perms) => (req, res, next) => {
  if (!req.admin) return res.status(403).json({ success: false, message: "Admin access required." });
  if (req.admin.role === "superadmin") return next();

  const hasPermission = (perm) => {
    if (req.admin.permissions?.[perm] === true) return true;

    // Backward-compatible fallbacks for admins created before these keys existed.
    if (perm === "manageNotifications") {
      if (req.admin.permissions && Object.prototype.hasOwnProperty.call(req.admin.permissions, "manageNotifications")) {
        return false;
      }
      return req.admin.permissions?.manageEmail === true;
    }
    if (perm === "manageModeration") {
      return req.admin.permissions?.manageAITools === true || req.admin.permissions?.manageBlogs === true;
    }

    return false;
  };

  const missing = perms.find((p) => !hasPermission(p));
  if (missing) return res.status(403).json({ success: false, message: `Missing permission: ${missing}` });
  next();
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user?.isActive && !isUserBanned(user)) req.user = user;
  } catch { /* silent */ }
  next();
};

export const protectAny = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: "No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.preAuth) return res.status(401).json({ success: false, message: "2FA required." });

    // Try admin first
    const admin = await Admin.findById(decoded.id);
    if (admin?.isActive) {
      req.admin = admin;
      req.user = admin; // so upload controller works
      return next();
    }

    // Try user
    const user = await User.findById(decoded.id);
    if (user?.isActive) {
      if (isUserBanned(user)) {
        return res.status(403).json({ success: false, message: "Account is suspended." });
      }
      req.user = user;
      return next();
    }

    return res.status(401).json({ success: false, message: "Unauthorized." });
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};