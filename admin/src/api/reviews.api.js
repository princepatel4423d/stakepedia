import api from './index'
export const reviewsApi = {
  getAll:    (params) => api.get('/reviews/admin/all', { params }),
  approve:   (id)     => api.patch(`/reviews/admin/${id}/approve`),
  reject:    (id)     => api.patch(`/reviews/admin/${id}/reject`),
  delete:    (id)     => api.delete(`/reviews/admin/${id}`),
}