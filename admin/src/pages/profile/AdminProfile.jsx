import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Save, Shield, Camera, Key, User,
    Eye, EyeOff, CheckCircle, Lock,
    Mail, ShieldCheck, ShieldOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageHeader from '@/components/shared/PageHeader'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import Setup2FA from '@/pages/auth/Setup2FA'
import api from '@/api/index'

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string()
        .min(8, 'At least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase and number'),
    confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

// Password strength meter
const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-red-500' }
    if (score === 2) return { score: 40, label: 'Fair', color: 'bg-orange-500' }
    if (score === 3) return { score: 60, label: 'Good', color: 'bg-yellow-500' }
    if (score === 4) return { score: 80, label: 'Strong', color: 'bg-blue-500' }
    return { score: 100, label: 'Very strong', color: 'bg-green-500' }
}

// Change password section
const ChangePasswordSection = () => {
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [success, setSuccess] = useState(false)

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(passwordSchema),
    })

    const newPassword = watch('newPassword', '')
    const strength = getPasswordStrength(newPassword)

    const mutation = useMutation({
        mutationFn: (data) => api.patch('/admin/auth/change-password', data),
        onSuccess: () => {
            toast.success('Password changed successfully')
            reset()
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Change failed'),
    })

    return (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Password updated successfully
                </div>
            )}

            <div className="space-y-2">
                <Label>Current password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="pl-9 pr-10"
                        {...register('currentPassword')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.currentPassword && (
                    <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>New password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type={showNew ? 'text' : 'password'}
                        placeholder="Create new password"
                        className="pl-9 pr-10"
                        {...register('newPassword')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {newPassword && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Password strength</span>
                            <span className={`font-medium ${strength.score < 40 ? 'text-red-500' :
                                    strength.score < 60 ? 'text-orange-500' :
                                        strength.score < 80 ? 'text-yellow-600' :
                                            'text-green-600'
                                }`}>{strength.label}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                                style={{ width: `${strength.score}%` }}
                            />
                        </div>
                    </div>
                )}
                {errors.newPassword && (
                    <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Confirm new password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repeat new password"
                        className="pl-9 pr-10"
                        {...register('confirmPassword')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-1.5">
                {[
                    { label: '8+ characters', met: newPassword.length >= 8 },
                    { label: 'Uppercase letter', met: /[A-Z]/.test(newPassword) },
                    { label: 'Number', met: /[0-9]/.test(newPassword) },
                    { label: 'Lowercase letter', met: /[a-z]/.test(newPassword) },
                ].map(({ label, met }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs">
                        <div className={`h-1.5 w-1.5 rounded-full ${met ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                        <span className={met ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                    </div>
                ))}
            </div>

            <Button type="submit" disabled={mutation.isPending} className="w-full">
                <Key className="h-4 w-4 mr-2" />
                {mutation.isPending ? 'Updating...' : 'Update password'}
            </Button>
        </form>
    )
}

// Main
const AdminProfile = () => {
    const admin = useAuthStore((s) => s.admin)
    const updateAdmin = useAuthStore((s) => s.updateAdmin)

    const [avatarUploading, setAvatarUploading] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: admin?.name || '' },
    })

    useEffect(() => {
        if (admin) reset({ name: admin.name })
    }, [admin, reset])

    const profileMutation = useMutation({
        mutationFn: (data) => api.put('/admin/auth/profile', data),
        onSuccess: (res) => {
            updateAdmin(res.data.data)
            toast.success('Profile updated')
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
    })

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Avatar must be under 2MB')
            return
        }
        setAvatarUploading(true)
        try {
            const fd = new FormData()
            fd.append('image', file)
            const res = await api.post('/uploads/image', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            await api.put('/admin/auth/profile', { avatar: res.data.data.url })
            updateAdmin({ avatar: res.data.data.url })
            toast.success('Avatar updated')
        } catch {
            toast.error('Avatar upload failed')
        } finally {
            setAvatarUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="My profile"
                description="Manage your account details and security settings"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Profile' },
                ]}
            />

            {/* Hero card */}
            <Card className="overflow-hidden">
                <div className="h-24 bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />
                <CardContent className="pt-0 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                        {/* Avatar */}
                        <div className="relative group w-fit">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                                <AvatarImage
                                    src={admin?.avatar}
                                    referrerPolicy="no-referrer"
                                />
                                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                    {admin?.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                {avatarUploading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Camera className="h-5 w-5 text-white" />
                                )}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            {/* Online dot */}
                            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold">{admin?.name}</h2>
                                <Badge
                                    variant="outline"
                                    className={`text-xs border-0 ${admin?.role === 'superadmin'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}
                                >
                                    {admin?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                </Badge>
                                {admin?.twoFactorEnabled && (
                                    <Badge variant="outline" className="text-xs border-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
                                        <ShieldCheck className="h-3 w-3" /> 2FA on
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{admin?.email}</span>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="flex items-center gap-4 sm:gap-6 text-center shrink-0">
                            <div>
                                <p className="text-lg font-bold">
                                    {admin?.lastLogin ? format(new Date(admin.lastLogin), 'MMM d') : '—'}
                                </p>
                                <p className="text-xs text-muted-foreground">Last login</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold">
                                    {admin?.createdAt ? format(new Date(admin.createdAt), 'MMM yy') : '—'}
                                </p>
                                <p className="text-xs text-muted-foreground">Member since</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold capitalize">{admin?.role?.replace('admin', '')}</p>
                                <p className="text-xs text-muted-foreground">Role</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left */}
                <div className="space-y-4">
                    {/* Security status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Security status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span>Email verified</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] bg-green-100 text-green-800 border-0 dark:bg-green-900/30 dark:text-green-400">
                                    Done
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center ${admin?.twoFactorEnabled
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : 'bg-amber-100 dark:bg-amber-900/30'
                                        }`}>
                                        {admin?.twoFactorEnabled
                                            ? <ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                            : <ShieldOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                        }
                                    </div>
                                    <span>Two-factor auth</span>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] border-0 ${admin?.twoFactorEnabled
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}
                                >
                                    {admin?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Key className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span>Password</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400">
                                    Set
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions (non-superadmin only) */}
                    {admin?.role !== 'superadmin' && admin?.permissions && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Permissions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {Object.entries(admin.permissions).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground capitalize text-xs">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <div className={`h-1.5 w-1.5 rounded-full ${value ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Superadmin badge */}
                    {admin?.role === 'superadmin' && (
                        <Card className="border-purple-200 dark:border-purple-900/50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Super Admin</p>
                                        <p className="text-xs text-muted-foreground">Full access to all features</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right — tabs */}
                <div className="xl:col-span-2">
                    <Tabs defaultValue="profile">
                        <TabsList className="w-full">
                            <TabsTrigger value="profile" className="flex-1">
                                <User className="h-4 w-4 mr-2" /> Profile
                            </TabsTrigger>
                            <TabsTrigger value="password" className="flex-1">
                                <Key className="h-4 w-4 mr-2" /> Password
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex-1">
                                <Shield className="h-4 w-4 mr-2" /> 2FA
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile tab */}
                        <TabsContent value="profile" className="mt-4">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">Personal information</CardTitle>
                                    <CardDescription>Update your display name and avatar</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleSubmit((d) => profileMutation.mutate(d))}
                                        className="space-y-5"
                                    >
                                        {/* Avatar row */}
                                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/40 border">
                                            <Avatar className="h-14 w-14">
                                                <AvatarImage src={admin?.avatar} referrerPolicy="no-referrer" />
                                                <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                                                    {admin?.name?.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Profile photo</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    JPG, PNG or WebP — max 2MB
                                                </p>
                                            </div>
                                            <label
                                                htmlFor="avatar-upload-tab"
                                                className="cursor-pointer"
                                            >
                                                <Button type="button" variant="outline" size="sm" asChild>
                                                    <span>
                                                        <Camera className="h-3.5 w-3.5 mr-1.5" />
                                                        {avatarUploading ? 'Uploading...' : 'Change'}
                                                    </span>
                                                </Button>
                                            </label>
                                            <input
                                                id="avatar-upload-tab"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full name</Label>
                                            <Input
                                                id="name"
                                                placeholder="Your full name"
                                                {...register('name')}
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-destructive">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Email address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    value={admin?.email || ''}
                                                    disabled
                                                    className="pl-9 opacity-60 cursor-not-allowed"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Email cannot be changed. Contact super admin if needed.
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <p className="text-xs text-muted-foreground">
                                                Last updated: {admin?.updatedAt
                                                    ? format(new Date(admin.updatedAt), 'MMM d, yyyy')
                                                    : '—'
                                                }
                                            </p>
                                            <Button type="submit" disabled={profileMutation.isPending}>
                                                <Save className="h-4 w-4 mr-2" />
                                                {profileMutation.isPending ? 'Saving...' : 'Save changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Password tab */}
                        <TabsContent value="password" className="mt-4">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">Change password</CardTitle>
                                    <CardDescription>
                                        Use a strong unique password to protect your account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChangePasswordSection />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 2FA tab */}
                        <TabsContent value="security" className="mt-4">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">Two-factor authentication</CardTitle>
                                    <CardDescription>
                                        Add an extra layer of security — you'll need your phone to log in
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Setup2FA />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

export default AdminProfile