import { useAuthStore } from '@/store/authStore'

export const usePermission = () => {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const isSuperAdmin  = useAuthStore((s) => s.isSuperAdmin)
  return { hasPermission, isSuperAdmin: isSuperAdmin() }
}