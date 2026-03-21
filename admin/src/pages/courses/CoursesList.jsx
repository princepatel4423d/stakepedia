import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
    Plus, Pencil, Trash2, Eye, MoreVertical,
    BookOpen, Users, Star, Clock, List,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import StatusBadge from '@/components/shared/StatusBadge'
import SearchInput from '@/components/shared/SearchInput'
import FilterBar from '@/components/shared/FilterBar'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { coursesApi } from '@/api/courses.api'

const FILTERS = [
    {
        key: 'status',
        label: 'Status',
        options: [
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
            { value: 'archived', label: 'Archived' },
        ],
    },
    {
        key: 'level',
        label: 'Level',
        options: [
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
        ],
    },
    {
        key: 'pricing',
        label: 'Pricing',
        options: [
            { value: 'free', label: 'Free' },
            { value: 'paid', label: 'Paid' },
        ],
    },
]

const CoursesList = () => {
    const navigate = useNavigate()
    const qc = useQueryClient()

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({})
    const [deleteId, setDeleteId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-courses', page, search, filters],
        queryFn: () => coursesApi.getAll({ page, limit: 15, search, ...filters }),
        select: (res) => ({ items: res.data.data, pagination: res.data.pagination }),
    })

    const deleteMutation = useMutation({
        mutationFn: coursesApi.delete,
        onSuccess: () => {
            toast.success('Course deleted')
            qc.invalidateQueries({ queryKey: ['admin-courses'] })
            setDeleteId(null)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    })

    const publishMutation = useMutation({
        mutationFn: coursesApi.publish,
        onSuccess: () => {
            toast.success('Course published')
            qc.invalidateQueries({ queryKey: ['admin-courses'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish'),
    })

    const featuredMutation = useMutation({
        mutationFn: coursesApi.toggleFeatured,
        onSuccess: () => {
            toast.success('Featured status updated')
            qc.invalidateQueries({ queryKey: ['admin-courses'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
    })

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(1)
    }

    const columns = [
        {
            key: 'title',
            label: 'Course',
            render: (row) => (
                <div className="flex items-center gap-3">
                    {row.coverImage ? (
                        <img
                            src={row.coverImage}
                            alt=""
                            className="h-10 w-16 rounded-md object-cover shrink-0 border"
                        />
                    ) : (
                        <div className="h-10 w-16 rounded-md bg-muted shrink-0 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-50">{row.title}</p>
                        <p className="text-xs text-muted-foreground">{row.instructor}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'level',
            label: 'Level',
            render: (row) => <StatusBadge status={row.level} />,
        },
        {
            key: 'category',
            label: 'Category',
            render: (row) => row.category ? (
                <Badge variant="outline" className="text-xs">{row.category}</Badge>
            ) : '—',
        },
        {
            key: 'tags',
            label: 'Tags',
            render: (row) => {
                const tags = Array.isArray(row.tags) ? row.tags : []
                if (!tags.length) return '—'
                return (
                    <div className="flex flex-wrap gap-1.5 max-w-44">
                        {tags.slice(0, 2).map((tag) => (
                            <Badge key={tag._id || tag.name} variant="secondary" className="text-[10px]">
                                {tag.name || tag}
                            </Badge>
                        ))}
                        {tags.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">+{tags.length - 2}</Badge>
                        )}
                    </div>
                )
            },
        },
        {
            key: 'pricing',
            label: 'Pricing',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <StatusBadge status={row.pricing} />
                    {row.pricing === 'paid' && (
                        <span className="text-xs font-medium">${row.price}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'stats',
            label: 'Stats',
            render: (row) => (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <List className="h-3 w-3" />
                        {row.lessons?.length || 0} lessons
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {row.enrollmentCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {row.averageRating?.toFixed(1) || '—'}
                    </span>
                </div>
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
                        <DropdownMenuItem onClick={() => navigate(`/courses/${row._id}/edit`)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit course
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/courses/${row._id}/lessons`)}>
                            <List className="h-3.5 w-3.5 mr-2" /> Manage lessons
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => featuredMutation.mutate(row._id)}>
                            <Star className="h-3.5 w-3.5 mr-2" />
                            {row.isFeatured ? 'Unfeature' : 'Feature'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {row.status !== 'published' && (
                            <DropdownMenuItem onClick={() => publishMutation.mutate(row._id)}>
                                <Eye className="h-3.5 w-3.5 mr-2" /> Publish
                            </DropdownMenuItem>
                        )}
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
                title="Courses"
                description="Create and manage AI learning courses"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Courses' },
                ]}
                actions={
                    <Button onClick={() => navigate('/courses/new')}>
                        <Plus className="h-4 w-4 mr-2" /> New course
                    </Button>
                }
            />

            <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput
                    value={search}
                    onChange={(val) => { setSearch(val); setPage(1) }}
                    placeholder="Search courses..."
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
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete course?"
                description="This will permanently delete the course and all its lessons. This cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default CoursesList