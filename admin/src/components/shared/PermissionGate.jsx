import { useAuthStore } from '@/store/authStore'

const PermissionGate = ({ permission, fallback = null, children }) => {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  if (!hasPermission(permission)) return fallback
  return children
}

export default PermissionGate