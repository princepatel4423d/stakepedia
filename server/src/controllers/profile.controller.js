import User    from "../models/User.model.js";
import Review  from "../models/Review.model.js";
import Comment from "../models/Comment.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getProfile = (req, res) =>
  successResponse(res, "Profile fetched.", req.user);

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, website, social } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, website, social },
      { new: true, runValidators: true }
    );
    return successResponse(res, "Profile updated.", user);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, "No file uploaded.", 400);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );
    return successResponse(res, "Avatar updated.", { avatar: user.avatar });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user.password)
      return errorResponse(res, "Password change not available for OAuth accounts.", 400);
    if (!(await user.comparePassword(currentPassword)))
      return errorResponse(res, "Current password is incorrect.", 401);

    user.password = newPassword;
    await user.save();
    return successResponse(res, "Password changed successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getSavedTools = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "savedTools",
      "name slug logo shortDescription pricing averageRating"
    );
    return successResponse(res, "Saved tools fetched.", user.savedTools);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const [reviews, comments] = await Promise.all([
      Review.find({ user: req.user._id })
        .sort("-createdAt")
        .limit(10),
      Comment.find({ user: req.user._id })
        .populate("blog", "title slug")
        .sort("-createdAt")
        .limit(10),
    ]);
    return successResponse(res, "Activity fetched.", { reviews, comments });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};