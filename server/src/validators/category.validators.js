import { body } from "express-validator";

export const createCategoryValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("description").optional().trim().isLength({ max: 300 }),
  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Color must be a valid hex code"),
];

export const updateCategoryValidator = [
  body("name").optional().trim().notEmpty().isLength({ max: 50 }),
  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Color must be a valid hex code"),
  body("isActive").optional().isBoolean(),
];