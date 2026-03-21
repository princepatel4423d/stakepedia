import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
    Eye, Trash2, UserCheck, UserX,
    MoreVertical, Users, Ban, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Card, CardContent,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import SearchInput from '@/components/shared/SearchInput'
import FilterBar from '@/components/shared/FilterBar'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { usersApi } from '@/api/users.api'
import { format } from 'date-fns'

const FILTERS = [
    {
        key: 'isActive',
        label: 'Status',
        options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
        ],
    },
    {
        key: 'authProvider',
        label: 'Auth',
        options: [
            { value: 'local', label: 'Email' },
            { value: 'google', label: 'Google' },
        ],
    },
    {
        key: 'banStatus',
        label: 'Ban',
        options: [
            { value: 'none', label: 'Not banned' },
            { value: 'temporary', label: 'Temporary' },
            { value: 'permanent', label: 'Permanent' },
        ],
    },
]

const UsersList = () => {
    const navigate = useNavigate()
    const qc = useQueryClient()

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({})
    const [deleteId, setDeleteId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, search, filters],
        queryFn: () => usersApi.getAll({ page, limit: 20, search, ...filters }),
        select: (res) => ({ items: res.data.data, pagination: res.data.pagination }),
    })

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['user-stats'],
        queryFn: () => usersApi.getStats(),
        select: (res) => res.data.data,
    })

    const toggleMutation = useMutation({
        mutationFn: usersApi.toggleStatus,
        onSuccess: (res) => {
            toast.success(`User ${res.data.data.isActive ? 'activated' : 'deactivated'}`)
            qc.invalidateQueries({ queryKey: ['admin-users'] })
            qc.invalidateQueries({ queryKey: ['user-stats'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: usersApi.delete,
        onSuccess: () => {
            toast.success('User deleted')
            qc.invalidateQueries({ queryKey: ['admin-users'] })
            setDeleteId(null)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const banMutation = useMutation({
        mutationFn: ({ id, payload }) => usersApi.setBan(id, payload),
        onSuccess: (res) => {
            const status = res.data.data?.banStatus
            toast.success(status === 'none' ? 'User unsuspended' : 'User suspended')
            qc.invalidateQueries({ queryKey: ['admin-users'] })
            qc.invalidateQueries({ queryKey: ['user-stats'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(1)
    }

    const columns = [
        {
            key: 'user',
            label: 'User',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.avatar} />
                        <AvatarFallback className="text-xs">
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
            key: 'auth',
            label: 'Auth',
            render: (row) => (
                <Badge
                    variant="outline"
                    className={`text-xs capitalize ${row.authProvider === 'google'
                            ? 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-700 border-0 dark:bg-gray-800 dark:text-gray-100'
                        }`}
                >
                    {row.authProvider}
                </Badge>
            ),
        },
        {
            key: 'verified',
            label: 'Email',
            render: (row) => (
                <StatusBadge status={row.isEmailVerified ? 'verified' : 'pending'} />
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
            key: 'banStatus',
            label: 'Ban',
            render: (row) => (
                row.banStatus && row.banStatus !== 'none'
                    ? <StatusBadge status={row.banStatus === 'temporary' ? 'pending' : 'inactive'} />
                    : <StatusBadge status="active" />
            ),
        },
        {
            key: 'joined',
            label: 'Joined',
            render: (row) => (
                <span className="text-xs text-muted-foreground">
                    {format(new Date(row.createdAt), 'MMM d, yyyy')}
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
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => navigate(`/users/${row._id}`)}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleMutation.mutate(row._id)}>
                            {row.isActive
                                ? <><UserX className="h-3.5 w-3.5 mr-2" /> Deactivate</>
                                : <><UserCheck className="h-3.5 w-3.5 mr-2" /> Activate</>
                            }
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => banMutation.mutate({
                                id: row._id,
                                payload: row.banStatus && row.banStatus !== 'none'
                                    ? { banStatus: 'none' }
                                    : { banStatus: 'permanent', banReason: 'Suspended by admin' },
                            })}
                            disabled={banMutation.isPending}
                        >
                            {row.banStatus && row.banStatus !== 'none'
                                ? <><ShieldCheck className="h-3.5 w-3.5 mr-2" /> Unsuspend</>
                                : <><Ban className="h-3.5 w-3.5 mr-2" /> Suspend</>
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
                title="Users"
                description="Manage registered users"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Users' },
                ]}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {statsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))
                ) : (
                    <>
                        <Card><CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold mt-0.5">{stats.total || 0}</p>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Active</p>
                            <p className="text-2xl font-bold mt-0.5 text-green-600 dark:text-green-400">
                                {stats.active || 0}
                            </p>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">New (30d)</p>
                            <p className="text-2xl font-bold mt-0.5">{stats.newLast30Days || 0}</p>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Google OAuth</p>
                            <p className="text-2xl font-bold mt-0.5">{stats.googleOAuth || 0}</p>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Suspended</p>
                            <p className="text-2xl font-bold mt-0.5 text-amber-600 dark:text-amber-400">
                                {stats.banned || 0}
                            </p>
                        </CardContent></Card>
                    </>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput
                    value={search}
                    onChange={(val) => { setSearch(val); setPage(1) }}
                    placeholder="Search by name or email..."
                    className="sm:w-72"
                />
                <FilterBar
                    filters={FILTERS}
                    values={filters}
                    onChange={handleFilterChange}
                    onReset={() => { setFilters({}); setPage(1) }}
                />
            </div>

            <DataTable
                columns={columns}
                data={data?.items || []}
                isLoading={isLoading}
                pagination={data?.pagination}
                onPageChange={setPage}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title="Delete user?"
                description="This will permanently delete the user account and all their data."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default UsersList