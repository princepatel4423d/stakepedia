import api from './index'

export const aiToolsApi = {
  getAll:         (params)   => api.get('/admin/ai-tools', { params }),
  getById:        (id)       => api.get(`/admin/ai-tools/${id}`),
  create:         (data)     => api.post('/admin/ai-tools', data),
  update:         (id, data) => api.put(`/admin/ai-tools/${id}`, data),
  delete:         (id)       => api.delete(`/admin/ai-tools/${id}`),
  publish:        (id)       => api.patch(`/admin/ai-tools/${id}/publish`),
  archive:        (id)       => api.patch(`/admin/ai-tools/${id}/archive`),
  toggleFeatured: (id)       => api.patch(`/admin/ai-tools/${id}/featured`),
}