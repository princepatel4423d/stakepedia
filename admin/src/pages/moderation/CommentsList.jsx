import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import StatusBadge from '@/components/shared/StatusBadge'
import { commentsApi } from '@/api/comments.api'
import { formatDistanceToNow } from 'date-fns'

const FILTERS = [
    {
        key: 'isApproved',
        label: 'Status',
        options: [
            { value: 'false', label: 'Pending' },
            { value: 'true', label: 'Approved' },
        ],
    },
]

const CommentsList = () => {
    const qc = useQueryClient()
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({})
    const [deleteId, setDeleteId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-comments', page, filters],
        queryFn: () => commentsApi.getAll({ page, limit: 15, ...filters }),
        select: (res) => ({ items: res.data.data?.comments ?? res.data.data, pagination: res.data.pagination }),
    })

    const approveMutation = useMutation({
        mutationFn: commentsApi.approve,
        onSuccess: () => {
            toast.success('Comment approved')
            qc.invalidateQueries({ queryKey: ['admin-comments'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: commentsApi.delete,
        onSuccess: () => {
            toast.success('Comment deleted')
            qc.invalidateQueries({ queryKey: ['admin-comments'] })
            setDeleteId(null)
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
                <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={row.user?.avatar} />
                        <AvatarFallback className="text-xs">
                            {row.user?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-30">{row.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-30">
                            {row.user?.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'content',
            label: 'Comment',
            render: (row) => (
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-75">
                        {row.content}
                    </p>
                    {row.parentComment && (
                        <Badge variant="outline" className="text-[10px]">Reply</Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'blog',
            label: 'Post',
            render: (row) => (
                <p className="text-sm text-muted-foreground truncate max-w-40">
                    {row.blog?.title || '—'}
                </p>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <StatusBadge status={row.isApproved ? 'approved' : 'pending'} />
            ),
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (row) => (
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            cellClassName: 'text-right',
            render: (row) => (
                <div className="flex items-center justify-end gap-1">
                    {!row.isApproved && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => approveMutation.mutate(row._id)}
                            title="Approve"
                        >
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(row._id)}
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Comments"
                description="Moderate blog comments"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Moderation', href: '/moderation' },
                    { label: 'Comments' },
                ]}
            />

            <FilterBar
                filters={FILTERS}
                values={filters}
                onChange={handleFilterChange}
                onReset={() => { setFilters({}); setPage(1) }}
            />

            <DataTable
                columns={columns}
                data={data?.items || []}
                isLoading={isLoading}
                pagination={data?.pagination}
                onPageChange={setPage}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete comment?"
                description="This comment and all its replies will be permanently deleted."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default CommentsList