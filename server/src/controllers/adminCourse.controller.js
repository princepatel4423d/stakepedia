import Course from "../models/Course.model.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { generateUniqueSlug } from "../utils/slug.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

const calcTotalDuration = (lessons = []) =>
  lessons.reduce((sum, l) => sum + (l.duration || 0), 0);

const normalizeStringArray = (items = []) => {
  const map = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const value = typeof item === "string" ? item.trim() : "";
    if (!value) return;
    const key = value.toLowerCase();
    if (!map.has(key)) map.set(key, value);
  });
  return [...map.values()];
};

export const getAllCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, status, level, pricing, isFeatured } = req.query;
    const query = {};
    if (search)     query.$text      = { $search: search };
    if (status)     query.status     = status;
    if (level)      query.level      = level;
    if (pricing)    query.pricing    = pricing;
    if (isFeatured) query.isFeatured = isFeatured === "true";

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("addedBy", "name email")
        .select("-lessons.content -lessons.resources")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    return paginatedResponse(res, "Courses fetched.", courses, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("addedBy", "name email");
    if (!course) return errorResponse(res, "Course not found.", 404);
    return successResponse(res, "Course fetched.", course);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const createCourse = async (req, res) => {
  try {
    const slug         = await generateUniqueSlug(req.body.title, Course);
    const totalDuration = calcTotalDuration(req.body.lessons);
    const tags = normalizeStringArray(req.body.tags || []);

    const course = await Course.create({
      ...req.body,
      tags,
      slug,
      totalDuration,
      addedBy: req.admin._id,
    });

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "course.created",
      resource:     "Course",
      resourceId:   course._id,
      resourceName: course.title,
      newData:      { title: course.title, slug: course.slug, status: course.status, pricing: course.pricing },
      ip:           getIP(req),
      userAgent:    req.headers["user-agent"],
    });

    return successResponse(res, "Course created.", course, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, "Course not found.", 404);

    const oldData = {
      title:   course.title,
      status:  course.status,
      pricing: course.pricing,
      price:   course.price,
    };

    if (req.body.title && req.body.title !== course.title)
      req.body.slug = await generateUniqueSlug(req.body.title, Course, course._id);

    if (req.body.lessons)
      req.body.totalDuration = calcTotalDuration(req.body.lessons);

    if (req.body.tags) req.body.tags = normalizeStringArray(req.body.tags);

    Object.assign(course, req.body);
    await course.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "course.updated",
      resource:     "Course",
      resourceId:   course._id,
      resourceName: course.title,
      oldData,
      newData:      req.body,
      ip:           getIP(req),
    });

    return successResponse(res, "Course updated.", course);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, "Course not found.", 404);

    await course.deleteOne();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "course.deleted",
      resource:     "Course",
      resourceId:   course._id,
      resourceName: course.title,
      oldData:      { title: course.title, slug: course.slug },
      ip:           getIP(req),
    });

    return successResponse(res, "Course deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, "Course not found.", 404);
    if (!course.lessons?.length)
      return errorResponse(res, "Cannot publish a course with no lessons.", 400);

    course.status = "published";
    await course.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "course.published",
      resource:     "Course",
      resourceId:   course._id,
      resourceName: course.title,
      ip:           getIP(req),
    });

    return successResponse(res, "Course published.", course);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const toggleFeaturedCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, "Course not found.", 404);
    course.isFeatured = !course.isFeatured;
    await course.save();
    return successResponse(res, `Course ${course.isFeatured ? "featured" : "unfeatured"}.`, course);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Lesson management ──────────────────────────────────────────────────────────

export const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, "Course not found.", 404);

    // First lesson is always free
    const isFree = course.lessons.length === 0 ? true : req.body.isFree || false;
    const order  = course.lessons.length;

    course.lessons.push({ ...req.body, isFree, order });
    course.totalDuration = calcTotalDuration(course.lessons);
    await course.save();

    const lesson = course.lessons[course.lessons.length - 1];

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "lesson.created",
      resource:     "Course",
      resourceId:   course._id,
      resourceName: `${course.title} › ${lesson.title}`,
      newData:      { title: lesson.title, order: lesson.order, isFree: lesson.isFree },
      ip:           getIP(req),
    });

    return successResponse(res, "Lesson added.", lesson, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, "Course not found.", 404);

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) return errorResponse(res, "Lesson not found.", 404);

    const oldData = { title: lesson.title, isFree: lesson.isFree };
    Object.assign(lesson, req.body);
    course.totalDuration = calcTotalDuration(course.lessons);
    await course.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "lesson.updated",
      resource:     "Course",
      resourceId:   course._id,
      resourceName: `${course.title} › ${lesson.title}`,
      oldData,
      newData:      req.body,
      ip:           getIP(req),
    });

    return successResponse(res, "Lesson updated.", lesson);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, "Course not found.", 404);

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) return errorResponse(res, "Lesson not found.", 404);

    const lessonTitle = lesson.title;
    lesson.deleteOne();

    // Re-order remaining lessons
    course.lessons.forEach((l, i) => { l.order = i; });
    // Ensure first lesson is always free
    if (course.lessons.length > 0) course.lessons[0].isFree = true;
    course.totalDuration = calcTotalDuration(course.lessons);
    await course.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "lesson.deleted",
      resource:     "Course",
      resourceId:   course._id,
      resourceName: `${course.title} › ${lessonTitle}`,
      ip:           getIP(req),
    });

    return successResponse(res, "Lesson deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const reorderLessons = async (req, res) => {
  try {
    const { lessonIds } = req.body; // ordered array of lesson _ids
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, "Course not found.", 404);

    lessonIds.forEach((id, index) => {
      const lesson = course.lessons.id(id);
      if (lesson) {
        lesson.order = index;
        if (index === 0) lesson.isFree = true; // first lesson always free
      }
    });

    course.lessons.sort((a, b) => a.order - b.order);
    await course.save();

    return successResponse(res, "Lessons reordered.", course.lessons);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};