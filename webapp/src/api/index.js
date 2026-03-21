import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken || localStorage.getItem('sp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = err.config?.url || ''
    const isAuthRequest = /\/auth\/(login|register|forgot-password|reset-password|verify-email|resend-verification|refresh-token)/.test(requestUrl)
    const hasToken = !!(useAuthStore.getState().accessToken || localStorage.getItem('sp_token'))

    if (err.response?.status === 401 && hasToken && !isAuthRequest) {
      useAuthStore.getState().logout()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1'
      }
    }
    return Promise.reject(err)
  }
)

export default api