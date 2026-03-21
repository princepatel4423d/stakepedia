import jwt from "jsonwebtoken";

export const generateAccessToken  = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" });

export const generatePreAuthToken = (payload) =>
  jwt.sign({ ...payload, preAuth: true }, process.env.JWT_SECRET, { expiresIn: "5m" });

export const verifyAccessToken  = (token) => jwt.verify(token, process.env.JWT_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);