import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
    Plus, Pencil, Trash2, Eye, Send,
    Mail, MoreVertical, Lock, List,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import PageHeader from '@/components/shared/PageHeader'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import { emailApi } from '@/api/email.api'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

const stripHtml = (html = '') =>
    html
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

// Template form dialog
const TemplateDialog = ({ open, onClose, template }) => {
    const qc = useQueryClient()
    const isEdit = !!template

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            subject: '',
            htmlBody: '',
            category: 'marketing',
        },
    })

    useEffect(() => {
        reset({
            name:     template?.name     || '',
            subject:  template?.subject  || '',
            htmlBody: template?.htmlBody || '',
            category: template?.category || 'marketing',
        })
    }, [open, template, reset])

    const saveMutation = useMutation({
        mutationFn: (data) =>
            isEdit
                ? emailApi.updateTemplate(template._id, data)
                : emailApi.createTemplate(data),
        onSuccess: () => {
            toast.success(isEdit ? 'Template updated' : 'Template created')
            qc.invalidateQueries({ queryKey: ['email-templates'] })
            if (template?._id) {
                qc.invalidateQueries({ queryKey: ['template-preview', template._id] })
            }
            onClose()
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
    })

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit template' : 'New email template'}</DialogTitle>
                </DialogHeader>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label>Template name *</Label>
                        <Input placeholder="e.g. Product Launch April" {...register('name', { required: true })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Subject line *</Label>
                            <Input
                                placeholder="Welcome to Stakepedia, {{name}}!"
                                {...register('subject', { required: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={watch('category')}
                                onValueChange={(v) => setValue('category', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="notification">Notification</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>HTML body *</Label>
                            <span className="text-xs text-muted-foreground">
                                Use {'{{variable}}'} for dynamic content
                            </span>
                        </div>
                        <Textarea
                            placeholder="<!DOCTYPE html>..."
                            rows={12}
                            className="font-mono text-xs"
                            {...register('htmlBody', { required: true })}
                        />
                    </div>
                </form>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit((d) => saveMutation.mutate(d))}
                        disabled={saveMutation.isPending}
                    >
                        {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Preview dialog
const PreviewDialog = ({ open, onClose, templateId }) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['template-preview', templateId],
        queryFn: () => emailApi.previewTemplate(templateId),
        select: (res) => res.data.data,
        enabled: open && !!templateId,
    })

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Template preview</DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : isError ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        {error?.response?.data?.message || 'Preview failed. Please check template variables and Handlebars syntax.'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-muted/50 text-sm">
                            <span className="font-medium">Subject: </span>
                            {data?.subject}
                        </div>
                        <div
                            className="rounded-lg border p-4 text-sm"
                            dangerouslySetInnerHTML={{ __html: data?.html || '' }}
                        />
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Send test dialog
const SendTestDialog = ({ open, onClose, templateId }) => {
    const [email, setEmail] = useState('')

    const sendMutation = useMutation({
        mutationFn: () => emailApi.sendTest(templateId, { to: email }),
        onSuccess: () => {
            toast.success(`Test email sent to ${email}`)
            onClose()
            setEmail('')
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Send failed'),
    })

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Send test email</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Recipient email</Label>
                        <Input
                            type="email"
                            placeholder="test@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => sendMutation.mutate()}
                        disabled={!email || sendMutation.isPending}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {sendMutation.isPending ? 'Sending...' : 'Send test'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const EmailTemplates = () => {
    const navigate = useNavigate()
    const qc = useQueryClient()
    const [formDialog, setFormDialog] = useState(false)
    const [editTemplate, setEditTemplate] = useState(null)
    const [previewId, setPreviewId] = useState(null)
    const [sendTestId, setSendTestId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const { data: templates, isLoading } = useQuery({
        queryKey: ['email-templates'],
        queryFn: () => emailApi.getTemplates(),
        select: (res) => res.data.data,
    })

    const deleteMutation = useMutation({
        mutationFn: emailApi.deleteTemplate,
        onSuccess: () => {
            toast.success('Template deleted')
            qc.invalidateQueries({ queryKey: ['email-templates'] })
            setDeleteId(null)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    })

    const openEdit = (tmpl) => {
        setEditTemplate(tmpl)
        setFormDialog(true)
    }

    const closeForm = () => {
        setFormDialog(false)
        setEditTemplate(null)
    }

    const CATEGORY_COLORS = {
        transactional: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        marketing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        notification: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Email templates"
                description="Manage custom marketing and launch email templates"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Email', href: '/email/templates' },
                    { label: 'Templates' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate('/email/campaigns')}>
                            <Send className="h-4 w-4 mr-2" /> Campaigns
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/email/logs')}>
                            <List className="h-4 w-4 mr-2" /> Logs
                        </Button>
                        <Button onClick={() => setFormDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" /> New template
                        </Button>
                    </div>
                }
            />

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                    ))}
                </div>
            ) : !templates?.length ? (
                <EmptyState
                    icon={Mail}
                    title="No email templates"
                    description="Create your first email template to get started"
                    action={
                        <Button onClick={() => setFormDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" /> New template
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {templates.map((tmpl) => (
                        <Card key={tmpl._id} className="group relative">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <CardTitle className="text-sm font-semibold truncate">
                                                {tmpl.name}
                                            </CardTitle>
                                            {tmpl.isSystem && (
                                                <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-md border border-border/60 bg-muted/30 hover:bg-muted">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem onClick={() => setPreviewId(tmpl._id)}>
                                                <Eye className="h-3.5 w-3.5 mr-2" /> Preview
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSendTestId(tmpl._id)}>
                                                <Send className="h-3.5 w-3.5 mr-2" /> Send test
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => openEdit(tmpl)}>
                                                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            {!tmpl.isSystem && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setDeleteId(tmpl._id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4 space-y-3">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium line-clamp-2">
                                        Subject: {tmpl.subject}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {stripHtml(tmpl.htmlBody) || 'No preview available'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] border-0 capitalize ${CATEGORY_COLORS[tmpl.category]}`}
                                    >
                                        {tmpl.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                        {tmpl.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                        {tmpl.isSystem ? 'System' : 'Custom'}
                                    </Badge>
                                    {!!tmpl.variables?.length && (
                                        <Badge variant="outline" className="text-[10px]">
                                            {tmpl.variables.length} vars
                                        </Badge>
                                    )}
                                </div>

                                {!!tmpl.variables?.length && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {tmpl.variables.slice(0, 3).map((v, idx) => (
                                            <Badge key={`${tmpl._id}-var-${idx}`} variant="outline" className="text-[10px] font-mono">
                                                {(v?.name || v)?.toString()}
                                            </Badge>
                                        ))}
                                        {tmpl.variables.length > 3 && (
                                            <Badge variant="outline" className="text-[10px]">
                                                +{tmpl.variables.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div className="pt-2 border-t text-[11px] text-muted-foreground space-y-1">
                                    <p>
                                        Created: {tmpl.createdAt ? format(new Date(tmpl.createdAt), 'MMM d, yyyy, p') : '—'}
                                    </p>
                                    <p>
                                        Updated: {tmpl.updatedAt ? format(new Date(tmpl.updatedAt), 'MMM d, yyyy, p') : '—'}
                                    </p>
                                    <p className="truncate">
                                        By: {tmpl.createdBy?.name || tmpl.createdBy?.email || 'System'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <TemplateDialog
                open={formDialog}
                onClose={closeForm}
                template={editTemplate}
            />
            <PreviewDialog
                open={!!previewId}
                onClose={() => setPreviewId(null)}
                templateId={previewId}
            />
            <SendTestDialog
                open={!!sendTestId}
                onClose={() => setSendTestId(null)}
                templateId={sendTestId}
            />
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title="Delete template?"
                description="This email template will be permanently deleted."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default EmailTemplates