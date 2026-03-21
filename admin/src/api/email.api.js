import api from './index'
export const emailApi = {
  getTemplates:   ()           => api.get('/admin/email/templates'),
  getTemplate:    (id)         => api.get(`/admin/email/templates/${id}`),
  createTemplate: (data)       => api.post('/admin/email/templates', data),
  updateTemplate: (id, data)   => api.put(`/admin/email/templates/${id}`, data),
  deleteTemplate: (id)         => api.delete(`/admin/email/templates/${id}`),
  previewTemplate:(id)         => api.get(`/admin/email/templates/${id}/preview`),
  sendTest:       (id, data)   => api.post(`/admin/email/templates/${id}/send-test`, data),
  getRecipients:  (params)     => api.get('/admin/email/campaigns/recipients', { params }),
  sendCampaign:   (data)       => api.post('/admin/email/campaigns/send', data),
  getLogs:        (params)     => api.get('/admin/email/logs', { params }),
  getStats:       ()           => api.get('/admin/email/stats'),
}