import api from './index'

export const statsApi = {
  getPublic: () => api.get('/stats/public'),
}
