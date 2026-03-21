import api from './index'
export const notificationsApi = {
  getAll:        (params) => api.get('/admin/notifications', { params }),
  getUnreadCount:()       => api.get('/admin/notifications/unread-count'),
  getRecipients: (params) => api.get('/admin/notifications/recipients', { params }),
  sendCampaign:  (data)   => api.post('/admin/notifications/campaigns/send', data),
  markRead:      (id)     => api.patch(`/admin/notifications/${id}/read`),
  markAllRead:   ()       => api.patch('/admin/notifications/read-all'),
  delete:        (id)     => api.delete(`/admin/notifications/${id}`),
  clearAll:      ()       => api.delete('/admin/notifications/clear-all'),
}