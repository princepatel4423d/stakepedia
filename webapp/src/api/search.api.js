import api from './index'

export const searchApi = {
  global: (params) => api.get('/search', { params }),
}