import api from './index'

export const aiToolsApi = {
  getAll:      (params) => api.get('/ai-tools', { params }),
  getBySlug:   (slug)   => api.get(`/ai-tools/${slug}`),
  getFeatured: (limit = 8) => api.get('/ai-tools', { params: { status: 'published', isFeatured: true, limit } }),
  toggleSave:  (id)     => api.post(`/ai-tools/${id}/save`),
  trackView:   (id)     => api.post(`/ai-tools/${id}/track-view`),
}