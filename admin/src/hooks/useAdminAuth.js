import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

export const useAdminAuth = () => {
  const navigate   = useNavigate()
  const setAuth    = useAuthStore((s) => s.setAuth)
  const setPreAuth = useAuthStore((s) => s.setPreAuthToken)
  const logout     = useAuthStore((s) => s.logout)

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const { requires2FA, preAuthToken, admin, accessToken } = res.data.data
      if (requires2FA) {
        setPreAuth(preAuthToken)
        navigate('/verify-2fa')
      } else {
        setAuth(admin, accessToken)
        toast.success(`Welcome back, ${admin.name}!`)
        navigate('/dashboard')
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed')
    },
  })

  const verify2FAMutation = useMutation({
    mutationFn: authApi.verify2FA,
    onSuccess: (res) => {
      const { admin, accessToken } = res.data.data
      setAuth(admin, accessToken)
      toast.success(`Welcome back, ${admin.name}!`)
      navigate('/dashboard')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Invalid 2FA code')
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => toast.success('Reset link sent to your email'),
    onError:   (err) => toast.error(err.response?.data?.message || 'Failed to send reset link'),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully')
      navigate('/login')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reset failed'),
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return {
    loginMutation,
    verify2FAMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    handleLogout,
  }
}