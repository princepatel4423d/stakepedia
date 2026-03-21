import express from "express";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { protectAdmin } from "../middleware/auth.middleware.js";
import { body } from "express-validator";
import {
  adminLoginValidator, forgotPasswordValidator, resetPasswordValidator,
} from "../validators/auth.validators.js";
import {
  adminLogin, verify2FA, setup2FA, enable2FA, disable2FA,
  adminForgotPassword, adminResetPassword, getAdminMe,
  updateAdminProfile, changeAdminPassword,
} from "../controllers/adminAuth.controller.js";

const router = express.Router();

router.post("/login", authLimiter, adminLoginValidator, validate, adminLogin);
router.post("/verify-2fa", authLimiter, [body("preAuthToken").notEmpty(), body("totpCode").notEmpty()], validate, verify2FA);
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validate, adminForgotPassword);
router.post("/reset-password", resetPasswordValidator, validate, adminResetPassword);
router.get("/me", protectAdmin, getAdminMe);
router.post("/setup-2fa", protectAdmin, setup2FA);
router.post("/enable-2fa", protectAdmin, [body("totpCode").notEmpty()], validate, enable2FA);
router.post("/disable-2fa", protectAdmin, [body("totpCode").notEmpty()], validate, disable2FA);

// ← ADD THESE TWO:
router.put("/profile", protectAdmin, [body("name").optional().trim().isLength({ min: 2, max: 50 })], validate, updateAdminProfile);
router.patch("/change-password", protectAdmin, [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 })], validate, changeAdminPassword);

export default router;