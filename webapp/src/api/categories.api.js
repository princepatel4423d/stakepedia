import api from './index'

export const categoriesApi = {
  getAll: (params) => api.get('/categories/public', { params }),
}