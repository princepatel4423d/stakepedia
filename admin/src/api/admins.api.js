import api from './index'

export const adminsApi = {
  getAll:            (params)   => api.get('/admin', { params }),
  getById:           (id)       => api.get(`/admin/${id}`),
  create:            (data)     => api.post('/admin', data),
  update:            (id, data) => api.put(`/admin/${id}`, data),
  updatePermissions: (id, data) => api.patch(`/admin/${id}/permissions`, data),
  delete:            (id)       => api.delete(`/admin/${id}`),
}