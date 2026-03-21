import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, ArrowLeft, List, Eye, Clock, Users, Star } from 'lucide-react'
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
import PageHeader from '@/components/shared/PageHeader'
import ImageUploader from '@/components/shared/ImageUploader'
import { coursesApi } from '@/api/courses.api'

const schema = z.object({
  title:            z.string().min(1, 'Title is required').max(200),
  description:      z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(200).optional(),
  instructor:       z.string().min(1, 'Instructor name is required'),
  level:            z.enum(['beginner', 'intermediate', 'advanced']),
  category:         z.string().min(1, 'Category is required'),
  pricing:          z.enum(['free', 'paid']),
  price:            z.coerce.number().min(0).optional(),
  status:           z.enum(['draft', 'published', 'archived']),
  isFeatured:       z.boolean().optional(),
  metaTitle:        z.string().max(60).optional(),
  metaDescription:  z.string().max(160).optional(),
})

const CourseForm = () => {
  const navigate = useNavigate()
  const { id }   = useParams()
  const qc       = useQueryClient()
  const isEdit   = !!id

  const [coverImage,   setCoverImage]   = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  const {
    register, handleSubmit, control, reset, watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      level:      'beginner',
      pricing:    'free',
      price:      0,
      status:     'draft',
      isFeatured: false,
    },
  })

  const watchedPricing = watch('pricing')

  const { data: courseData } = useQuery({
    queryKey: ['admin-course', id],
    queryFn:  () => coursesApi.getById(id),
    select:   (res) => res.data.data,
    enabled:  isEdit,
  })

  useEffect(() => {
    if (!courseData) return
    reset({
      title:            courseData.title,
      description:      courseData.description,
      shortDescription: courseData.shortDescription || '',
      instructor:       courseData.instructor,
      level:            courseData.level,
      category:         courseData.category,
      pricing:          courseData.pricing,
      price:            courseData.price || 0,
      status:           courseData.status,
      isFeatured:       courseData.isFeatured,
      metaTitle:        courseData.meta?.title || '',
      metaDescription:  courseData.meta?.description || '',
    })
    setCoverImage(courseData.coverImage)
    setSelectedTags(
      (Array.isArray(courseData.tags) ? courseData.tags : [])
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter(Boolean)
    )
  }, [courseData, reset])

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? coursesApi.update(id, payload) : coursesApi.create(payload),
    onSuccess: (res) => {
      toast.success(isEdit ? 'Course updated' : 'Course created')
      qc.invalidateQueries({ queryKey: ['admin-courses'] })
      if (!isEdit) navigate(`/courses/${res.data.data._id}/lessons`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  })

  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      coverImage,
      tags: selectedTags,
      meta: {
        title:       data.metaTitle,
        description: data.metaDescription,
      },
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit course' : 'New course'}
        description={isEdit ? 'Update course details' : 'Create a new learning course'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Courses', href: '/courses' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {isEdit && (
              <Button
                variant="outline"
                onClick={() => navigate(`/courses/${id}/lessons`)}
              >
                <List className="h-4 w-4 mr-2" /> Manage lessons
              </Button>
            )}
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save course'}
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left */}
          <div className="xl:col-span-2 space-y-6">
            {/* Basic info */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Course details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Prompt Engineering Masterclass"
                    {...register('title')}
                  />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short description</Label>
                  <Input
                    id="shortDescription"
                    placeholder="One-line summary (max 200 chars)"
                    {...register('shortDescription')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full description *</Label>
                  <Textarea
                    id="description"
                    placeholder="What will students learn in this course?"
                    rows={5}
                    {...register('description')}
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor *</Label>
                  <Input
                    id="instructor"
                    placeholder="Instructor full name"
                    {...register('instructor')}
                  />
                  {errors.instructor && <p className="text-xs text-destructive">{errors.instructor.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Level *</Label>
                    <Controller
                      name="level"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      placeholder="e.g. AI Writing"
                      {...register('category')}
                    />
                    {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
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

            {/* Pricing */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pricing type *</Label>
                    <Controller
                      name="pricing"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {watchedPricing === 'paid' && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD) *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-7"
                          {...register('price')}
                        />
                      </div>
                      {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  The first lesson is always free — subsequent lessons require login to access.
                </p>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">SEO</CardTitle>
                <CardDescription>Optimise search appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="SEO title (max 60 characters)"
                    {...register('metaTitle')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="SEO description (max 160 characters)"
                    rows={3}
                    {...register('metaDescription')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Publish */}
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
                  {saveMutation.isPending
                    ? 'Saving...'
                    : isEdit ? 'Update course' : 'Create course'
                  }
                </Button>

                {!isEdit && (
                  <p className="text-xs text-muted-foreground text-center">
                    You'll be taken to add lessons after saving
                  </p>
                )}
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
                  folder="courses"
                  label="Upload cover image"
                  aspectRatio="16:9"
                />
              </CardContent>
            </Card>

            {/* Course stats (edit only) */}
            {isEdit && courseData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Course stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <List className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-lg font-bold">{courseData.lessons?.length || 0}</span>
                      <span className="text-xs text-muted-foreground">Lessons</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <Users className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-lg font-bold">{courseData.enrollmentCount || 0}</span>
                      <span className="text-xs text-muted-foreground">Students</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <Star className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-lg font-bold">
                        {courseData.averageRating?.toFixed(1) || '—'}
                      </span>
                      <span className="text-xs text-muted-foreground">Rating</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-lg font-bold">{courseData.totalDuration || 0}m</span>
                      <span className="text-xs text-muted-foreground">Duration</span>
                    </div>
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

export default CourseForm