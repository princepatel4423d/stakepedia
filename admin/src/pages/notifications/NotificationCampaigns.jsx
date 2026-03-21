import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Bell, Plus, Send, Users, Shield, X,
    CheckCircle2, AlertTriangle, Trash2,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { notificationsApi } from '@/api/notifications.api'
import { format } from 'date-fns'

const AUDIENCE_OPTIONS = [
    { value: 'all_users', label: 'All users' },
    { value: 'selected_users', label: 'Selected users' },
    { value: 'all_admins', label: 'All admins' },
    { value: 'selected_admins', label: 'Selected admins' },
]

const NotificationCampaigns = () => {
    const qc = useQueryClient()
    const [audience, setAudience] = useState('all_users')
    const [selectedUserIds, setSelectedUserIds] = useState([])
    const [selectedAdminIds, setSelectedAdminIds] = useState([])
    const [userSearch, setUserSearch] = useState('')
    const [adminSearch, setAdminSearch] = useState('')
    const [result, setResult] = useState(null)

    const { control, register, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: {
            title: '',
            message: '',
            link: '',
            campaignId: '',
            type: 'system',
            userToAdd: '',
            adminToAdd: '',
        },
    })

    const selectedUserToAdd = watch('userToAdd')
    const selectedAdminToAdd = watch('adminToAdd')

    const { data: recipientsData } = useQuery({
        queryKey: ['notification-campaign-recipients'],
        queryFn: () => notificationsApi.getRecipients(),
        select: (res) => res.data.data,
    })

    const { data: recentData, isLoading: recentLoading } = useQuery({
        queryKey: ['my-notifications-recent'],
        queryFn: () => notificationsApi.getAll({ page: 1, limit: 8 }),
        select: (res) => res.data.data,
    })

    const availableUsers = recipientsData?.users || []
    const availableAdmins = recipientsData?.admins || []

    const filteredUsers = useMemo(() => {
        if (!userSearch.trim()) return availableUsers
        const q = userSearch.toLowerCase()
        return availableUsers.filter((u) =>
            (u.name || '').toLowerCase().includes(q)
            || (u.email || '').toLowerCase().includes(q)
        )
    }, [availableUsers, userSearch])

    const filteredAdmins = useMemo(() => {
        if (!adminSearch.trim()) return availableAdmins
        const q = adminSearch.toLowerCase()
        return availableAdmins.filter((a) =>
            (a.name || '').toLowerCase().includes(q)
            || (a.email || '').toLowerCase().includes(q)
        )
    }, [availableAdmins, adminSearch])

    const selectedUsers = availableUsers.filter((u) => selectedUserIds.includes(u._id))
    const selectedAdmins = availableAdmins.filter((a) => selectedAdminIds.includes(a._id))
    const unreadCount = recentData?.unreadCount || 0
    const recentNotifications = recentData?.notifications || []

    const estimatedCount =
        audience === 'selected_users'
            ? selectedUserIds.length
            : audience === 'selected_admins'
                ? selectedAdminIds.length
                : audience === 'all_users'
                    ? (recipientsData?.counts?.users || 0)
                    : (recipientsData?.counts?.admins || 0)

    const isContentReady = !!watch('title') && !!watch('message')
    const isAudienceReady =
        (audience === 'selected_users' && selectedUserIds.length > 0)
        || (audience === 'selected_admins' && selectedAdminIds.length > 0)
        || audience === 'all_users'
        || audience === 'all_admins'

    const markAllReadMutation = useMutation({
        mutationFn: notificationsApi.markAllRead,
        onSuccess: () => {
            toast.success('All notifications marked as read')
            qc.invalidateQueries({ queryKey: ['my-notifications-recent'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const markReadMutation = useMutation({
        mutationFn: notificationsApi.markRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-notifications-recent'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: notificationsApi.delete,
        onSuccess: () => {
            toast.success('Notification deleted')
            qc.invalidateQueries({ queryKey: ['my-notifications-recent'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const sendMutation = useMutation({
        mutationFn: notificationsApi.sendCampaign,
        onSuccess: (res) => {
            setResult(res.data.data)
            toast.success('Notification campaign sent')
            reset({
                title: '',
                message: '',
                link: '',
                campaignId: '',
                type: 'system',
                userToAdd: '',
                adminToAdd: '',
            })
            setSelectedUserIds([])
            setSelectedAdminIds([])
            qc.invalidateQueries({ queryKey: ['my-notifications-recent'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to send notification campaign'),
    })

    const addSelectedUser = () => {
        if (!selectedUserToAdd) return
        if (selectedUserIds.includes(selectedUserToAdd)) {
            toast.error('User already added')
            return
        }
        setSelectedUserIds([...selectedUserIds, selectedUserToAdd])
        setValue('userToAdd', '')
    }

    const addSelectedAdmin = () => {
        if (!selectedAdminToAdd) return
        if (selectedAdminIds.includes(selectedAdminToAdd)) {
            toast.error('Admin already added')
            return
        }
        setSelectedAdminIds([...selectedAdminIds, selectedAdminToAdd])
        setValue('adminToAdd', '')
    }

    const onSubmit = (data) => {
        if (!data.title || !data.message) {
            toast.error('Title and message are required')
            return
        }

        if (audience === 'selected_users' && !selectedUserIds.length) {
            toast.error('Select at least one user')
            return
        }

        if (audience === 'selected_admins' && !selectedAdminIds.length) {
            toast.error('Select at least one admin')
            return
        }

        sendMutation.mutate({
            audience,
            title: data.title,
            message: data.message,
            link: data.link || undefined,
            type: data.type || 'system',
            campaignId: data.campaignId || undefined,
            userIds: selectedUserIds,
            adminIds: selectedAdminIds,
        })
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Notification campaigns"
                description="Send custom in-app notifications to users or admins"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Notifications' },
                ]}
            />

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Active users</p>
                        <p className="text-2xl font-bold mt-1">{recipientsData?.counts?.users || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Active admins</p>
                        <p className="text-2xl font-bold mt-1">{recipientsData?.counts?.admins || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Estimated recipients</p>
                        <p className="text-2xl font-bold mt-1">{estimatedCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Unread notifications</p>
                        <p className="text-2xl font-bold mt-1">{unreadCount}</p>
                    </CardContent>
                </Card>
            </div>

            {result && (
                <Card className="border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10">
                    <CardContent className="p-4 text-sm text-green-700 dark:text-green-400 flex items-center justify-between gap-3">
                        <span className="font-medium">Campaign delivered to {result.total} recipients</span>
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => setResult(null)}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Notification content</CardTitle>
                            <CardDescription>Compose and preview your notification campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input placeholder="New course launch" {...register('title')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Message *</Label>
                                <Textarea rows={7} placeholder="Your notification message..." {...register('message')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Link (optional)</Label>
                                <Input placeholder="/courses" {...register('link')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Campaign ID (optional)</Label>
                                <Input placeholder="e.g. notif-spring-launch" {...register('campaignId')} />
                                <p className="text-xs text-muted-foreground">
                                    Helpful for grouping related notifications later.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select notification type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="system">System</SelectItem>
                                                <SelectItem value="audit_alert">Audit alert</SelectItem>
                                                <SelectItem value="new_review">New review</SelectItem>
                                                <SelectItem value="new_comment">New comment</SelectItem>
                                                <SelectItem value="failed_email">Failed email</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <Separator />

                            <div className="rounded-xl border p-4 bg-muted/20">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Live preview</p>
                                <p className="text-sm font-semibold">{watch('title') || 'Notification title'}</p>
                                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                                    {watch('message') || 'Notification message preview will appear here.'}
                                </p>
                                {watch('link') && (
                                    <p className="text-[11px] mt-2 font-mono text-primary truncate">{watch('link')}</p>
                                )}
                                <div className="mt-2">
                                    <Badge variant="outline" className="text-[10px] capitalize">
                                        {watch('type') || 'system'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bell className="h-4 w-4" /> Audience
                            </CardTitle>
                            <CardDescription>Pick recipient group and refine selections</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                {AUDIENCE_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setAudience(option.value)}
                                        className={`flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${audience === option.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/40'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{option.label}</span>
                                        <span
                                            className={`h-4 w-4 rounded-full border-2 ${audience === option.value
                                                ? 'border-primary bg-primary'
                                                : 'border-muted-foreground'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {(audience === 'selected_users' || audience === 'selected_admins') && (
                                <>
                                    <Separator />
                                    {audience === 'selected_users' && (
                                        <div className="space-y-2">
                                            <Label>Add users</Label>
                                            <Input
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                placeholder="Filter users by name or email"
                                            />
                                            <div className="flex gap-2">
                                                <Controller
                                                    name="userToAdd"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a user" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filteredUsers.map((user) => (
                                                                    <SelectItem key={user._id} value={user._id}>
                                                                        {user.name} ({user.email})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                <Button type="button" variant="outline" size="icon" onClick={addSelectedUser}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {audience === 'selected_admins' && (
                                        <div className="space-y-2">
                                            <Label>Add admins</Label>
                                            <Input
                                                value={adminSearch}
                                                onChange={(e) => setAdminSearch(e.target.value)}
                                                placeholder="Filter admins by name or email"
                                            />
                                            <div className="flex gap-2">
                                                <Controller
                                                    name="adminToAdd"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select an admin" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filteredAdmins.map((admin) => (
                                                                    <SelectItem key={admin._id} value={admin._id}>
                                                                        {admin.name} ({admin.email})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                <Button type="button" variant="outline" size="icon" onClick={addSelectedAdmin}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {audience === 'selected_users' && selectedUsers.length > 0 && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">Selected users</p>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedUserIds([])}>
                                                    Clear all
                                                </Button>
                                            </div>
                                            {selectedUsers.map((user) => (
                                                <div
                                                    key={user._id}
                                                    className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-muted/50 text-sm"
                                                >
                                                    <span className="truncate">{user.name} ({user.email})</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedUserIds(selectedUserIds.filter((id) => id !== user._id))}
                                                        className="ml-2 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {audience === 'selected_admins' && selectedAdmins.length > 0 && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">Selected admins</p>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedAdminIds([])}>
                                                    Clear all
                                                </Button>
                                            </div>
                                            {selectedAdmins.map((admin) => (
                                                <div
                                                    key={admin._id}
                                                    className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-muted/50 text-sm"
                                                >
                                                    <span className="truncate">{admin.name} ({admin.email})</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedAdminIds(selectedAdminIds.filter((id) => id !== admin._id))}
                                                        className="ml-2 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {(audience === 'all_users' || audience === 'all_admins') && (
                                <>
                                    <Separator />
                                    <div className="rounded-lg border p-3 bg-muted/30">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            {audience === 'all_users' ? <Users className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                            {audience === 'all_users' ? 'All active users' : 'All active admins'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Estimated recipients: {audience === 'all_users' ? (recipientsData?.counts?.users || 0) : (recipientsData?.counts?.admins || 0)}
                                        </p>
                                    </div>
                                </>
                            )}

                            <Separator />

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    {isContentReady
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        : <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    }
                                    <span>{isContentReady ? 'Content ready' : 'Title and message are required'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isAudienceReady
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        : <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    }
                                    <span>{isAudienceReady ? 'Audience ready' : 'Select recipients for this audience'}</span>
                                </div>
                            </div>

                            <Separator />

                            <Button
                                className="w-full"
                                disabled={sendMutation.isPending || !isContentReady || !isAudienceReady}
                                onClick={handleSubmit(onSubmit)}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {sendMutation.isPending ? 'Sending...' : 'Send notification campaign'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-base">Recent activity</CardTitle>
                                <CardDescription>Latest notifications for your admin account</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAllReadMutation.mutate()}
                                disabled={markAllReadMutation.isPending || unreadCount === 0}
                            >
                                Mark all read
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {recentLoading ? (
                                <p className="text-sm text-muted-foreground">Loading activity...</p>
                            ) : recentNotifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No notifications yet.</p>
                            ) : (
                                recentNotifications.map((n) => (
                                    <div key={n._id} className="rounded-lg border p-3 space-y-1.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{n.title}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                            </div>
                                            {!n.isRead && (
                                                <Badge variant="outline" className="text-[10px]">Unread</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                <span className="capitalize">{n.type}</span>
                                                <span>•</span>
                                                <span>{n.createdAt ? format(new Date(n.createdAt), 'MMM d, p') : '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!n.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7"
                                                        onClick={() => markReadMutation.mutate(n._id)}
                                                    >
                                                        Read
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => deleteMutation.mutate(n._id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default NotificationCampaigns
