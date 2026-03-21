import api from './index'
export const promptsApi = {
  getAll:         (params)   => api.get('/admin/prompts', { params }),
  getById:        (id)       => api.get(`/admin/prompts/${id}`),
  create:         (data)     => api.post('/admin/prompts', data),
  update:         (id, data) => api.put(`/admin/prompts/${id}`, data),
  delete:         (id)       => api.delete(`/admin/prompts/${id}`),
  publish:        (id)       => api.patch(`/admin/prompts/${id}/publish`),
  toggleFeatured: (id)       => api.patch(`/admin/prompts/${id}/featured`),
}