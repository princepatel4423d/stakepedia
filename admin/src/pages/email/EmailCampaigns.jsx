import { useMemo, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
    Send, Users, FileText, Plus, X, Shield, List,
    LayoutTemplate, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import PageHeader from '@/components/shared/PageHeader'
import { emailApi } from '@/api/email.api'

const AUDIENCE_OPTIONS = [
    { value: 'all_users', label: 'All verified users' },
    { value: 'selected_users', label: 'Selected users' },
    { value: 'all_admins', label: 'All admins' },
    { value: 'selected_admins', label: 'Selected admins' },
    { value: 'custom_emails', label: 'Custom email list' },
]

const EmailCampaigns = () => {
    const navigate = useNavigate()
    const [recipients, setRecipients] = useState([])
    const [selectedUserIds, setSelectedUserIds] = useState([])
    const [selectedAdminIds, setSelectedAdminIds] = useState([])
    const [emailInput, setEmailInput] = useState('')
    const [userSearch, setUserSearch] = useState('')
    const [adminSearch, setAdminSearch] = useState('')
    const [audience, setAudience] = useState('all_users')
    const [sendMode, setSendMode] = useState('template') // template | custom
    const [result, setResult] = useState(null)

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
    } = useForm({
        defaultValues: {
            subject: '',
            html: '',
            templateId: '',
            campaignId: '',
            userToAdd: '',
            adminToAdd: '',
        },
    })

    const { data: templates } = useQuery({
        queryKey: ['email-templates'],
        queryFn: () => emailApi.getTemplates(),
        select: (res) => res.data.data,
    })

    const { data: recipientsData } = useQuery({
        queryKey: ['email-campaign-recipients'],
        queryFn: () => emailApi.getRecipients(),
        select: (res) => res.data.data,
    })

    const selectedUserToAdd = watch('userToAdd')
    const selectedAdminToAdd = watch('adminToAdd')

    const availableUsers = recipientsData?.users || []
    const availableAdmins = recipientsData?.admins || []
    const templatesList = templates || []

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
    const selectedTemplate = templatesList.find((t) => t._id === watch('templateId'))
    const estimatedCount =
        audience === 'custom_emails'
            ? recipients.length
            : audience === 'selected_users'
                ? selectedUserIds.length
                : audience === 'selected_admins'
                    ? selectedAdminIds.length
                    : audience === 'all_users'
                        ? (recipientsData?.counts?.users || 0)
                        : (recipientsData?.counts?.admins || 0)

    const isContentReady = sendMode === 'template'
        ? !!watch('templateId')
        : !!watch('subject') && !!watch('html')
    const isAudienceReady =
        (audience === 'selected_users' && selectedUserIds.length > 0)
        || (audience === 'selected_admins' && selectedAdminIds.length > 0)
        || (audience === 'custom_emails' && recipients.length > 0)
        || audience === 'all_users'
        || audience === 'all_admins'

    const selectedAudienceLabel = AUDIENCE_OPTIONS.find((option) => option.value === audience)?.label || 'selected audience'

    const sendMutation = useMutation({
        mutationFn: emailApi.sendCampaign,
        onSuccess: (res) => {
            setResult(res.data.data)
            toast.success(`Campaign sent — ${res.data.data.sent} delivered`)
            reset({
                subject: '',
                html: '',
                templateId: '',
                campaignId: '',
                userToAdd: '',
                adminToAdd: '',
            })
            setRecipients([])
            setSelectedUserIds([])
            setSelectedAdminIds([])
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Campaign failed'),
    })

    const addEmail = () => {
        const trimmed = emailInput.trim().toLowerCase()
        if (!trimmed) return
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        if (!valid) { toast.error('Invalid email address'); return }
        if (recipients.includes(trimmed)) { toast.error('Already added'); return }
        setRecipients([...recipients, trimmed])
        setEmailInput('')
    }

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
        if (sendMode === 'template' && !data.templateId) {
            toast.error('Select an email template')
            return
        }

        if (sendMode === 'custom' && (!data.subject || !data.html)) {
            toast.error('Subject and HTML body are required for custom email')
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

        if (audience === 'custom_emails' && !recipients.length) {
            toast.error('Add at least one recipient')
            return
        }

        const payload = {
            audience,
            recipients,
            userIds: selectedUserIds,
            adminIds: selectedAdminIds,
            campaignId: data.campaignId || `campaign_${Date.now()}`,
            ...(sendMode === 'template'
                ? { templateId: data.templateId }
                : { subject: data.subject, html: data.html }
            ),
        }
        sendMutation.mutate(payload)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Email campaigns"
                description="Send bulk emails to users or custom recipient lists"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Email', href: '/email/templates' },
                    { label: 'Campaigns' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate('/email/templates')}>
                            <LayoutTemplate className="h-4 w-4 mr-2" /> Templates
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/email/logs')}>
                            <List className="h-4 w-4 mr-2" /> Logs
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Templates</p>
                        <p className="text-2xl font-bold mt-1">{templatesList.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Verified users</p>
                        <p className="text-2xl font-bold mt-1">{recipientsData?.counts?.users || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Admins</p>
                        <p className="text-2xl font-bold mt-1">{recipientsData?.counts?.admins || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Estimated send size</p>
                        <p className="text-2xl font-bold mt-1">{estimatedCount}</p>
                    </CardContent>
                </Card>
            </div>

            {result && (
                <Card className="border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                                <Send className="h-4 w-4" />
                                Campaign sent
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                {result.sent} delivered
                            </Badge>
                            {result.failed > 0 && (
                                <Badge className="bg-red-100 text-red-800 border-0">
                                    {result.failed} failed
                                </Badge>
                            )}
                            <button
                                className="ml-auto text-muted-foreground hover:text-foreground"
                                onClick={() => setResult(null)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Campaign builder */}
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Campaign content</CardTitle>
                            <CardDescription>Choose template or custom content for this campaign</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={sendMode} onValueChange={setSendMode}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="template">
                                        <FileText className="h-4 w-4 mr-2" /> Use template
                                    </TabsTrigger>
                                    <TabsTrigger value="custom">
                                        <Send className="h-4 w-4 mr-2" /> Custom email
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="template" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Email template</Label>
                                        <Controller
                                            name="templateId"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a template" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {templatesList.map((t) => (
                                                            <SelectItem key={t._id} value={t._id}>
                                                                {t.name} — {t.subject}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    {selectedTemplate && (
                                        <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                                            <p className="text-sm font-medium">Selected template: {selectedTemplate.name}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                Subject: {selectedTemplate.subject}
                                            </p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="text-[10px] capitalize">
                                                    {selectedTemplate.category}
                                                </Badge>
                                                {!!selectedTemplate.variables?.length && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {selectedTemplate.variables.length} variables
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="custom" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Subject line *</Label>
                                        <Input placeholder="Your email subject" {...register('subject')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>HTML body *</Label>
                                        <Textarea
                                            placeholder="<h1>Hello!</h1><p>Your message here...</p>"
                                            rows={10}
                                            className="font-mono text-xs"
                                            {...register('html')}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <Label>Campaign ID (optional)</Label>
                                <Input
                                    placeholder="e.g. summer-2025-launch"
                                    {...register('campaignId')}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Used to group emails in logs. Auto-generated if left blank.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recipients */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" /> Recipients
                            </CardTitle>
                            <CardDescription>Choose who should receive this campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* All users option */}
                            <div
                                className="space-y-2"
                            >
                                <Label>Audience</Label>
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
                            </div>

                            {(audience === 'selected_users' || audience === 'selected_admins' || audience === 'custom_emails') && (
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

                                    {audience === 'custom_emails' && (
                                        <div className="space-y-2">
                                            <Label>Add email addresses</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={emailInput}
                                                    onChange={(e) => setEmailInput(e.target.value)}
                                                    placeholder="user@example.com"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            addEmail()
                                                        }
                                                    }}
                                                />
                                                <Button type="button" variant="outline" size="icon" onClick={addEmail}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {audience === 'custom_emails' && recipients.length > 0 && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">Custom recipients</p>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setRecipients([])}>
                                                    Clear all
                                                </Button>
                                            </div>
                                            {recipients.map((email) => (
                                                <div
                                                    key={email}
                                                    className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-muted/50 text-sm"
                                                >
                                                    <span className="truncate">{email}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecipients(recipients.filter((e) => e !== email))}
                                                        className="ml-2 text-muted-foreground hover:text-destructive shrink-0"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
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
                                                        className="ml-2 text-muted-foreground hover:text-destructive shrink-0"
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
                                                        className="ml-2 text-muted-foreground hover:text-destructive shrink-0"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        {audience === 'custom_emails' && `${recipients.length} custom recipient${recipients.length !== 1 ? 's' : ''} added`}
                                        {audience === 'selected_users' && `${selectedUserIds.length} user${selectedUserIds.length !== 1 ? 's' : ''} selected`}
                                        {audience === 'selected_admins' && `${selectedAdminIds.length} admin${selectedAdminIds.length !== 1 ? 's' : ''} selected`}
                                    </p>
                                </>
                            )}

                            {(audience === 'all_users' || audience === 'all_admins') && (
                                <>
                                    <Separator />
                                    <div className="rounded-lg border p-3 bg-muted/30">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            {audience === 'all_users' ? <Users className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                            {audience === 'all_users' ? 'All verified users will receive this email.' : 'All active admins will receive this email.'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Estimated recipients: {audience === 'all_users' ? (recipientsData?.counts?.users || 0) : (recipientsData?.counts?.admins || 0)}
                                        </p>
                                    </div>
                                </>
                            )}

                            <Separator />

                            <Button
                                className="w-full"
                                onClick={handleSubmit(onSubmit)}
                                disabled={sendMutation.isPending || !isContentReady || !isAudienceReady}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {sendMutation.isPending
                                    ? 'Sending...'
                                    : `Send to ${selectedAudienceLabel.toLowerCase()}`
                                }
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Send summary</CardTitle>
                            <CardDescription>Final checks before dispatch</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Mode</span>
                                <Badge variant="outline">{sendMode === 'template' ? 'Template' : 'Custom'}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Audience</span>
                                <span className="font-medium text-right">{selectedAudienceLabel}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Estimated recipients</span>
                                <span className="font-semibold">{estimatedCount}</span>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    {isContentReady
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        : <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    }
                                    <span>{isContentReady ? 'Content ready' : 'Missing content (template or subject/body)'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isAudienceReady
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        : <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    }
                                    <span>{isAudienceReady ? 'Audience ready' : 'Select recipients for current audience'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default EmailCampaigns