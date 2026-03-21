import api from './index'
export const usersApi = {
  getAll:        (params) => api.get('/admin/users', { params }),
  getById:       (id)     => api.get(`/admin/users/${id}`),
  getStats:      ()       => api.get('/admin/users/stats'),
  toggleStatus:  (id)     => api.patch(`/admin/users/${id}/status`),
  setBan:        (id, data) => api.patch(`/admin/users/${id}/ban`, data),
  delete:        (id)     => api.delete(`/admin/users/${id}`),
}