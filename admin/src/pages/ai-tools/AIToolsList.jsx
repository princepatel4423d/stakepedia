import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
    Plus, Pencil, Trash2, Eye, Archive, Globe,
    Star, MoreVertical, BadgeCheck,
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
import { aiToolsApi } from '@/api/aitools.api'
import { categoriesApi } from '@/api/categories.api'

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
        key: 'pricing',
        label: 'Pricing',
        options: [
            { value: 'free', label: 'Free' },
            { value: 'freemium', label: 'Freemium' },
            { value: 'paid', label: 'Paid' },
            { value: 'open-source', label: 'Open Source' },
        ],
    },
]

const AIToolsList = () => {
    const navigate = useNavigate()
    const qc = useQueryClient()

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({})
    const [deleteId, setDeleteId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-aitools', page, search, filters],
        queryFn: () => aiToolsApi.getAll({ page, limit: 15, search, ...filters }),
        select: (res) => ({ items: res.data.data, pagination: res.data.pagination }),
    })

    const { data: categoriesData } = useQuery({
        queryKey: ['admin-categories-all'],
        queryFn: () => categoriesApi.getAll({ limit: 100 }),
        select: (res) => {
            const d = res.data.data
            return Array.isArray(d) ? d : (d?.items || [])
        },
    })

    const filtersWithCategories = [
        ...FILTERS,
        {
            key: 'category',
            label: 'Category',
            options: (categoriesData || []).map((c) => ({ value: c._id, label: c.name })),
        },
    ]

    const deleteMutation = useMutation({
        mutationFn: aiToolsApi.delete,
        onSuccess: () => {
            toast.success('AI tool deleted')
            qc.invalidateQueries({ queryKey: ['admin-aitools'] })
            setDeleteId(null)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    })

    const publishMutation = useMutation({
        mutationFn: aiToolsApi.publish,
        onSuccess: () => {
            toast.success('AI tool published')
            qc.invalidateQueries({ queryKey: ['admin-aitools'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish'),
    })

    const archiveMutation = useMutation({
        mutationFn: aiToolsApi.archive,
        onSuccess: () => {
            toast.success('AI tool archived')
            qc.invalidateQueries({ queryKey: ['admin-aitools'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to archive'),
    })

    const featuredMutation = useMutation({
        mutationFn: aiToolsApi.toggleFeatured,
        onSuccess: () => {
            toast.success('Featured status updated')
            qc.invalidateQueries({ queryKey: ['admin-aitools'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(1)
    }

    const handleSearchChange = (val) => {
        setSearch(val)
        setPage(1)
    }

    const columns = [
        {
            key: 'name',
            label: 'Tool',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                            src={row.logo}
                            alt={row.name}
                            referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="rounded-lg text-xs bg-muted">
                            {row.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-medium truncate max-w-45">{row.name}</p>
                            {row.isFeatured && (
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                            {row.isVerified && (
                                <BadgeCheck className="h-3 w-3 text-blue-500 shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-45">
                            {row.shortDescription || row.url}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            render: (row) => {
                const category = row.category
                if (!category) return '—'

                return (
                    <Badge
                        key={category._id || category.name}
                        variant="outline"
                        style={{
                            borderColor: (category.color || '#6366f1') + '40',
                            color: category.color || '#6366f1',
                        }}
                        className="text-xs font-medium"
                    >
                        {category.name || 'Category'}
                    </Badge>
                )
            },
        },
        {
            key: 'pricing',
            label: 'Pricing',
            render: (row) => <StatusBadge status={row.pricing} />,
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
                        <Eye className="h-3 w-3" />
                        {row.viewCount?.toLocaleString() || 0}
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
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => navigate(`/ai-tools/${row._id}/edit`)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={row.url} className='flex items-center justify-center gap-2' target="_blank" rel="noopener noreferrer">
                                <Globe className="h-3.5 w-3.5 mr-2" /> Visit site
                            </a>
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
                        <DropdownMenuItem onClick={() => featuredMutation.mutate(row._id)}>
                            <Star className="h-3.5 w-3.5 mr-2" />
                            {row.isFeatured ? 'Unfeature' : 'Feature'}
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
                title="AI Tools"
                description="Manage and publish AI tools for Stakepedia"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'AI Tools' },
                ]}
                actions={
                    <Button onClick={() => navigate('/ai-tools/new')}>
                        <Plus className="h-4 w-4 mr-2" /> Add tool
                    </Button>
                }
            />

            <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search tools..."
                    className="sm:w-72"
                />
                <FilterBar
                    filters={filtersWithCategories}
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
                title="Delete AI tool?"
                description="This will permanently delete the tool and all its data. This cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default AIToolsList