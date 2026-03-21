import express from "express";
import { optionalAuth, protect } from "../middleware/auth.middleware.js";
import { getCourses, getCourseBySlug, getLessonById } from "../controllers/course.controller.js";

const router = express.Router();

router.get("/",                                  getCourses);
router.get("/:slug",                             optionalAuth, getCourseBySlug);
router.get("/:slug/lessons/:lessonId",           optionalAuth, getLessonById);

export default router;