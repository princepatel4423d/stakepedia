import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'
import googleLogo from '@/assets/google.svg'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export default function Login() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const setAuth        = useAuthStore((s) => s.setAuth)
  const accessToken    = useAuthStore((s) => s.accessToken)
  const hydrated       = useAuthStore((s) => s.hydrated)
  const [showPw, setShowPw] = useState(false)
  const redirect = searchParams.get('redirect') || '/'

  const handleGoogleLogin = () => {
    sessionStorage.setItem('sp_auth_redirect', redirect)
    window.location.href = authApi.googleUrl()
  }

  useEffect(() => {
    const token = accessToken || localStorage.getItem('sp_token')
    if (hydrated && token) {
      navigate(redirect, { replace: true })
    }
  }, [accessToken, hydrated, navigate, redirect])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const payload = res.data?.data || res.data || {}
      const user = payload.user
      const accessToken = payload.accessToken || payload.token

      if (!user || !accessToken) {
        toast.error('Login response is missing auth data. Please try again.')
        return
      }

      setAuth(user, accessToken)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(redirect, { replace: true })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full h-10 rounded-full" disabled={mutation.isPending}>
          {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</> : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full h-10 rounded-full" onClick={handleGoogleLogin}>
        <img src={googleLogo} alt="Google" className="h-4 w-4 mr-2" />
        Continue with Google
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:underline font-medium">Sign up</Link>
      </div>
    </div>
  )
}