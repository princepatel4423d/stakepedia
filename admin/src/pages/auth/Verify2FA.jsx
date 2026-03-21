import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useAuthStore } from '@/store/authStore'

const Verify2FA = () => {
  const [code, setCode]   = useState(['', '', '', '', '', ''])
  const inputs            = useRef([])
  const navigate          = useNavigate()
  const preAuthToken      = useAuthStore((s) => s.preAuthToken)
  const isAuthenticated   = useAuthStore((s) => s.isAuthenticated)
  const { verify2FAMutation } = useAdminAuth()

  // Redirect only if no preAuthToken AND not authenticated
  useEffect(() => {
    if (!preAuthToken && !isAuthenticated) {
      navigate('/login')
    }
  }, [preAuthToken, isAuthenticated, navigate])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    pasted.split('').forEach((char, i) => { newCode[i] = char })
    setCode(newCode)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const totpCode = code.join('')
    if (totpCode.length !== 6) return
    verify2FAMutation.mutate({ preAuthToken, totpCode })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Two-factor authentication</h1>
          <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Verify identity</CardTitle>
            <CardDescription>Open your authenticator app and enter the current code</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="h-12 w-10 rounded-md border border-input bg-background text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={code.join('').length !== 6 || verify2FAMutation.isPending}
              >
                {verify2FAMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Verifying...
                  </span>
                ) : 'Verify'}
              </Button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Verify2FA