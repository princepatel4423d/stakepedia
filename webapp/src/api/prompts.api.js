import api from './index'

export const promptsApi = {
  getAll:        (params) => api.get('/prompts', { params }),
  getBySlug:     (slug)   => api.get(`/prompts/${slug}`),
  getCategories: ()       => api.get('/prompts/categories'),
  toggleLike:    (id)     => api.post(`/prompts/${id}/like`),
  trackUsage:    (id)     => api.post(`/prompts/${id}/track-usage`),
}