import Course from "../models/Course.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";

export const getCourses = async (req, res) => {
  try {
    const { page, limit, skip }                       = getPagination(req.query);
    const { search, level, pricing, isFeatured, sort = "-createdAt" } = req.query;
    const query = { status: "published" };
    if (search)     query.$text      = { $search: search };
    if (level)      query.level      = level;
    if (pricing)    query.pricing    = pricing;
    if (isFeatured) query.isFeatured = isFeatured === "true";

    const [courses, total] = await Promise.all([
      Course.find(query)
        .select("-lessons")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    return paginatedResponse(res, "Courses fetched.", courses, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, status: "published" });

    if (!course) return errorResponse(res, "Course not found.", 404);

    // Access control: first lesson free, rest require auth
    const isAuth = !!req.user;
    const lessons = course.lessons
      .sort((a, b) => a.order - b.order)
      .map((lesson, idx) => {
        const isAccessible = idx === 0 || isAuth;
        return {
          _id:        lesson._id,
          title:      lesson.title,
          duration:   lesson.duration,
          isFree:     lesson.isFree,
          order:      lesson.order,
          resources:  isAccessible ? lesson.resources : [],
          // Only send content if accessible
          ...(isAccessible && { content: lesson.content, videoUrl: lesson.videoUrl }),
          locked: !isAccessible,
        };
      });

    return successResponse(res, "Course fetched.", { ...course.toJSON(), lessons });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getLessonById = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, status: "published" });
    if (!course) return errorResponse(res, "Course not found.", 404);

    const lesson    = course.lessons.id(req.params.lessonId);
    if (!lesson) return errorResponse(res, "Lesson not found.", 404);

    const lessonIndex = course.lessons
      .sort((a, b) => a.order - b.order)
      .findIndex((l) => l._id.toString() === req.params.lessonId);

    // First lesson always accessible, rest require login
    if (lessonIndex > 0 && !req.user)
      return errorResponse(res, "Please login to access this lesson.", 401);

    // Build prev/next navigation
    const sorted = course.lessons.sort((a, b) => a.order - b.order);
    const prev   = lessonIndex > 0 ? { _id: sorted[lessonIndex - 1]._id, title: sorted[lessonIndex - 1].title } : null;
    const next   = lessonIndex < sorted.length - 1 ? { _id: sorted[lessonIndex + 1]._id, title: sorted[lessonIndex + 1].title } : null;

    return successResponse(res, "Lesson fetched.", {
      lesson,
      course: { _id: course._id, title: course.title, slug: course.slug, totalLessons: course.lessons.length },
      navigation: { prev, next, current: lessonIndex + 1, total: course.lessons.length },
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};