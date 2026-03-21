import { body } from "express-validator";

export const createCommentValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment must be 500 characters or less"),
  body("parentComment")
    .optional()
    .isMongoId()
    .withMessage("Parent comment must be a valid ID"),
];

export const updateCommentValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .isLength({ min: 1, max: 500 }),
];