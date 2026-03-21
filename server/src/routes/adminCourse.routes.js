import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createCourseValidator, updateCourseValidator,
  createLessonValidator, updateLessonValidator,
} from "../validators/course.validators.js";
import {
  getAllCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, publishCourse, toggleFeaturedCourse,
  addLesson, updateLesson, deleteLesson, reorderLessons,
} from "../controllers/adminCourse.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("manageCourses"));

router.get   ("/",                          getAllCourses);
router.post  ("/",                          uploadSingle("courses", "coverImage"), createCourseValidator, validate, createCourse);
router.get   ("/:id",                       getCourseById);
router.put   ("/:id",                       uploadSingle("courses", "coverImage"), updateCourseValidator, validate, updateCourse);
router.delete("/:id",                       deleteCourse);
router.patch ("/:id/publish",               publishCourse);
router.patch ("/:id/featured",              toggleFeaturedCourse);
router.post  ("/:id/lessons",               createLessonValidator, validate, addLesson);
router.put   ("/:id/lessons/:lessonId",     updateLessonValidator, validate, updateLesson);
router.delete("/:id/lessons/:lessonId",     deleteLesson);
router.patch ("/:id/lessons/reorder",       reorderLessons);

export default router;