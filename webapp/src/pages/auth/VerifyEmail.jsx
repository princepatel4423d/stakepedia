import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/api/auth.api'

const schema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
})

export default function VerifyEmail() {
  const location = useLocation()
  const defaultEmail = useMemo(() => location.state?.email || '', [location.state])
  const [verified, setVerified] = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: defaultEmail, otp: '' },
  })

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      setVerified(true)
      toast.success('Email verified successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP')
    },
  })

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => toast.success('A new OTP has been sent to your email'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to resend OTP'),
  })

  if (verified) return (
    <div className="text-center space-y-4">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <h2 className="text-2xl font-bold">Email verified!</h2>
      <p className="text-muted-foreground">Your account is now active. Sign in to get started.</p>
      <Link to="/login"><Button className="rounded-full px-8">Sign in</Button></Link>
    </div>
  )

  const handleResend = () => {
    const email = getValues('email')
    if (!email) {
      toast.error('Please enter your email first')
      return
    }
    resendMutation.mutate({ email })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-muted-foreground text-sm mt-1">Enter the 6-digit OTP sent to your email</p>
      </div>

      <form onSubmit={handleSubmit((values) => verifyMutation.mutate(values))} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="otp">OTP</Label>
          <Input id="otp" inputMode="numeric" maxLength={6} placeholder="123456" {...register('otp')} />
          {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
        </div>

        <Button type="submit" className="w-full h-10 rounded-full" disabled={verifyMutation.isPending}>
          {verifyMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</> : 'Verify email'}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-full"
        onClick={handleResend}
        disabled={resendMutation.isPending}
      >
        {resendMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : 'Resend OTP'}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Already verified?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
      </div>
    </div>
  )
}