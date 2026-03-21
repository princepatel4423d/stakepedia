import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Unauthorized from './Unauthorized'

const PermissionRoute = ({ permission, anyPermissions = [], superAdminOnly = false }) => {
  const admin = useAuthStore((s) => s.admin)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken = useAuthStore((s) => s.accessToken)

  // Not authenticated
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />
  }

  // Not an admin at all
  if (!admin) {
    return <Navigate to="/login" replace />
  }

  // Check superadmin requirement
  if (superAdminOnly && admin.role !== 'superadmin') {
    return <Unauthorized />
  }

  // Check specific permission
  if (permission && !hasPermission(permission)) {
    return <Unauthorized />
  }

  // Check if user has at least one of the allowed permissions
  if (anyPermissions.length > 0 && !anyPermissions.some((item) => hasPermission(item))) {
    return <Unauthorized />
  }

  return <Outlet />
}

export default PermissionRoute
