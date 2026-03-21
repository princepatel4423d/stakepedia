import api from './index'
export const dashboardApi = {
  getStats: () => api.get('/admin/analytics/dashboard'),
}