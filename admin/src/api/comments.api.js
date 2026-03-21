import api from './index'
export const commentsApi = {
  getAll:    (params) => api.get('/admin/comments', { params }),
  approve:   (id)     => api.patch(`/admin/comments/${id}/approve`),
  delete:    (id)     => api.delete(`/admin/comments/${id}`),
}