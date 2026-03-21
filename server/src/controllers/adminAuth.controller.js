import Admin from "../models/Admin.model.js";
import { generateAccessToken, generatePreAuthToken, verifyAccessToken } from "../utils/jwt.utils.js";
import { generate2FASecret, generateQRCode, verify2FAToken } from "../services/twoFactor.service.js";
import { generateToken, hashToken } from "../utils/crypto.utils.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { sendAdminResetEmail } from "../services/email.service.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select("+password +twoFactorSecret");

    if (!admin || !(await admin.comparePassword(password))) {
      if (admin) {
        await createAuditLog({
          adminId: admin._id, action: "admin.login.failed", resource: "Admin",
          resourceId: admin._id, resourceName: admin.email,
          ip: getIP(req), userAgent: req.headers["user-agent"], status: "failed",
          errorMessage: "Invalid password",
        });
      }
      return errorResponse(res, "Invalid email or password.", 401);
    }

    if (!admin.isActive) return errorResponse(res, "Account deactivated.", 403);

    if (admin.twoFactorEnabled) {
      const preAuthToken = generatePreAuthToken({ id: admin._id, role: admin.role });
      return successResponse(res, "2FA required.", { requires2FA: true, preAuthToken });
    }

    admin.lastLogin = new Date();
    await admin.save();

    await createAuditLog({
      adminId: admin._id, action: "admin.login", resource: "Admin",
      resourceId: admin._id, resourceName: admin.email,
      ip: getIP(req), userAgent: req.headers["user-agent"],
    });

    return successResponse(res, "Login successful.", {
      admin,
      accessToken: generateAccessToken({ id: admin._id, role: admin.role }),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { preAuthToken, totpCode } = req.body;
    const decoded = verifyAccessToken(preAuthToken);
    if (!decoded.preAuth) return errorResponse(res, "Invalid pre-auth token.", 401);

    const admin = await Admin.findById(decoded.id).select("+twoFactorSecret");
    if (!admin) return errorResponse(res, "Admin not found.", 404);

    if (!verify2FAToken(admin.twoFactorSecret, totpCode)) {
      await createAuditLog({
        adminId: admin._id, action: "admin.login.failed", resource: "Admin",
        resourceId: admin._id, ip: getIP(req), status: "failed",
        errorMessage: "Invalid 2FA code",
      });
      return errorResponse(res, "Invalid 2FA code.", 401);
    }

    admin.lastLogin = new Date();
    await admin.save();

    await createAuditLog({
      adminId: admin._id, action: "admin.login", resource: "Admin",
      resourceId: admin._id, resourceName: admin.email,
      ip: getIP(req), userAgent: req.headers["user-agent"],
    });

    return successResponse(res, "2FA verified. Login successful.", {
      admin,
      accessToken: generateAccessToken({ id: admin._id, role: admin.role }),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const setup2FA = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("+twoFactorSecret");
    if (admin.twoFactorEnabled) return errorResponse(res, "2FA already enabled.", 400);

    const secret = generate2FASecret(admin.email);
    const qrCode = await generateQRCode(secret.otpauth_url);
    
    // Don't save secret yet - only save when user confirms with valid TOTP code
    // This prevents audit log from firing just by viewing the setup

    return successResponse(res, "Scan this QR code with your authenticator app.", {
      qrCode, secret: secret.base32,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const enable2FA = async (req, res) => {
  try {
    const { totpCode, secret } = req.body;
    const admin = await Admin.findById(req.admin._id).select("+twoFactorSecret");
    
    // Verify the TOTP code with the provided secret
    if (!verify2FAToken(secret, totpCode))
      return errorResponse(res, "Invalid TOTP code.", 401);

    // Now save the secret only after verification
    admin.twoFactorSecret = secret;
    admin.twoFactorEnabled = true;
    admin.twoFactorVerified = true;
    await admin.save();

    await createAuditLog({
      adminId: req.admin._id, action: "admin.2fa.enabled", resource: "Admin",
      resourceId: admin._id, ip: getIP(req),
    });

    return successResponse(res, "2FA enabled successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const disable2FA = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("+twoFactorSecret");
    if (!verify2FAToken(admin.twoFactorSecret, req.body.totpCode))
      return errorResponse(res, "Invalid TOTP code.", 401);

    admin.twoFactorEnabled = false;
    admin.twoFactorVerified = false;
    admin.twoFactorSecret = undefined;
    await admin.save();

    await createAuditLog({
      adminId: req.admin._id, action: "admin.2fa.disabled", resource: "Admin",
      resourceId: admin._id, ip: getIP(req),
    });

    return successResponse(res, "2FA disabled.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const adminForgotPassword = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return successResponse(res, "If that email exists, a reset link has been sent.");

    const resetToken = generateToken();
    admin.passwordResetToken = hashToken(resetToken);
    admin.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await admin.save();
    await sendAdminResetEmail(admin, resetToken);
    return successResponse(res, "Password reset email sent.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const adminResetPassword = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      passwordResetToken: hashToken(req.body.token),
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!admin) return errorResponse(res, "Invalid or expired token.", 400);
    admin.password = req.body.password;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();

    await createAuditLog({
      adminId: admin._id, action: "admin.password.reset", resource: "Admin",
      resourceId: admin._id, ip: getIP(req),
    });

    return successResponse(res, "Password reset successful.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getAdminMe = (req, res) => successResponse(res, "Profile fetched.", req.admin);

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return errorResponse(res, "Admin not found.", 404);

    if (name) admin.name = name;
    if (avatar) admin.avatar = avatar;
    await admin.save();

    await createAuditLog({
      adminId: req.admin._id,
      action: "admin.updated",
      resource: "Admin",
      resourceId: admin._id,
      resourceName: admin.email,
      newData: { name: admin.name, avatar: admin.avatar },
      ip: getIP(req),
    });

    return successResponse(res, "Profile updated.", admin);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id).select("+password");
    if (!admin) return errorResponse(res, "Admin not found.", 404);

    const isValid = await admin.comparePassword(currentPassword);
    if (!isValid) return errorResponse(res, "Current password is incorrect.", 401);

    admin.password = newPassword;
    await admin.save();

    await createAuditLog({
      adminId: req.admin._id,
      action: "admin.password.reset",
      resource: "Admin",
      resourceId: admin._id,
      resourceName: admin.email,
      ip: getIP(req),
    });

    return successResponse(res, "Password changed successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};