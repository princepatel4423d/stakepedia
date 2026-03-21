import api from './index'
export const categoriesApi = {
  getAll:   (params)   => api.get('/admin/categories', { params }),
  getById:  (id)       => api.get(`/admin/categories/${id}`),
  create:   (data)     => api.post('/admin/categories', data),
  update:   (id, data) => api.put(`/admin/categories/${id}`, data),
  delete:   (id)       => api.delete(`/admin/categories/${id}`),
}