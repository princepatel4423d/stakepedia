import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  DndContext, closestCenter, KeyboardSensor,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus, GripVertical, Pencil, Trash2,
  ArrowLeft, Save, X, Clock, Lock, Unlock,
  BookOpen, Video, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import PageHeader from '@/components/shared/PageHeader'
import RichTextEditor from '@/components/shared/RichTextEditor'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { coursesApi } from '@/api/courses.api'

const lessonSchema = z.object({
  title:    z.string().min(1, 'Title is required'),
  videoUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  duration: z.coerce.number().min(0).optional(),
  isFree:   z.boolean().optional(),
})

// ── Sortable Lesson Item ──────────────────────────────────────────────────────
const SortableLesson = ({ lesson, index, isFirst, onEdit, onDelete }) => {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: lesson._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Order number */}
      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 text-center">
        {index + 1}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{lesson.title}</p>
          {isFirst || lesson.isFree ? (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              <Unlock className="h-2.5 w-2.5 mr-1" />
              Free
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">
              <Lock className="h-2.5 w-2.5 mr-1" />
              Locked
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {lesson.videoUrl && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Video className="h-3 w-3" /> Has video
            </span>
          )}
          {lesson.duration > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {lesson.duration}m
            </span>
          )}
          {lesson.resources?.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {lesson.resources.length} resource{lesson.resources.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(lesson)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(lesson._id)}
          disabled={isFirst}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ── Lesson Form Dialog ────────────────────────────────────────────────────────
const LessonFormDialog = ({ open, onClose, lesson, courseId, lessonIndex, onSaved }) => {
  const isEdit = !!lesson
  const qc     = useQueryClient()

  const {
    register, handleSubmit, control, reset, setValue, watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title:    lesson?.title    || '',
      videoUrl: lesson?.videoUrl || '',
      duration: lesson?.duration || 0,
      isFree:   lesson?.isFree   || lessonIndex === 0,
    },
  })

  const [content, setContent] = useState(lesson?.content || '')
  const [resources, setResources] = useState(lesson?.resources || [])
  const [resTitle, setResTitle]   = useState('')
  const [resUrl,   setResUrl]     = useState('')

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? coursesApi.updateLesson(courseId, lesson._id, payload)
        : coursesApi.addLesson(courseId, payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Lesson updated' : 'Lesson added')
      qc.invalidateQueries({ queryKey: ['admin-course', courseId] })
      onSaved()
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  })

  const onSubmit = (data) => {
    const stripped = content?.replace(/<[^>]*>/g, '').trim()
    if (!stripped) {
      toast.error('Lesson content is required')
      return
    }
    const payload = { ...data, content, resources }
    // Don't send empty string for optional URL field — backend isURL() will reject it
    if (!payload.videoUrl) delete payload.videoUrl
    saveMutation.mutate(payload)
  }

  const addResource = (e) => {
    e?.preventDefault()
    if (!resTitle.trim() || !resUrl.trim()) return
    setResources([...resources, { title: resTitle.trim(), url: resUrl.trim() }])
    setResTitle('')
    setResUrl('')
  }

  const onResourceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addResource()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit lesson' : 'Add lesson'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title & duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="lesson-title">Title *</Label>
              <Input
                id="lesson-title"
                placeholder="Lesson title"
                {...register('title')}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                placeholder="0"
                {...register('duration')}
              />
            </div>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="videoUrl"
                placeholder="https://youtube.com/..."
                className="pl-9"
                {...register('videoUrl')}
              />
            </div>
            {errors.videoUrl && <p className="text-xs text-destructive">{errors.videoUrl.message}</p>}
          </div>

          {/* Free toggle */}
          {lessonIndex !== 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Free preview</p>
                <p className="text-xs text-muted-foreground">Allow non-logged-in users to access</p>
              </div>
              <Controller
                name="isFree"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          )}

          {lessonIndex === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm text-green-700 dark:text-green-400">
              <Unlock className="h-4 w-4 shrink-0" />
              This is the first lesson — it's always free for everyone
            </div>
          )}

          {/* Content editor */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <RichTextEditor
              value={content}
              onChange={(html) => {
                setContent(html)
              }}
              placeholder="Write the lesson content..."
              minHeight="250px"
            />
            {errors.root?.content && (
              <p className="text-xs text-destructive">{errors.root.content.message}</p>
            )}
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <Label>Resources</Label>
            <div className="flex gap-2">
              <Input
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                onKeyDown={onResourceKeyDown}
                placeholder="Resource name"
                className="flex-1"
              />
              <Input
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                onKeyDown={onResourceKeyDown}
                placeholder="URL (https://...)"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addResource} className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {resources.length > 0 && (
              <div className="space-y-2">
                {resources.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResources(resources.filter((_, idx) => idx !== i))}
                      className="ml-2 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update lesson' : 'Add lesson'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main LessonBuilder ────────────────────────────────────────────────────────
const LessonBuilder = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [editLesson,   setEditLesson]   = useState(null)
  const [deleteId,     setDeleteId]     = useState(null)
  const [localLessons, setLocalLessons] = useState(null)

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['admin-course', id],
    queryFn:  () => coursesApi.getById(id),
    select:   (res) => res.data.data,
  })

  // Keep localLessons in sync when data loads
  const lessons = localLessons ||
    [...(courseData?.lessons || [])].sort((a, b) => a.order - b.order)

  const deleteMutation = useMutation({
    mutationFn: (lessonId) => coursesApi.deleteLesson(id, lessonId),
    onSuccess: () => {
      toast.success('Lesson deleted')
      qc.invalidateQueries({ queryKey: ['admin-course', id] })
      setDeleteId(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  })

  const reorderMutation = useMutation({
    mutationFn: (lessonIds) => coursesApi.reorderLessons(id, { lessonIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-course', id] }),
    onError: () => toast.error('Failed to save order'),
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setLocalLessons((prev) => {
      const oldIndex = prev.findIndex((l) => l._id === active.id)
      const newIndex = prev.findIndex((l) => l._id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      reorderMutation.mutate(reordered.map((l) => l._id))
      return reordered
    })
  }, [reorderMutation])

  const openAdd = () => {
    setEditLesson(null)
    setDialogOpen(true)
  }

  const openEdit = (lesson) => {
    setEditLesson(lesson)
    setDialogOpen(true)
  }

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={courseData ? `${courseData.title} — Lessons` : 'Lesson builder'}
        description="Add, edit and reorder course lessons"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Courses', href: '/courses' },
          { label: courseData?.title || '...', href: `/courses/${id}/edit` },
          { label: 'Lessons' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/courses/${id}/edit`)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to course
            </Button>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" /> Add lesson
            </Button>
          </div>
        }
      />

      {/* Summary strip */}
      <div className="flex items-center gap-6 p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{lessons.length}</span>
          <span className="text-muted-foreground">lessons</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{totalDuration}m</span>
          <span className="text-muted-foreground">total duration</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Unlock className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">
            {lessons.filter((l, i) => i === 0 || l.isFree).length}
          </span>
          <span className="text-muted-foreground">free lessons</span>
        </div>
      </div>

      {/* Lesson list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lessons</CardTitle>
            <p className="text-xs text-muted-foreground">Drag to reorder</p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <BookOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No lessons yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Add your first lesson to get started
              </p>
              <Button size="sm" onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" /> Add first lesson
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={lessons.map((l) => l._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <SortableLesson
                      key={lesson._id}
                      lesson={lesson}
                      index={index}
                      isFirst={index === 0}
                      onEdit={openEdit}
                      onDelete={setDeleteId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {lessons.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" /> Add another lesson
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit dialog */}
      {dialogOpen && (
        <LessonFormDialog
          open={dialogOpen}
          onClose={() => { setDialogOpen(false); setEditLesson(null) }}
          lesson={editLesson}
          courseId={id}
          lessonIndex={editLesson
            ? lessons.findIndex((l) => l._id === editLesson._id)
            : lessons.length
          }
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['admin-course', id] })
            setLocalLessons(null)
          }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete lesson?"
        description="This lesson and its content will be permanently deleted."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}

export default LessonBuilder