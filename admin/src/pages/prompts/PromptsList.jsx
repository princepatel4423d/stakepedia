import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
    Plus, Pencil, Trash2, Eye, Star,
    MoreVertical,
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
import { promptsApi } from '@/api/prompts.api'

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

const PromptsList = () => {
    const navigate = useNavigate()
    const qc = useQueryClient()

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({})
    const [deleteId, setDeleteId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-prompts', page, search, filters],
        queryFn: () => promptsApi.getAll({ page, limit: 15, search, ...filters }),
        select: (res) => ({
            items: res.data.data,
            pagination: res.data.pagination,
        }),
    })

    const deleteMutation = useMutation({
        mutationFn: promptsApi.delete,
        onSuccess: () => {
            toast.success('Prompt deleted')
            qc.invalidateQueries({ queryKey: ['admin-prompts'] })
            setDeleteId(null)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    })

    const publishMutation = useMutation({
        mutationFn: promptsApi.publish,
        onSuccess: () => {
            toast.success('Prompt published')
            qc.invalidateQueries({ queryKey: ['admin-prompts'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const featuredMutation = useMutation({
        mutationFn: promptsApi.toggleFeatured,
        onSuccess: () => {
            toast.success('Featured status updated')
            qc.invalidateQueries({ queryKey: ['admin-prompts'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(1)
    }

    const columns = [
        {
            key: 'title',
            label: 'Prompt',
            render: (row) => (
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate max-w-55">{row.title}</p>
                        {row.isFeatured && (
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                    </div>
                    {row.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-55 mt-0.5">
                            {row.description}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            render: (row) => (
                <Badge variant="outline" className="text-xs capitalize">
                    {row.category}
                </Badge>
            ),
        },
        {
            key: 'tags',
            label: 'Tags',
            render: (row) => {
                const tags = Array.isArray(row.tags) ? row.tags : []
                if (!tags.length) return <span className="text-xs text-muted-foreground">—</span>

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
            key: 'tool',
            label: 'Tool',
            render: (row) => row.tool ? (
                <div className="flex items-center gap-1.5">
                    {row.tool.logo && (
                        <img src={row.tool.logo} alt="" className="h-4 w-4 rounded object-cover" />
                    )}
                    <span className="text-xs text-muted-foreground truncate max-w-25">
                        {row.tool.name}
                    </span>
                </div>
            ) : <span className="text-xs text-muted-foreground">—</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'stats',
            label: 'Usage',
            render: (row) => (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{row.usageCount || 0} uses</span>
                    <span>·</span>
                    <span>{row.likeCount || 0} likes</span>
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
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => navigate(`/prompts/${row._id}/edit`)}>
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
                title="Prompts"
                description="Manage prompt engineering library"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Prompts' },
                ]}
                actions={
                    <Button onClick={() => navigate('/prompts/new')}>
                        <Plus className="h-4 w-4 mr-2" /> New prompt
                    </Button>
                }
            />

            <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput
                    value={search}
                    onChange={(val) => { setSearch(val); setPage(1) }}
                    placeholder="Search prompts..."
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
                title="Delete prompt?"
                description="This prompt will be permanently deleted."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default PromptsList