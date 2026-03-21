import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ShieldCheck, ShieldOff, Copy, CheckCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

const Setup2FA = () => {
  const [totpCode, setTotpCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [disableCode, setDisableCode] = useState('')

  const admin = useAuthStore((s) => s.admin)
  const updateAdmin = useAuthStore((s) => s.updateAdmin)

  // Only fetch setup data when dialog opens
  const setupQuery = useQuery({
    queryKey: ['2fa-setup'],
    queryFn: () => authApi.setup2FA(),
    select: (res) => res.data.data,
    enabled: dialogOpen && !admin?.twoFactorEnabled,
  })

  const enableMutation = useMutation({
    mutationFn: (data) => authApi.enable2FA(data),
    onSuccess: () => {
      updateAdmin({ twoFactorEnabled: true })
      setDialogOpen(false)
      setTotpCode('')
      toast.success('Two-factor authentication enabled')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid code'),
  })

  const disableMutation = useMutation({
    mutationFn: (data) => authApi.disable2FA(data),
    onSuccess: () => {
      updateAdmin({ twoFactorEnabled: false })
      setDisableDialogOpen(false)
      setDisableCode('')
      toast.success('Two-factor authentication disabled')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid code'),
  })

  const copySecret = () => {
    navigator.clipboard.writeText(setupQuery.data?.secret || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEnableClick = () => {
    setTotpCode('')
    setDialogOpen(true)
  }

  const handleDisableClick = () => {
    setDisableCode('')
    setDisableDialogOpen(true)
  }

  const handleEnableSubmit = () => {
    if (totpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }
    enableMutation.mutate({
      totpCode,
      secret: setupQuery.data?.secret,
    })
  }

  const handleDisableSubmit = () => {
    if (disableCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }
    disableMutation.mutate({ totpCode: disableCode })
  }

  // If 2FA is disabled
  if (!admin?.twoFactorEnabled) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            Two-factor authentication is not enabled. Enable it to add an extra layer of security to your account.
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-amber-600" />
              Two-factor authentication disabled
            </CardTitle>
            <CardDescription>
              Protect your admin account with an additional security layer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="font-medium">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Download an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)</li>
                <li>Scan the QR code or enter the secret manually</li>
                <li>Enter the 6-digit code to verify and enable 2FA</li>
                <li>You'll need to provide a 2FA code every time you log in</li>
              </ul>
            </div>
            <Button
              onClick={handleEnableClick}
              className="w-full"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Enable 2FA
            </Button>
          </CardContent>
        </Card>

        {/* Enable 2FA Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app or enter the code manually
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* QR Code */}
              {setupQuery.isLoading ? (
                <div className="flex justify-center">
                  <div className="h-48 w-48 rounded-lg bg-muted animate-pulse" />
                </div>
              ) : (
                <div className="flex justify-center">
                  <img
                    src={setupQuery.data?.qrCode}
                    alt="2FA QR Code"
                    className="h-48 w-48 rounded-lg border p-2 bg-white"
                  />
                </div>
              )}

              {/* Manual secret */}
              <div className="space-y-2">
                <Label className="text-sm">Or enter this code manually:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={setupQuery.data?.secret || ''}
                    readOnly
                    className="font-mono text-sm bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copySecret}
                    disabled={!setupQuery.data?.secret}
                  >
                    {copied
                      ? <CheckCheck className="h-4 w-4 text-green-500" />
                      : <Copy className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Verify code */}
              <div className="space-y-2">
                <Label htmlFor="totp-code" className="text-sm">Enter the 6-digit code from your app:</Label>
                <Input
                  id="totp-code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={enableMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEnableSubmit}
                  disabled={totpCode.length !== 6 || enableMutation.isPending || setupQuery.isLoading}
                >
                  {enableMutation.isPending ? 'Verifying...' : 'Enable 2FA'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // If 2FA is enabled
  return (
    <div className="max-w-2xl space-y-6">
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-300">
            <ShieldCheck className="h-5 w-5" />
            Two-factor authentication enabled
          </CardTitle>
          <CardDescription className="text-green-800 dark:text-green-400">
            Your account is protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-green-800 dark:text-green-300">
            <p className="font-medium mb-2">Your account is now more secure:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>You require a 2FA code for every login</li>
              <li>Only your authenticator app can generate valid codes</li>
              <li>This protects against unauthorized access</li>
            </ul>
          </div>

          <Button
            variant="destructive"
            onClick={handleDisableClick}
            className="w-full"
          >
            <ShieldOff className="h-4 w-4 mr-2" />
            Disable 2FA
          </Button>
        </CardContent>
      </Card>

      {/* Disable 2FA Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your current TOTP code to disable 2FA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-300">
                Disabling 2FA will reduce the security of your account. You can re-enable it anytime.
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disable-code">Enter 6-digit code:</Label>
              <Input
                id="disable-code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDisableDialogOpen(false)}
                disabled={disableMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisableSubmit}
                disabled={disableCode.length !== 6 || disableMutation.isPending}
              >
                {disableMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Setup2FA