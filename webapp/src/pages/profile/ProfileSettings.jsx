import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Save, Eye, EyeOff, ArrowLeft,
  Camera, Globe, Twitter, Github, Linkedin,
  Shield, ShieldCheck, Mail, AlertTriangle, User,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/authStore'
import { profileApi } from '@/api/profile.api'
import { formatDate } from '@/lib/utils'
import SEO from '@/components/common/SEO'

// Schemas
const profileSchema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(50),
  bio: z.string().max(300, 'Max 300 characters').optional().or(z.literal('')),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  twitter: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  github: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Password strength
function PasswordStrength({ password = '' }) {
  const checks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.met).length
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  if (!password) return null

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score] : 'bg-muted'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map(({ label, met }) => (
            <span key={label} className={`text-[10px] flex items-center gap-1 ${met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${met ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
              {label}
            </span>
          ))}
        </div>
        <span className={`text-xs font-medium ${score >= 4 ? 'text-green-600 dark:text-green-400' : score >= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
          {labels[score]}
        </span>
      </div>
    </div>
  )
}

// Main
export default function ProfileSettings() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Fetch fresh profile data
  const { data: profile } = useQuery({
    queryKey: ['profile-me-settings'],
    queryFn: profileApi.get,
    select: (res) => res.data.data,
  })

  const currentUser = profile || user

  // Profile form
  const {
    register: regProfile,
    handleSubmit: submitProfile,
    reset,
    watch: watchProfile,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
      website: '',
      twitter: '',
      github: '',
      linkedin: '',
    },
  })

  // Password form
  const {
    register: regPw,
    handleSubmit: submitPw,
    reset: resetPw,
    watch: watchPw,
    formState: { errors: pwErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) })

  const newPassword = watchPw('newPassword', '')

  // Populate form when profile loads
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        website: currentUser.website || '',
        twitter: currentUser.social?.twitter || '',
        github: currentUser.social?.github || '',
        linkedin: currentUser.social?.linkedin || '',
      })
    }
  }, [currentUser, reset])

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: (data) => profileApi.update({
      name: data.name,
      bio: data.bio || null,
      website: data.website || null,
      social: {
        twitter: data.twitter || null,
        github: data.github || null,
        linkedin: data.linkedin || null,
      },
    }),
    onSuccess: (res) => {
      updateUser(res.data.data)
      toast.success('Profile updated successfully')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  })

  // Password mutation
  const passwordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully')
      resetPw()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  })

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await profileApi.updateAvatar(fd)
      updateUser({ avatar: res.data.data?.avatar })
      toast.success('Avatar updated')
    } catch {
      toast.error('Avatar upload failed')
    } finally {
      setUploading(false)
    }
  }

  const bioLength = watchProfile('bio')?.length || 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">

      <SEO
        title="Account Settings | Stakepedia"
        description="Manage your Stakepedia profile, password, and account preferences."
        noIndex
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Account settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile, security and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full sm:w-auto mb-8">
          <TabsTrigger value="profile" className="gap-2 flex-1 sm:flex-none">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 flex-1 sm:flex-none">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 flex-1 sm:flex-none">
            <Mail className="h-4 w-4" /> Account
          </TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Avatar */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Profile photo</CardTitle>
              <CardDescription>JPG, PNG or WebP · max 2MB</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser?.avatar} referrerPolicy="no-referrer" />
                    <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                      {currentUser?.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="avatar-upload-btn">
                    <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                      <span className="cursor-pointer">
                        <Camera className="h-3.5 w-3.5" />
                        {uploading ? 'Uploading...' : 'Change photo'}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-upload-btn"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Hover over the photo to change it
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Personal information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submitProfile((d) => profileMutation.mutate(d))}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name *</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    {...regProfile('name')}
                  />
                  {profileErrors.name && (
                    <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Email address</Label>
                  <div className="relative">
                    <Input
                      value={currentUser?.email || ''}
                      disabled
                      className="opacity-60 cursor-not-allowed pr-20"
                    />
                    {currentUser?.isEmailVerified && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email address cannot be changed.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Bio</Label>
                    <span className={`text-xs ${bioLength > 280 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {bioLength}/300
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    placeholder="Tell the community a bit about yourself..."
                    rows={3}
                    maxLength={300}
                    {...regProfile('bio')}
                  />
                  {profileErrors.bio && (
                    <p className="text-xs text-destructive">{profileErrors.bio.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={profileMutation.isPending || !profileDirty}
                  className="gap-2 rounded-full"
                >
                  <Save className="h-4 w-4" />
                  {profileMutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Social links */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Social links</CardTitle>
              <CardDescription>These show on your public profile</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submitProfile((d) => profileMutation.mutate(d))}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://your-website.com"
                    {...regProfile('website')}
                  />
                  {profileErrors.website && (
                    <p className="text-xs text-destructive">{profileErrors.website.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="h-3.5 w-3.5 text-muted-foreground" /> Twitter / X
                    </Label>
                    <Input
                      id="twitter"
                      placeholder="https://x.com/username"
                      {...regProfile('twitter')}
                    />
                    {profileErrors.twitter && (
                      <p className="text-xs text-destructive">{profileErrors.twitter.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="github" className="flex items-center gap-2">
                      <Github className="h-3.5 w-3.5 text-muted-foreground" /> GitHub
                    </Label>
                    <Input
                      id="github"
                      placeholder="https://github.com/username"
                      {...regProfile('github')}
                    />
                    {profileErrors.github && (
                      <p className="text-xs text-destructive">{profileErrors.github.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-3.5 w-3.5 text-muted-foreground" /> LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    {...regProfile('linkedin')}
                  />
                  {profileErrors.linkedin && (
                    <p className="text-xs text-destructive">{profileErrors.linkedin.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={profileMutation.isPending}
                  className="gap-2 rounded-full"
                >
                  <Save className="h-4 w-4" />
                  {profileMutation.isPending ? 'Saving...' : 'Save links'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Password change — only for local auth */}
          {currentUser?.authProvider === 'local' ? (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Change password</CardTitle>
                <CardDescription>
                  Choose a strong, unique password that you don't use anywhere else.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={submitPw((d) => passwordMutation.mutate(d))}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <Label>Current password *</Label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="pr-10"
                        {...regPw('currentPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {pwErrors.currentPassword && (
                      <p className="text-xs text-destructive">{pwErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>New password *</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="pr-10"
                        {...regPw('newPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={newPassword} />
                    {pwErrors.newPassword && (
                      <p className="text-xs text-destructive">{pwErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Confirm new password *</Label>
                    <Input
                      type="password"
                      placeholder="Repeat your new password"
                      {...regPw('confirmPassword')}
                    />
                    {pwErrors.confirmPassword && (
                      <p className="text-xs text-destructive">{pwErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    disabled={passwordMutation.isPending}
                    className="gap-2 rounded-full"
                  >
                    <Shield className="h-4 w-4" />
                    {passwordMutation.isPending ? 'Updating...' : 'Update password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Signed in with {currentUser?.authProvider === 'google' ? 'Google' : 'OAuth'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Password management is handled by your sign-in provider.
                      To change your password, visit your{' '}
                      {currentUser?.authProvider === 'google' ? (
                        <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Google account settings
                        </a>
                      ) : 'provider settings'}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email verification status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Email verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-start gap-3 p-4 rounded-xl ${currentUser?.isEmailVerified
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-amber-50 dark:bg-amber-900/20'
                }`}>
                {currentUser?.isEmailVerified ? (
                  <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${currentUser?.isEmailVerified
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-amber-800 dark:text-amber-300'
                    }`}>
                    {currentUser?.isEmailVerified ? 'Email verified' : 'Email not verified'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currentUser?.isEmailVerified
                      ? `${currentUser.email} is verified and secure.`
                      : 'Verify your email to unlock all features and secure your account.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account tab */}
        <TabsContent value="account" className="space-y-6">
          {/* Account overview */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Account details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Member since', value: formatDate(currentUser?.createdAt) },
                  { label: 'Last login', value: currentUser?.lastLogin ? formatDate(currentUser.lastLogin) : 'N/A' },
                  { label: 'Sign-in method', value: currentUser?.authProvider === 'google' ? 'Google OAuth' : 'Email & password' },
                  { label: 'Account status', value: currentUser?.isActive ? 'Active' : 'Inactive' },
                  { label: 'Email verified', value: currentUser?.isEmailVerified ? 'Yes' : 'No' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Danger zone
              </CardTitle>
              <CardDescription>
                Irreversible actions — please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium">Delete account</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="shrink-0 ml-4"
                  onClick={() => toast.error('Please contact support to delete your account.')}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}