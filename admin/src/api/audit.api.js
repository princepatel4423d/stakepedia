import api from './index'
export const auditApi = {
  getAll:          (params)              => api.get('/admin/audit', { params }),
  getById:         (id)                  => api.get(`/admin/audit/${id}`),
  getStats:        ()                    => api.get('/admin/audit/stats'),
  getByResource:   (type, id)            => api.get(`/admin/audit/${type}/${id}`),
}