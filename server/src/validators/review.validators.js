import { body } from "express-validator";

export const createReviewValidator = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Review content is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Review must be between 10 and 1000 characters"),
  body("title").optional().trim().isLength({ max: 100 }),
];

export const updateReviewValidator = [
  body("rating").optional().isInt({ min: 1, max: 5 }),
  body("content").optional().trim().notEmpty().isLength({ min: 10, max: 1000 }),
  body("title").optional().trim().isLength({ max: 100 }),
];