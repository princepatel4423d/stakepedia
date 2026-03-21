import User from "../models/User.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.utils.js";
import { generateToken, generateNumericOtp, hashToken } from "../utils/crypto.utils.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail,
} from "../services/email.service.js";
import { notifyAllSuperAdmins } from "../services/notification.service.js";

const isUserBanned = (user) => {
  if (!user || user.banStatus === "none") return false;
  if (user.banStatus === "permanent") return true;
  if (user.banStatus === "temporary" && user.bannedUntil) return new Date(user.bannedUntil) > new Date();
  return false;
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return errorResponse(res, "Email already registered.", 409);

    const verifyOtp = generateNumericOtp();
    await User.create({
      name, email, password,
      emailVerifyToken: hashToken(verifyOtp),
      emailVerifyExpires: Date.now() + 10 * 60 * 1000,
    });

    // inside register(), after User.create():
    notifyAllSuperAdmins({
      type: "new_user",
      title: "New user registered",
      message: `${name} (${email}) just created an account.`,
      link: `/admin/users`,
      meta: { email },
    }).catch(() => { }); // fire-and-forget

    await sendVerificationEmail({ name, email }, verifyOtp);
    return successResponse(res, "Registration successful. Please verify your email with the OTP sent to your email.", null, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      emailVerifyToken: hashToken(String(otp)),
      emailVerifyExpires: { $gt: Date.now() },
    }).select("+emailVerifyToken +emailVerifyExpires");

    if (!user) return errorResponse(res, "Invalid or expired OTP.", 400);

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();
    await sendWelcomeEmail(user);
    return successResponse(res, "Email verified successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password)))
      return errorResponse(res, "Invalid email or password.", 401);
    if (!user.isEmailVerified)
      return errorResponse(res, "Please verify your email before logging in.", 403);
    if (!user.isActive)
      return errorResponse(res, "Account has been deactivated.", 403);
    if (isUserBanned(user))
      return errorResponse(res, "Account is suspended. Contact support.", 403);

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    return successResponse(res, "Login successful.", { user, accessToken, refreshToken });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const googleCallback = (req, res) => {
  try {
    const user = req.user;
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  } catch {
    res.redirect(`${process.env.CLIENT_URL}/auth/google/error`);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return successResponse(res, "If that email exists, a reset link has been sent.");

    const resetToken = generateToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();
    await sendPasswordResetEmail(user, resetToken);
    return successResponse(res, "Password reset email sent.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) return errorResponse(res, "Invalid or expired reset token.", 400);
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return successResponse(res, "Password reset successful. Please login.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return errorResponse(res, "Refresh token required.", 401);
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user?.isActive) return errorResponse(res, "Unauthorized.", 401);
    if (isUserBanned(user)) return errorResponse(res, "Account is suspended.", 403);
    return successResponse(res, "Token refreshed.", {
      accessToken: generateAccessToken({ id: user._id, role: user.role }),
    });
  } catch {
    return errorResponse(res, "Invalid refresh token.", 401);
  }
};

export const getMe = (req, res) => successResponse(res, "Profile fetched.", req.user);
export const resendVerification = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+emailVerifyToken +emailVerifyExpires");
    if (!user || user.isEmailVerified)
      return successResponse(res, "If that email exists and is unverified, we sent an OTP.");

    const verifyOtp = generateNumericOtp();
    user.emailVerifyToken = hashToken(verifyOtp);
    user.emailVerifyExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendVerificationEmail(user, verifyOtp);
    return successResponse(res, "Verification OTP sent.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};