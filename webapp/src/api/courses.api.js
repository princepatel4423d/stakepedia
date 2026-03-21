import api from './index'

export const coursesApi = {
  getAll:      (params)               => api.get('/courses', { params }),
  getBySlug:   (slug)                 => api.get(`/courses/${slug}`),
  getLesson:   (courseSlug, lessonId) => api.get(`/courses/${courseSlug}/lessons/${lessonId}`),
}