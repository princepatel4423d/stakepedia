import { body } from "express-validator";

export const createCourseValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("instructor").trim().notEmpty().withMessage("Instructor is required"),
  body("level")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Invalid level"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().notEmpty().withMessage("Each tag must be a non-empty string"),
  body("pricing").optional().isIn(["free", "paid"]),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
];

export const updateCourseValidator = [
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("level").optional().isIn(["beginner", "intermediate", "advanced"]),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().notEmpty().withMessage("Each tag must be a non-empty string"),
  body("pricing").optional().isIn(["free", "paid"]),
  body("price").optional().isFloat({ min: 0 }),
];

export const createLessonValidator = [
  body("title").trim().notEmpty().withMessage("Lesson title is required"),
  body("content").trim().notEmpty().withMessage("Lesson content is required"),
  body("duration")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Duration must be a positive integer (minutes)"),
  body("isFree").optional().isBoolean(),
  body("videoUrl").optional({ values: "falsy" }).isURL().withMessage("Video URL must be a valid URL"),
];

export const updateLessonValidator = [
  body("title").optional().trim().notEmpty(),
  body("content").optional().trim().notEmpty(),
  body("duration").optional().isInt({ min: 0 }),
  body("isFree").optional().isBoolean(),
  body("videoUrl").optional({ values: "falsy" }).isURL(),
];