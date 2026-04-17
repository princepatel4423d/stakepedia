import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function ProtectedRoute() {
  const user        = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const hydrated    = useAuthStore((s) => s.hydrated)
  const { pathname } = useLocation()
  const storedToken = localStorage.getItem('sp_token')
  const token = accessToken || storedToken

  if (!hydrated && !token) return null

  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(pathname)}`} replace />
  }

  return <Outlet />
}