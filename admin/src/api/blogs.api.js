import api from './index'
export const blogsApi = {
  getAll:       (params)   => api.get('/admin/blogs', { params }),
  getById:      (id)       => api.get(`/admin/blogs/${id}`),
  create:       (data)     => api.post('/admin/blogs', data),
  update:       (id, data) => api.put(`/admin/blogs/${id}`, data),
  delete:       (id)       => api.delete(`/admin/blogs/${id}`),
  publish:      (id)       => api.patch(`/admin/blogs/${id}/publish`),
  archive:      (id)       => api.patch(`/admin/blogs/${id}/archive`),
  toggleFeatured: (id)     => api.patch(`/admin/blogs/${id}/featured`),
}