import cloudinary from "../config/cloudinary.config.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const uploadImage = (req, res) => {
  if (!req.file) return errorResponse(res, "No file uploaded.", 400);
  return successResponse(res, "Image uploaded.", {
    url:      req.file.path,
    publicId: req.file.filename,
  });
};

export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return errorResponse(res, "publicId required.", 400);
    await cloudinary.uploader.destroy(publicId);
    return successResponse(res, "Image deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};