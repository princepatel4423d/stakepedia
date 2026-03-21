import api from './index'

export const authApi = {
  login:            (data) => api.post('/admin/auth/login', data),
  verify2FA:        (data) => api.post('/admin/auth/verify-2fa', data),
  setup2FA:         ()     => api.post('/admin/auth/setup-2fa'),
  enable2FA:        (data) => api.post('/admin/auth/enable-2fa', data),
  disable2FA:       (data) => api.post('/admin/auth/disable-2fa', data),
  forgotPassword:   (data) => api.post('/admin/auth/forgot-password', data),
  resetPassword:    (data) => api.post('/admin/auth/reset-password', data),
  getMe:            ()     => api.get('/admin/auth/me'),
  logout:           ()     => Promise.resolve(),
}