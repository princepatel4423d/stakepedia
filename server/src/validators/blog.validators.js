import { body } from "express-validator";

export const createBlogValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Invalid status"),
  body("categories").optional().isArray().withMessage("Categories must be an array"),
  body("categories.*").optional().isString().trim().notEmpty().withMessage("Each category must be a non-empty string"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().notEmpty().withMessage("Each tag must be a non-empty string"),
];

export const updateBlogValidator = [
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("content").optional().trim().notEmpty(),
  body("status").optional().isIn(["draft", "published", "archived"]),
  body("categories").optional().isArray().withMessage("Categories must be an array"),
  body("categories.*").optional().isString().trim().notEmpty().withMessage("Each category must be a non-empty string"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().notEmpty().withMessage("Each tag must be a non-empty string"),
];