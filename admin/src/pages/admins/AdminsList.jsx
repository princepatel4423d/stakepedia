import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Plus, Pencil, Trash2, Shield, ShieldCheck,
    MoreVertical, KeyRound, UserX, UserCheck,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import SearchInput from '@/components/shared/SearchInput'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { adminsApi } from '@/api/admins.api'
import { format } from 'date-fns'

const PERMISSIONS = [
    { key: 'manageUsers', label: 'Manage users' },
    { key: 'manageAITools', label: 'Manage AI tools' },
    { key: 'manageBlogs', label: 'Manage blogs' },
    { key: 'manageCourses', label: 'Manage courses' },
    { key: 'managePrompts', label: 'Manage prompts' },
    { key: 'manageEmail', label: 'Manage email' },
    { key: 'manageNotifications', label: 'Manage notifications' },
    { key: 'manageModeration', label: 'Manage moderation' },
    { key: 'manageAdmins', label: 'Manage admins' },
    { key: 'manageSettings', label: 'Manage settings' },
    { key: 'viewAnalytics', label: 'View analytics' },
    { key: 'viewAuditLogs', label: 'View audit logs' },
]

const createSchema = z.object({
    name: z.string().min(2, 'Name required'),
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'At least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase and number'),
})

// ── Create admin dialog ───────────────────────────────────────────────────────
const CreateAdminDialog = ({ open, onClose }) => {
    const qc = useQueryClient()

    const defaultPermissions = Object.fromEntries(
        PERMISSIONS.map((p) => [p.key, p.key !== 'manageAdmins' && p.key !== 'manageSettings'])
    )
    const [permissions, setPermissions] = useState(defaultPermissions)

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(createSchema),
    })

    // Reset form and permissions every time dialog opens
    useEffect(() => {
        if (open) {
            reset()
            setPermissions(defaultPermissions)
        }
    }, [open])

    const createMutation = useMutation({
        mutationFn: (data) => adminsApi.create({ ...data, permissions }),
        onSuccess: () => {
            toast.success('Admin created')
            qc.invalidateQueries({ queryKey: ['admin-admins'] })
            onClose()
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Create failed'),
    })

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create admin</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Full name *</Label>
                        <Input placeholder="Admin name" {...register('name')} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input type="email" placeholder="admin@stakepedia.com" {...register('email')} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Password *</Label>
                        <Input type="password" placeholder="••••••••" {...register('password')} />
                        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                    </div>

                    <Separator />

                    <div className="space-y-1">
                        <Label>Permissions</Label>
                        <p className="text-xs text-muted-foreground mb-3">
                            Select what this admin can manage
                        </p>
                        <div className="space-y-3">
                            {PERMISSIONS.map((perm) => (
                                <div key={perm.key} className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{perm.label}</span>
                                    <Switch
                                        checked={!!permissions[perm.key]}
                                        onCheckedChange={(v) =>
                                            setPermissions((prev) => ({ ...prev, [perm.key]: v }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit((d) => createMutation.mutate(d))}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Creating...' : 'Create admin'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ── Edit permissions dialog ───────────────────────────────────────────────────
const PermissionsDialog = ({ open, onClose, admin }) => {
    const qc = useQueryClient()
    const [permissions, setPermissions] = useState(admin?.permissions || {})

    // Sync when admin changes
    useEffect(() => {
        if (admin?.permissions) {
            setPermissions({ ...admin.permissions })
        }
    }, [admin?._id])

    const updateMutation = useMutation({
        mutationFn: () => adminsApi.updatePermissions(admin._id, { permissions }),
        onSuccess: () => {
            toast.success('Permissions updated')
            qc.invalidateQueries({ queryKey: ['admin-admins'] })
            onClose()
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
    })

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit permissions</DialogTitle>
                    <p className="text-sm text-muted-foreground">{admin?.name}</p>
                </DialogHeader>
                <div className="space-y-3">
                    {PERMISSIONS.map((perm) => (
                        <div key={perm.key} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{perm.label}</span>
                            <Switch
                                checked={!!permissions[perm.key]}
                                onCheckedChange={(v) =>
                                    setPermissions((prev) => ({ ...prev, [perm.key]: v }))
                                }
                            />
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Saving...' : 'Save permissions'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminsList = () => {
    const qc = useQueryClient()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [createDialog, setCreateDialog] = useState(false)
    const [permsAdmin, setPermsAdmin] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-admins', page, search],
        queryFn: () => adminsApi.getAll({ page, limit: 20, search }),
        select: (res) => ({ items: res.data.data, pagination: res.data.pagination }),
    })

    const deleteMutation = useMutation({
        mutationFn: adminsApi.delete,
        onSuccess: () => {
            toast.success('Admin deleted')
            qc.invalidateQueries({ queryKey: ['admin-admins'] })
            setDeleteId(null)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    })

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }) => adminsApi.update(id, { isActive }),
        onSuccess: (_, vars) => {
            toast.success(`Admin ${vars.isActive ? 'activated' : 'deactivated'}`)
            qc.invalidateQueries({ queryKey: ['admin-admins'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const columns = [
        {
            key: 'admin',
            label: 'Admin',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.avatar} referrerPolicy="no-referrer" />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {row.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-40">{row.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-40">{row.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    {row.role === 'superadmin'
                        ? <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                        : <Shield className="h-3.5 w-3.5 text-blue-500" />
                    }
                    <StatusBadge status={row.role} />
                </div>
            ),
        },
        {
            key: 'twofa',
            label: '2FA',
            render: (row) => (
                <StatusBadge status={row.twoFactorEnabled ? 'enabled' : 'inactive'} />
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
            ),
        },
        {
            key: 'lastLogin',
            label: 'Last login',
            render: (row) => (
                <span className="text-xs text-muted-foreground">
                    {row.lastLogin
                        ? format(new Date(row.lastLogin), 'MMM d, yyyy')
                        : 'Never'
                    }
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            cellClassName: 'text-right',
            render: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-border/60 bg-muted/30 hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setPermsAdmin(row)}>
                            <KeyRound className="h-3.5 w-3.5 mr-2" /> Edit permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => toggleMutation.mutate({ id: row._id, isActive: !row.isActive })}
                            disabled={toggleMutation.isPending}
                        >
                            {row.isActive
                                ? <><UserX className="h-3.5 w-3.5 mr-2" /> Deactivate</>
                                : <><UserCheck className="h-3.5 w-3.5 mr-2" /> Activate</>
                            }
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(row._id)}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Admins"
                description="Manage admin accounts and their permissions"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admins' },
                ]}
                actions={
                    <Button onClick={() => setCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" /> New admin
                    </Button>
                }
            />

            <SearchInput
                value={search}
                onChange={(val) => { setSearch(val); setPage(1) }}
                placeholder="Search admins..."
                className="sm:w-72"
            />

            <DataTable
                columns={columns}
                isLoading={isLoading}
                data={data?.items || []}
                pagination={data?.pagination}
                onPageChange={setPage}
            />

            <CreateAdminDialog
                open={createDialog}
                onClose={() => setCreateDialog(false)}
            />

            {permsAdmin && (
                <PermissionsDialog
                    open={!!permsAdmin}
                    onClose={() => setPermsAdmin(null)}
                    admin={permsAdmin}
                />
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title="Delete admin?"
                description="This admin account will be permanently deleted."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default AdminsList