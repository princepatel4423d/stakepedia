import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
    Plus, Pencil, Trash2, Eye, Archive,
    Star, MoreVertical, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { blogsApi } from '@/api/blogs.api'
import { format } from 'date-fns'

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
        key: 'isFeatured',
        label: 'Featured',
        options: [
            { value: 'true', label: 'Featured' },
            { value: 'false', label: 'Not featured' },
        ],
    },
]

const BlogsList = () => {
    const navigate = useNavigate()
    const qc = useQueryClient()

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({})
    const [deleteId, setDeleteId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-blogs', page, search, filters],
        queryFn: () => blogsApi.getAll({ page, limit: 15, search, ...filters }),
        select: (res) => ({ items: res.data.data, pagination: res.data.pagination }),
    })

    const deleteMutation = useMutation({
        mutationFn: blogsApi.delete,
        onSuccess: () => {
            toast.success('Blog deleted')
            qc.invalidateQueries({ queryKey: ['admin-blogs'] })
            setDeleteId(null)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    })

    const publishMutation = useMutation({
        mutationFn: blogsApi.publish,
        onSuccess: () => {
            toast.success('Blog published')
            qc.invalidateQueries({ queryKey: ['admin-blogs'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish'),
    })

    const archiveMutation = useMutation({
        mutationFn: blogsApi.archive,
        onSuccess: () => {
            toast.success('Blog archived')
            qc.invalidateQueries({ queryKey: ['admin-blogs'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to archive'),
    })

    const featuredMutation = useMutation({
        mutationFn: blogsApi.toggleFeatured,
        onSuccess: () => {
            toast.success('Featured status updated')
            qc.invalidateQueries({ queryKey: ['admin-blogs'] })
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
            label: 'Post',
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
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-55">{row.title}</p>
                        {row.excerpt && (
                            <p className="text-xs text-muted-foreground truncate max-w-55">{row.excerpt}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'author',
            label: 'Author',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={row.author?.avatar} />
                        <AvatarFallback className="text-[10px]">
                            {row.author?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground truncate max-w-25">
                        {row.author?.name}
                    </span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <StatusBadge status={row.status} />
                    {row.isFeatured && (
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    )}
                </div>
            ),
        },
        {
            key: 'categories',
            label: 'Categories',
            render: (row) => {
                const categories = Array.isArray(row.categories) ? row.categories : []
                if (!categories.length) return '—'

                return (
                    <div className="flex flex-wrap gap-1.5 max-w-44">
                        {categories.slice(0, 2).map((category, index) => (
                            <Badge key={`${category}-${index}`} variant="outline" className="text-[10px]">
                                {category}
                            </Badge>
                        ))}
                        {categories.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">+{categories.length - 2}</Badge>
                        )}
                    </div>
                )
            },
        },
        {
            key: 'tags',
            label: 'Tags',
            render: (row) => {
                const tags = Array.isArray(row.tags) ? row.tags : []
                if (!tags.length) return '—'

                return (
                    <div className="flex flex-wrap gap-1.5 max-w-44">
                        {tags.slice(0, 2).map((tag, index) => (
                            <Badge key={`${tag}-${index}`} variant="secondary" className="text-[10px]">
                                {tag}
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
            key: 'stats',
            label: 'Stats',
            render: (row) => (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {row.viewCount?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {row.readTime || 0}m
                    </span>
                </div>
            ),
        },
        {
            key: 'publishedAt',
            label: 'Date',
            render: (row) => (
                <span className="text-xs text-muted-foreground">
                    {row.publishedAt
                        ? format(new Date(row.publishedAt), 'MMM d, yyyy')
                        : format(new Date(row.createdAt), 'MMM d, yyyy')}
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
                        <DropdownMenuItem onClick={() => navigate(`/blogs/${row._id}/edit`)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
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
                        {row.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => archiveMutation.mutate(row._id)}>
                                <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                            </DropdownMenuItem>
                        )}
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
                title="Blog posts"
                description="Write and manage blog content for Stakepedia"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Blogs' },
                ]}
                actions={
                    <Button onClick={() => navigate('/blogs/new')}>
                        <Plus className="h-4 w-4 mr-2" /> New post
                    </Button>
                }
            />

            <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput
                    value={search}
                    onChange={(val) => { setSearch(val); setPage(1) }}
                    placeholder="Search posts..."
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
                title="Delete blog post?"
                description="This will permanently delete the post and all its comments. This cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default BlogsList