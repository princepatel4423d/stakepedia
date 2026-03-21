import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, ArrowLeft, Plus, X, Loader2, Variable } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import PageHeader from '@/components/shared/PageHeader'
import { promptsApi } from '@/api/prompts.api'
import { aiToolsApi } from '@/api/aitools.api'

const schema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional().or(z.literal('')),
    content: z.string().min(1, 'Prompt content is required'),
    status: z.enum(['draft', 'published', 'archived']),
    isFeatured: z.boolean().optional(),
})

const PromptForm = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const qc = useQueryClient()
    const isEdit = !!id

    const [selectedTags, setSelectedTags] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [categoryInput, setCategoryInput] = useState('')
    const [selectedTools, setSelectedTools] = useState([])
    const [tagInput, setTagInput] = useState('')
    const [variables, setVariables] = useState([])
    const [newVarName, setNewVarName] = useState('')
    const [newVarDesc, setNewVarDesc] = useState('')
    const [newVarEx, setNewVarEx] = useState('')

    const {
        register, handleSubmit, control, reset, watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            content: '',
            status: 'draft',
            isFeatured: false,
        },
    })

    const watchedContent = watch('content', '')

    // Fetch prompt for edit
    const { data: promptData, isLoading: promptLoading } = useQuery({
        queryKey: ['admin-prompt', id],
        queryFn: () => promptsApi.getById(id),
        select: (res) => res.data.data,
        enabled: isEdit,
    })

    // AI Tools for linking
    const { data: allTools = [] } = useQuery({
        queryKey: ['admin-aitools-simple'],
        queryFn: () => aiToolsApi.getAll({ limit: 100, status: 'published' }),
        select: (res) => {
            const d = res.data.data
            return Array.isArray(d) ? d : (d?.items || [])
        },
    })

    useEffect(() => {
        if (!promptData) return
        reset({
            title: promptData.title || '',
            description: promptData.description || '',
            content: promptData.content || '',
            status: promptData.status || 'draft',
            isFeatured: promptData.isFeatured || false,
        })

        const categoryItems = Array.isArray(promptData.categories) && promptData.categories.length
            ? promptData.categories
            : (promptData.category ? [promptData.category] : [])
        setSelectedCategories(
            categoryItems
                .map((item) => (typeof item === 'string' ? item.trim() : ''))
                .filter(Boolean)
        )

        setSelectedTags(
            (Array.isArray(promptData.tags) ? promptData.tags : [])
                .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
                .filter(Boolean)
        )

        const toolItems = Array.isArray(promptData.tools) && promptData.tools.length
            ? promptData.tools
            : (promptData.tool ? [promptData.tool] : [])
        setSelectedTools(
            toolItems
                .map((item) => {
                    if (item && typeof item === 'object') {
                        return {
                            _id: item._id,
                            name: item.name,
                        }
                    }
                    return allTools.find((tool) => tool._id === item)
                })
                .filter(Boolean)
        )

        setVariables(promptData.variables || [])
    }, [promptData, reset, allTools])

    const saveMutation = useMutation({
        mutationFn: (payload) =>
            isEdit ? promptsApi.update(id, payload) : promptsApi.create(payload),
        onSuccess: (res) => {
            toast.success(isEdit ? 'Prompt updated' : 'Prompt created')
            qc.invalidateQueries({ queryKey: ['admin-prompts'] })
            if (!isEdit) navigate(`/prompts/${res.data.data._id}/edit`)
        },
        onError: (err) => {
            const errs = err.response?.data?.errors
            if (errs?.length) errs.forEach((e) => toast.error(`${e.field}: ${e.message}`))
            else toast.error(err.response?.data?.message || 'Save failed')
        },
    })

    const addVariable = () => {
        if (!newVarName.trim()) return
        setVariables([...variables, {
            name: newVarName.trim(),
            description: newVarDesc.trim(),
            example: newVarEx.trim(),
        }])
        setNewVarName('')
        setNewVarDesc('')
        setNewVarEx('')
    }

    const removeVariable = (i) =>
        setVariables(variables.filter((_, idx) => idx !== i))

    const onSubmit = (data) => {
        if (!selectedCategories.length) {
            toast.error('Add at least one category')
            return
        }

        saveMutation.mutate({
            ...data,
            category: selectedCategories[0],
            categories: selectedCategories,
            tool: selectedTools[0]?._id,
            tools: selectedTools.map((tool) => tool._id),
            tags: selectedTags,
            variables,
        })
    }

    const onError = (formErrors) => {
        const first = Object.values(formErrors)[0]
        if (first?.message) toast.error(first.message)
    }

    // Highlight variables in content preview
    const contentWithHighlights = watchedContent.replace(
        /\{\{(\w+)\}\}/g,
        '<mark class="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-0.5 rounded">{{$1}}</mark>'
    )

    if (isEdit && promptLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={isEdit ? 'Edit prompt' : 'New prompt'}
                description={isEdit ? 'Update prompt details' : 'Add a new prompt to the library'}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Prompts', href: '/prompts' },
                    { label: isEdit ? 'Edit' : 'New' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate('/prompts')}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit, onError)}
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                : <><Save className="h-4 w-4 mr-2" /> Save prompt</>
                            }
                        </Button>
                    </div>
                }
            />

            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Basic info */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">Prompt details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. SEO Blog Post Generator"
                                        {...register('title')}
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-destructive">{errors.title.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        placeholder="Brief description of what this prompt does"
                                        {...register('description')}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Categories *</Label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Add category..."
                                                    value={categoryInput}
                                                    onChange={(e) => setCategoryInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key !== 'Enter') return
                                                        e.preventDefault()
                                                        const nextCategory = categoryInput.trim()
                                                        if (!nextCategory || selectedCategories.includes(nextCategory)) return
                                                        setSelectedCategories([...selectedCategories, nextCategory])
                                                        setCategoryInput('')
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const nextCategory = categoryInput.trim()
                                                        if (!nextCategory || selectedCategories.includes(nextCategory)) return
                                                        setSelectedCategories([...selectedCategories, nextCategory])
                                                        setCategoryInput('')
                                                    }}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                            {selectedCategories.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedCategories.map((category) => (
                                                        <div
                                                            key={category}
                                                            className="flex items-center gap-1.5 bg-muted text-muted-foreground text-xs px-2.5 py-1.5 rounded-md"
                                                        >
                                                            <span>{category}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedCategories(selectedCategories.filter((item) => item !== category))}
                                                                className="hover:text-destructive transition-colors"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Linked AI tools</Label>
                                        <Controller
                                            name="toolsUi"
                                            control={control}
                                            render={() => (
                                                <Select value={''} onValueChange={(value) => {
                                                    if (!value) return
                                                    const selectedTool = allTools.find((t) => t._id === value)
                                                    if (!selectedTool) return
                                                    if (!selectedTools.some((t) => t._id === selectedTool._id)) {
                                                        setSelectedTools([...selectedTools, selectedTool])
                                                    }
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Optional - link one or more tools" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allTools
                                                            .filter((tool) => !selectedTools.some((selected) => selected._id === tool._id))
                                                            .map((tool) => (
                                                                <SelectItem key={tool._id} value={tool._id}>
                                                                    {tool.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {selectedTools.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTools.map((tool) => (
                                                    <div
                                                        key={tool._id}
                                                        className="flex items-center gap-1.5 bg-muted text-muted-foreground text-xs px-2.5 py-1.5 rounded-md"
                                                    >
                                                        <span>{tool.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedTools(selectedTools.filter((item) => item._id !== tool._id))}
                                                            className="hover:text-destructive transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add tags..."
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key !== 'Enter') return
                                                    e.preventDefault()
                                                    const nextTag = tagInput.trim()
                                                    if (!nextTag || selectedTags.includes(nextTag)) return
                                                    setSelectedTags([...selectedTags, nextTag])
                                                    setTagInput('')
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const nextTag = tagInput.trim()
                                                    if (!nextTag || selectedTags.includes(nextTag)) return
                                                    setSelectedTags([...selectedTags, nextTag])
                                                    setTagInput('')
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        {selectedTags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTags.map((tag) => (
                                                    <div
                                                        key={tag}
                                                        className="flex items-center gap-1.5 bg-muted text-muted-foreground text-xs px-2.5 py-1.5 rounded-md"
                                                    >
                                                        <span>{tag}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedTags(selectedTags.filter((item) => item !== tag))}
                                                            className="hover:text-destructive transition-colors"
                                                        >
                                                            x
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Prompt content */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Prompt content *</CardTitle>
                                <CardDescription>
                                    Use {'{{variable_name}}'} for dynamic placeholders
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Write your prompt here... Use {{variable}} for dynamic parts."
                                    rows={10}
                                    className="font-mono text-sm resize-y"
                                    {...register('content')}
                                />
                                {errors.content && (
                                    <p className="text-xs text-destructive">{errors.content.message}</p>
                                )}

                                {/* Live preview with highlighted variables */}
                                {watchedContent && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Preview</p>
                                        <div
                                            className="p-3 rounded-lg bg-muted/50 text-sm leading-relaxed whitespace-pre-wrap font-mono"
                                            dangerouslySetInnerHTML={{ __html: contentWithHighlights }}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Variables */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Variable className="h-4 w-4" /> Variables
                                </CardTitle>
                                <CardDescription>
                                    Define the {'{{variables}}'} used in your prompt
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Existing variables */}
                                {variables.length > 0 && (
                                    <div className="space-y-2">
                                        {variables.map((v, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <code className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono">
                                                            {`{{${v.name}}}`}
                                                        </code>
                                                        {v.description && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {v.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {v.example && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Example: <span className="italic">{v.example}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariable(i)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <Separator />
                                    </div>
                                )}

                                {/* Add new variable */}
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-muted-foreground">Add variable</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Name *</Label>
                                            <Input
                                                value={newVarName}
                                                onChange={(e) => setNewVarName(e.target.value)}
                                                placeholder="variable_name"
                                                className="font-mono text-sm"
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariable() } }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Description</Label>
                                            <Input
                                                value={newVarDesc}
                                                onChange={(e) => setNewVarDesc(e.target.value)}
                                                placeholder="What it represents"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Example value</Label>
                                            <Input
                                                value={newVarEx}
                                                onChange={(e) => setNewVarEx(e.target.value)}
                                                placeholder="e.g. blog post"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addVariable}
                                        disabled={!newVarName.trim()}
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add variable
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Publish</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Featured</p>
                                        <p className="text-xs text-muted-foreground">Highlight in library</p>
                                    </div>
                                    <Controller
                                        name="isFeatured"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                </div>

                                <Separator />

                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={handleSubmit(onSubmit, onError)}
                                    disabled={saveMutation.isPending}
                                >
                                    {saveMutation.isPending
                                        ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                        : <><Save className="h-4 w-4 mr-2" /> {isEdit ? 'Update' : 'Create'} prompt</>
                                    }
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Stats (edit only) */}
                        {isEdit && promptData && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Stats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                                            <span className="text-lg font-bold">{promptData.usageCount || 0}</span>
                                            <span className="text-xs text-muted-foreground">Uses</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                                            <span className="text-lg font-bold">{promptData.likeCount || 0}</span>
                                            <span className="text-xs text-muted-foreground">Likes</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Variable reference */}
                        {variables.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Variable reference</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1.5">
                                        {variables.map((v, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                                                    {`{{${v.name}}}`}
                                                </code>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {v.description || v.example || '—'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}

export default PromptForm