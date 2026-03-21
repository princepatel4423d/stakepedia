import express from "express";
import passport from "passport";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  registerValidator, loginValidator,
  forgotPasswordValidator, resetPasswordValidator,
  verifyEmailOtpValidator, resendVerificationValidator,
} from "../validators/auth.validators.js";
import {
  register, verifyEmail, login, googleCallback,
  forgotPassword, resetPassword, refreshToken,
  getMe, resendVerification,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register",            authLimiter, registerValidator, validate, register);
router.post("/verify-email",        authLimiter, verifyEmailOtpValidator, validate, verifyEmail);
router.post("/resend-verification", authLimiter, resendVerificationValidator, validate, resendVerification);
router.post("/login",               authLimiter, loginValidator, validate, login);
router.post("/forgot-password",     authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password",      resetPasswordValidator, validate, resetPassword);
router.post("/refresh-token",       refreshToken);
router.get ("/me",                  protect, getMe);

router.get("/google",          passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }), googleCallback);

export default router;