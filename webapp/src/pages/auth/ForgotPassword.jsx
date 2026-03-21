import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/api/auth.api'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit } = useForm()

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess:  () => setSent(true),
    onError:    (err) => toast.error(err.response?.data?.message || 'Failed to send email'),
  })

  if (sent) return (
    <div className="text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold">Check your inbox</h2>
      <p className="text-muted-foreground">We've sent password reset instructions to your email.</p>
      <Link to="/login"><Button variant="outline" className="rounded-full">Back to sign in</Button></Link>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-muted-foreground text-sm mt-1">Enter your email and we'll send a reset link.</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email', { required: true })} />
        </div>
        <Button type="submit" className="w-full h-10 rounded-full" disabled={mutation.isPending}>
          {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : 'Send reset link'}
        </Button>
      </form>
    </div>
  )
}