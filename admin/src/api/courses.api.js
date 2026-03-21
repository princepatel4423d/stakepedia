import api from './index'
export const coursesApi = {
  getAll:         (params)        => api.get('/admin/courses', { params }),
  getById:        (id)            => api.get(`/admin/courses/${id}`),
  create:         (data)          => api.post('/admin/courses', data),
  update:         (id, data)      => api.put(`/admin/courses/${id}`, data),
  delete:         (id)            => api.delete(`/admin/courses/${id}`),
  publish:        (id)            => api.patch(`/admin/courses/${id}/publish`),
  toggleFeatured: (id)            => api.patch(`/admin/courses/${id}/featured`),
  addLesson:      (id, data)      => api.post(`/admin/courses/${id}/lessons`, data),
  updateLesson:   (id, lid, data) => api.put(`/admin/courses/${id}/lessons/${lid}`, data),
  deleteLesson:   (id, lid)       => api.delete(`/admin/courses/${id}/lessons/${lid}`),
  reorderLessons: (id, data)      => api.patch(`/admin/courses/${id}/lessons/reorder`, data),
}