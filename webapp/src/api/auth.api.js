import api from './index'

export const authApi = {
  register:           (data)  => api.post('/auth/register', data),
  login:              (data)  => api.post('/auth/login', data),
  verifyEmail:        (data)  => api.post('/auth/verify-email', data),
  forgotPassword:     (data)  => api.post('/auth/forgot-password', data),
  resetPassword:      (data)  => api.post('/auth/reset-password', data),
  getMe:              ()      => api.get('/auth/me'),
  resendVerification: (data)  => api.post('/auth/resend-verification', data),
  googleUrl:          ()      => `${import.meta.env.VITE_API_URL}/auth/google`,
}