import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, ArrowLeft, Eye, Clock, MessageSquare, Star, Plus, X } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import PageHeader from '@/components/shared/PageHeader'
import ImageUploader from '@/components/shared/ImageUploader'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { blogsApi } from '@/api/blogs.api'
import { format } from 'date-fns'

const schema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    excerpt: z.string().max(300).optional(),
    status: z.enum(['draft', 'published', 'archived']),
    isFeatured: z.boolean().optional(),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
})

// Word count display
const WordCount = ({ content }) => {
    const words = content?.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length || 0
    const readTime = Math.ceil(words / 200)
    return (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{words.toLocaleString()} words</span>
            <span>·</span>
            <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{readTime} min read
            </span>
        </div>
    )
}

const ManualStringListInput = ({ label, value = [], onChange, placeholder }) => {
    const [input, setInput] = useState('')

    const add = () => {
        const raw = input.trim()
        if (!raw) return

        const lower = raw.toLowerCase()
        const exists = value.some((item) => item.toLowerCase() === lower)
        if (exists) {
            setInput('')
            return
        }

        onChange([...value, raw])
        setInput('')
    }

    const remove = (index) => onChange(value.filter((_, i) => i !== index))

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            add()
                        }
                    }}
                />
                <Button type="button" variant="outline" size="icon" onClick={add}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((item, index) => (
                        <Badge key={`${item}-${index}`} variant="secondary" className="flex items-center gap-1.5">
                            <span>{item}</span>
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}

const normalizeManualValues = (items = []) => {
    const values = (Array.isArray(items) ? items : [])
        .map((item) => {
            if (typeof item === 'string') return item.trim()
            if (item?.name) return item.name.trim()
            return ''
        })
        .filter(Boolean)

    const unique = []
    const seen = new Set()
    values.forEach((item) => {
        const key = item.toLowerCase()
        if (!seen.has(key)) {
            seen.add(key)
            unique.push(item)
        }
    })
    return unique
}

const BlogForm = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const qc = useQueryClient()
    const isEdit = !!id

    const [content, setContent] = useState('')
    const [coverImage, setCoverImage] = useState(null)
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])

    const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            status: 'draft',
            isFeatured: false,
        },
    })

    const watchedTitle = watch('title', '')

    // Fetch existing blog for edit
    const { data: blogData } = useQuery({
        queryKey: ['admin-blog', id],
        queryFn: () => blogsApi.getById(id),
        select: (res) => res.data.data,
        enabled: isEdit,
    })

    useEffect(() => {
        if (!blogData) return
        reset({
            title: blogData.title,
            excerpt: blogData.excerpt || '',
            status: blogData.status,
            isFeatured: blogData.isFeatured,
            metaTitle: blogData.meta?.title || '',
            metaDescription: blogData.meta?.description || '',
        })
        setContent(blogData.content || '')
        setCoverImage(blogData.coverImage)
        setSelectedTags(normalizeManualValues(blogData.tags || []))
        setSelectedCategories(normalizeManualValues(blogData.categories || []))
    }, [blogData, reset])

    const saveMutation = useMutation({
        mutationFn: (payload) =>
            isEdit ? blogsApi.update(id, payload) : blogsApi.create(payload),
        onSuccess: (res) => {
            toast.success(isEdit ? 'Blog post updated' : 'Blog post created')
            qc.invalidateQueries({ queryKey: ['admin-blogs'] })
            if (!isEdit) navigate(`/blogs/${res.data.data._id}/edit`)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
    })

    const publishMutation = useMutation({
        mutationFn: () => blogsApi.publish(id),
        onSuccess: () => {
            toast.success('Blog post published')
            qc.invalidateQueries({ queryKey: ['admin-blog', id] })
            qc.invalidateQueries({ queryKey: ['admin-blogs'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish'),
    })

    const onSubmit = (data) => {
        if (!content || content === '<p></p>') {
            toast.error('Content is required')
            return
        }
        if (!selectedCategories.length) {
            toast.error('Add at least one category')
            return
        }

        saveMutation.mutate({
            ...data,
            content,
            coverImage,
            categories: selectedCategories,
            tags: selectedTags,
            meta: {
                title: data.metaTitle,
                description: data.metaDescription,
            },
        })
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={isEdit ? 'Edit post' : 'New post'}
                description={isEdit ? 'Update your blog post' : 'Write a new blog post'}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Blogs', href: '/blogs' },
                    { label: isEdit ? 'Edit' : 'New' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate('/blogs')}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        {isEdit && blogData?.status !== 'published' && (
                            <Button
                                variant="outline"
                                onClick={() => publishMutation.mutate()}
                                disabled={publishMutation.isPending}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                            </Button>
                        )}
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={saveMutation.isPending}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saveMutation.isPending ? 'Saving...' : 'Save post'}
                        </Button>
                    </div>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left — editor */}
                    <div className="xl:col-span-2 space-y-4">
                        {/* Title */}
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter post title..."
                                        className="text-lg font-medium h-12"
                                        {...register('title')}
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-destructive">{errors.title.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Excerpt</Label>
                                    <Textarea
                                        id="excerpt"
                                        placeholder="Short summary shown in listings (max 300 chars)..."
                                        rows={2}
                                        {...register('excerpt')}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Editor */}
                        <Card>
                            <CardHeader className="pb-0">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Content *</CardTitle>
                                    <WordCount content={content} />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3">
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Start writing your post..."
                                    minHeight="400px"
                                />
                            </CardContent>
                        </Card>

                        {/* SEO */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">SEO</CardTitle>
                                <CardDescription>Optimise how this post appears in search results</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="metaTitle">Meta title</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {watch('metaTitle')?.length || 0}/60
                                        </span>
                                    </div>
                                    <Input
                                        id="metaTitle"
                                        placeholder={watchedTitle || 'SEO title (max 60 characters)'}
                                        {...register('metaTitle')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="metaDescription">Meta description</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {watch('metaDescription')?.length || 0}/160
                                        </span>
                                    </div>
                                    <Textarea
                                        id="metaDescription"
                                        placeholder="SEO description (max 160 characters)"
                                        rows={3}
                                        {...register('metaDescription')}
                                    />
                                </div>

                                {/* Google preview */}
                                {(watchedTitle || watch('metaDescription')) && (
                                    <div className="mt-2 p-3 rounded-lg bg-muted/50 border space-y-0.5">
                                        <p className="text-xs text-muted-foreground mb-1">Search preview</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">
                                            {watch('metaTitle') || watchedTitle}
                                        </p>
                                        <p className="text-xs text-green-700 dark:text-green-500">
                                            stakepedia.com/blogs/...
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {watch('metaDescription') || watch('excerpt') || 'No description provided'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-4">
                        {/* Publish card */}
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
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
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
                                        <p className="text-xs text-muted-foreground">Highlight on homepage</p>
                                    </div>
                                    <Controller
                                        name="isFeatured"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                </div>

                                <Separator />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={saveMutation.isPending}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update post' : 'Create post'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Cover image */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Cover image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ImageUploader
                                    value={coverImage}
                                    onChange={setCoverImage}
                                    folder="blogs"
                                    label="Upload cover image"
                                    aspectRatio="16:9"
                                />
                            </CardContent>
                        </Card>

                        {/* Categories */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Categories</CardTitle>
                                <CardDescription>Manual categories saved directly with this blog</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ManualStringListInput
                                    label="Blog categories"
                                    value={selectedCategories}
                                    onChange={setSelectedCategories}
                                    placeholder="Type category and press Enter"
                                />
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Tags</CardTitle>
                                <CardDescription>Manual tags saved directly with this blog</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ManualStringListInput
                                    label="Blog tags"
                                    value={selectedTags}
                                    onChange={setSelectedTags}
                                    placeholder="Type tag and press Enter"
                                />
                            </CardContent>
                        </Card>

                        {/* Post stats (edit only) */}
                        {isEdit && blogData && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Post stats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                                            <Eye className="h-4 w-4 text-muted-foreground mb-1" />
                                            <span className="text-lg font-bold">{blogData.viewCount?.toLocaleString()}</span>
                                            <span className="text-xs text-muted-foreground">Views</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground mb-1" />
                                            <span className="text-lg font-bold">{blogData.commentCount}</span>
                                            <span className="text-xs text-muted-foreground">Comments</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                                            <Star className="h-4 w-4 text-muted-foreground mb-1" />
                                            <span className="text-lg font-bold">{blogData.likeCount}</span>
                                            <span className="text-xs text-muted-foreground">Likes</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                                            <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                                            <span className="text-lg font-bold">{blogData.readTime}m</span>
                                            <span className="text-xs text-muted-foreground">Read time</span>
                                        </div>
                                    </div>
                                    {blogData.publishedAt && (
                                        <p className="text-xs text-muted-foreground text-center mt-3">
                                            Published {format(new Date(blogData.publishedAt), 'MMM d, yyyy')}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}

export default BlogForm