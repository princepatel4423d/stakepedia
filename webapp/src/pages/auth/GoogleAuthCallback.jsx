import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

export default function GoogleAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const run = async () => {
      const accessToken = searchParams.get('accessToken')
      const error = searchParams.get('error') || (window.location.pathname.includes('/error') ? 'oauth' : null)

      if (error || !accessToken) {
        toast.error('Google sign-in failed. Please try again.')
        navigate('/login', { replace: true })
        return
      }

      try {
        localStorage.setItem('sp_token', accessToken)
        const meRes = await authApi.getMe()
        const user = meRes.data?.data

        if (!user) {
          throw new Error('Missing user profile')
        }

        setAuth(user, accessToken)
        toast.success(`Welcome, ${user.name}!`)

        const redirect = sessionStorage.getItem('sp_auth_redirect') || '/'
        sessionStorage.removeItem('sp_auth_redirect')
        navigate(redirect, { replace: true })
      } catch {
        localStorage.removeItem('sp_token')
        toast.error('Could not complete Google sign-in.')
        navigate('/login', { replace: true })
      }
    }

    run()
  }, [navigate, searchParams, setAuth])

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <h1 className="text-lg font-semibold">Signing you in...</h1>
      <p className="text-sm text-muted-foreground">Completing Google authentication.</p>
    </div>
  )
}
