import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import StatusBadge from '@/components/shared/StatusBadge'
import { reviewsApi } from '@/api/reviews.api'
import { formatDistanceToNow } from 'date-fns'

const FILTERS = [
    {
        key: 'targetType',
        label: 'Type',
        options: [
            { value: 'AITool', label: 'AI Tools' },
            { value: 'Course', label: 'Courses' },
            { value: 'Blog', label: 'Blogs' },
            { value: 'Prompt', label: 'Prompts' },
        ],
    },
    {
        key: 'isApproved',
        label: 'Status',
        options: [
            { value: 'false', label: 'Pending' },
            { value: 'true', label: 'Approved' },
        ],
    },
    {
        key: 'rating',
        label: 'Rating',
        options: [5, 4, 3, 2, 1].map((r) => ({ value: String(r), label: `${r} stars` })),
    },
]

const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
            />
        ))}
    </div>
)

const ReviewsList = () => {
    const qc = useQueryClient()
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({})
    const [deleteId, setDeleteId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-reviews', page, filters],
        queryFn: () => reviewsApi.getAll({ page, limit: 15, ...filters }),
        select: (res) => ({ items: res.data.data?.reviews ?? res.data.data, pagination: res.data.pagination }),
    })

    const approveMutation = useMutation({
        mutationFn: reviewsApi.approve,
        onSuccess: () => {
            toast.success('Review approved')
            qc.invalidateQueries({ queryKey: ['admin-reviews'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const rejectMutation = useMutation({
        mutationFn: reviewsApi.reject,
        onSuccess: () => {
            toast.success('Review rejected')
            qc.invalidateQueries({ queryKey: ['admin-reviews'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: reviewsApi.delete,
        onSuccess: () => {
            toast.success('Review deleted')
            qc.invalidateQueries({ queryKey: ['admin-reviews'] })
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
                        <p className="text-xs text-muted-foreground truncate max-w-30">{row.user?.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (row) => (
                <div className="space-y-0.5">
                    <StarRating rating={row.rating} />
                    {row.title && (
                        <p className="text-xs font-medium">{row.title}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'content',
            label: 'Review',
            render: (row) => (
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-65">
                    {row.content}
                </p>
            ),
        },
        {
            key: 'targetType',
            label: 'Type',
            render: (row) => (
                <Badge variant="outline" className="text-xs capitalize">
                    {row.targetType}
                </Badge>
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
                    {row.isApproved && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            onClick={() => rejectMutation.mutate(row._id)}
                            title="Reject"
                        >
                            <XCircle className="h-4 w-4" />
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
                title="Reviews"
                description="Moderate user reviews across all content"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Moderation', href: '/moderation' },
                    { label: 'Reviews' },
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
                title="Delete review?"
                description="This review will be permanently removed and ratings will be recalculated."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default ReviewsList