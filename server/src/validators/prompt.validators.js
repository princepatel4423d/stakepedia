import { body } from "express-validator";

export const createPromptValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("content").trim().notEmpty().withMessage("Prompt content is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("categories")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Categories must be a non-empty array"),
  body("categories.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each category must be a non-empty string"),
  body("status").optional().isIn(["draft", "published", "archived"]),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().notEmpty().withMessage("Each tag must be a non-empty string"),
  body("tool").optional().isMongoId().withMessage("Tool must be a valid ID"),
  body("tools").optional().isArray().withMessage("Tools must be an array"),
  body("tools.*").optional().isMongoId().withMessage("Each tool must be a valid ID"),
  body("variables").optional().isArray(),
  body("variables.*.name").optional().trim().notEmpty(),
];

export const updatePromptValidator = [
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("content").optional().trim().notEmpty(),
  body("category").optional().trim().notEmpty(),
  body("categories")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Categories must be a non-empty array"),
  body("categories.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each category must be a non-empty string"),
  body("status").optional().isIn(["draft", "published", "archived"]),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().notEmpty().withMessage("Each tag must be a non-empty string"),
  body("tool").optional().isMongoId().withMessage("Tool must be a valid ID"),
  body("tools").optional().isArray().withMessage("Tools must be an array"),
  body("tools.*").optional().isMongoId().withMessage("Each tool must be a valid ID"),
];