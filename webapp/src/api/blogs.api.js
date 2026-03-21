import api from './index'

export const blogsApi = {
  getAll:      (params) => api.get('/blogs', { params }),
  getBySlug:   (slug)   => api.get(`/blogs/${slug}`),
  getFeatured: (limit = 6) => api.get('/blogs', { params: { status: 'published', isFeatured: true, limit } }),
  toggleLike:  (slug)   => api.post(`/blogs/${slug}/like`),
  trackView:   (id)     => api.post(`/blogs/${id}/track-view`),
  getComments: (blogId) => api.get(`/blogs/${blogId}/comments`),
  addComment:  (blogId, data) => api.post(`/blogs/${blogId}/comments`, data),
  deleteComment: (blogId, commentId) => api.delete(`/blogs/${blogId}/comments/${commentId}`),
}