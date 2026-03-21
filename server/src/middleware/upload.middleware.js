import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.config.js";

const makeStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder:          `stakepedia/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
      transformation:  [{ quality: "auto", fetch_format: "auto" }],
    },
  });

const limits = { fileSize: 5 * 1024 * 1024 };

export const uploadSingle = (folder, field = "image") =>
  multer({ storage: makeStorage(folder), limits }).single(field);

export const uploadMultiple = (folder, field = "images", max = 5) =>
  multer({ storage: makeStorage(folder), limits }).array(field, max);

export const uploadFields = (folder, fields) =>
  multer({ storage: makeStorage(folder), limits }).fields(fields);