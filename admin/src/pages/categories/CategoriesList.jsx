import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, FolderOpen, CheckCircle2, CircleOff, Boxes } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/shared/PageHeader'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import SearchInput from '@/components/shared/SearchInput'
import FilterBar from '@/components/shared/FilterBar'
import { categoriesApi } from '@/api/categories.api'

const schema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    description: z.string().max(300).optional().or(z.literal('')),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional().or(z.literal('')),
    icon: z.string().optional().or(z.literal('')),
    metaTitle: z.string().max(70).optional().or(z.literal('')),
    metaDescription: z.string().max(160).optional().or(z.literal('')),
    metaKeywords: z.string().optional().or(z.literal('')),
})

const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#64748b',
]

const FILTERS = [
    {
        key: 'isActive',
        label: 'Status',
        options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
        ],
    },
]

const MetricCard = ({ label, value, hint, icon: Icon, accent }) => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold leading-none mt-1">{value}</p>
                    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
                </div>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </CardContent>
    </Card>
)

// Category form dialog
const CategoryDialog = ({ open, onClose, category }) => {
    const qc = useQueryClient()
    const isEdit = !!category

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: category?.name || '',
            description: category?.description || '',
            color: category?.color || '#6366f1',
            icon: category?.icon || '',
            metaTitle: category?.meta?.title || '',
            metaDescription: category?.meta?.description || '',
            metaKeywords: (category?.meta?.keywords || []).join(', '),
        },
    })

    const watchedColor = watch('color', category?.color || '#6366f1')

    // Reset form whenever a different category is loaded into the dialog
    useEffect(() => {
        if (open) {
            reset({
                name: category?.name || '',
                description: category?.description || '',
                color: category?.color || '#6366f1',
                icon: category?.icon || '',
                metaTitle: category?.meta?.title || '',
                metaDescription: category?.meta?.description || '',
                metaKeywords: (category?.meta?.keywords || []).join(', '),
            })
        }
    }, [open, category, reset])

    const saveMutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                name: data.name,
                description: data.description || null,
                color: data.color || '#6366f1',
                icon: data.icon || null,
                meta: {
                    title: data.metaTitle || null,
                    description: data.metaDescription || null,
                    keywords: (data.metaKeywords || '')
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean),
                },
            }

            return isEdit
                ? categoriesApi.update(category._id, payload)
                : categoriesApi.create(payload)
        },
        onSuccess: () => {
            toast.success(isEdit ? 'Category updated' : 'Category created')
            qc.invalidateQueries({ queryKey: ['admin-categories'] })
            qc.invalidateQueries({ queryKey: ['admin-categories-all'] })
            onClose()
            reset()
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
    })

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
                </DialogHeader>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input placeholder="e.g. Image Generation" {...register('name')} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input placeholder="Short description" {...register('description')} />
                    </div>

                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setValue('color', c)}
                                    className="h-6 w-6 rounded-full border-2 transition-all"
                                    style={{
                                        backgroundColor: c,
                                        borderColor: watchedColor === c ? '#000' : 'transparent',
                                        transform: watchedColor === c ? 'scale(1.2)' : 'scale(1)',
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-9 w-9 rounded-md border shrink-0"
                                style={{ backgroundColor: watchedColor }}
                            />
                            <Input
                                placeholder="#6366f1"
                                maxLength={7}
                                {...register('color')}
                            />
                        </div>
                        {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Icon</Label>
                        <Input placeholder="e.g. image, code, bot" {...register('icon')} />
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                        <Label>SEO title</Label>
                        <Input placeholder="Category page title" {...register('metaTitle')} />
                    </div>

                    <div className="space-y-2">
                        <Label>SEO description</Label>
                        <Input placeholder="Category page description" {...register('metaDescription')} />
                    </div>

                    <div className="space-y-2">
                        <Label>SEO keywords</Label>
                        <Input placeholder="ai, automation, productivity" {...register('metaKeywords')} />
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

const CategoriesList = () => {
    const qc = useQueryClient()
    const [formOpen, setFormOpen] = useState(false)
    const [editCat, setEditCat] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({})

    const { data, isLoading } = useQuery({
        queryKey: ['admin-categories', search, filters],
        queryFn: () => categoriesApi.getAll({ limit: 100, search, ...filters }),
        select: (res) => {
            const d = res.data.data
            return Array.isArray(d) ? d : (d?.items || [])
        },
    })

    const handleSearchChange = (value) => {
        setSearch(value)
    }

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const deleteMutation = useMutation({
        mutationFn: categoriesApi.delete,
        onSuccess: () => {
            toast.success('Category deleted')
            qc.invalidateQueries({ queryKey: ['admin-categories'] })
            qc.invalidateQueries({ queryKey: ['admin-categories-all'] })
            setDeleteId(null)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    })

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }) => categoriesApi.update(id, { isActive }),
        onSuccess: () => {
            toast.success('Category updated')
            qc.invalidateQueries({ queryKey: ['admin-categories'] })
            qc.invalidateQueries({ queryKey: ['admin-categories-all'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const openEdit = (cat) => {
        setEditCat(cat)
        setFormOpen(true)
    }

    const closeForm = () => {
        setFormOpen(false)
        setEditCat(null)
    }

    const categories = data || []
    const filteredCategories = categories
        .filter((c) => {
            if (!search) return true
            const q = search.toLowerCase()
            return (c.name || '').toLowerCase().includes(q)
                || (c.slug || '').toLowerCase().includes(q)
                || (c.description || '').toLowerCase().includes(q)
        })
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    const activeCount = categories.filter((c) => c.isActive).length
    const inactiveCount = categories.length - activeCount
    const totalTools = categories.reduce((sum, c) => sum + (c.toolCount || 0), 0)
    const topCategory = [...categories].sort((a, b) => (b.toolCount || 0) - (a.toolCount || 0))[0]

    return (
        <div className="space-y-5">
            <PageHeader
                title="Categories"
                description="Organize AI tools with clean, searchable category structure"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Categories' },
                ]}
                actions={
                    <Button onClick={() => setFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> New category
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <MetricCard
                    label="Total Categories"
                    value={categories.length}
                    hint="Registered categories"
                    icon={FolderOpen}
                    accent="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                />
                <MetricCard
                    label="Active"
                    value={activeCount}
                    hint="Visible on site"
                    icon={CheckCircle2}
                    accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                />
                <MetricCard
                    label="Total Tools"
                    value={totalTools}
                    hint={topCategory ? `Top: ${topCategory.name}` : 'No linked tools yet'}
                    icon={Boxes}
                    accent="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                />
                <MetricCard
                    label="Inactive"
                    value={inactiveCount}
                    hint="Hidden categories"
                    icon={CircleOff}
                    accent="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                />
            </div>

            <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:items-center sm:justify-between">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search categories..."
                            className="w-full sm:w-72"
                        />
                        <FilterBar
                            filters={FILTERS}
                            values={filters}
                            onChange={handleFilterChange}
                            onReset={() => setFilters({})}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Showing {filteredCategories.length}
                    </div>
                </div>
            </CardContent>

            {/* List */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">All categories</CardTitle>
                    <CardDescription>
                        Card view with fixed action controls and full space utilization
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-40 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <EmptyState
                            icon={FolderOpen}
                            title={search ? 'No categories found' : 'No categories yet'}
                            description={search ? 'Try a different search term' : 'Create your first category to start organising AI tools'}
                            action={
                                !search && (
                                    <Button onClick={() => setFormOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" /> New category
                                    </Button>
                                )
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredCategories.map((cat) => (
                                <Card key={cat._id} className="border-border/70">
                                    <CardContent className="p-3 min-h-40 flex flex-col gap-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <div
                                                    className="h-9 w-9 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-xs"
                                                    style={{ backgroundColor: cat.color || '#6366f1' }}
                                                >
                                                    {cat.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate">{cat.name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">
                                            {cat.description || 'No description added'}
                                        </p>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <Badge variant="outline" className="text-[10px]">{cat.toolCount || 0} tools</Badge>
                                            {!cat.isActive && (
                                                <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-2 border-t space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs text-muted-foreground">Status</span>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={cat.isActive}
                                                        onCheckedChange={(v) =>
                                                            toggleMutation.mutate({ id: cat._id, isActive: v })
                                                        }
                                                    />
                                                    <span className="text-xs font-medium">
                                                        {cat.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() => openEdit(cat)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => setDeleteId(cat._id)}
                                                    disabled={cat.toolCount > 0}
                                                    title={cat.toolCount > 0 ? 'Cannot delete — has tools' : 'Delete'}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CategoryDialog
                open={formOpen}
                onClose={closeForm}
                category={editCat}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title="Delete category?"
                description="This category will be permanently deleted. Make sure no tools are using it."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId)}
            />
        </div>
    )
}

export default CategoriesList