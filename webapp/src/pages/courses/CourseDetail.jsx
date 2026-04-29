import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, BookOpen, Clock, Users, Star,
  Lock, Unlock, PlayCircle, GraduationCap,
  CheckCircle, Tag, Sparkles, BarChart3,
  ChevronRight, BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StarRating from '@/components/common/StarRating'
import ReviewForm from '@/components/common/ReviewForm'
import EmptyState from '@/components/common/EmptyState'
import { coursesApi } from '@/api/courses.api'
import { reviewsApi } from '@/api/reviews.api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SEO from '@/components/common/SEO'

const LEVEL_COLORS = {
  beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  advanced: 'bg-red-500/10 text-red-600 border-red-500/20',
}

function formatDuration(minutes) {
  if (!minutes) return '0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`
}

export default function CourseDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-detail', slug],
    queryFn: () => coursesApi.getBySlug(slug),
    select: (res) => res.data.data,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['course-reviews', course?._id],
    queryFn: () => reviewsApi.getForTarget('Course', course._id),
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.reviews || [])
    },
    enabled: !!course?._id,
  })

  const lessons = [...(course?.lessons || [])].sort((a, b) => a.order - b.order)
  const firstLesson = lessons[0]
  const totalDuration = course?.totalDuration || lessons.reduce((s, l) => s + (l.duration || 0), 0)
  const freeLessons = lessons.filter((l, i) => i === 0 || l.isFree).length

  const handleStartCourse = () => {
    if (firstLesson) navigate(`/courses/${slug}/${firstLesson._id}`)
  }

  /* Loading */
  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <Skeleton className="h-4 w-28 mb-8" />
      <div className="flex gap-8">
        <div className="flex-1 space-y-5">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-64 rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
        <div className="w-72 shrink-0 space-y-3">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  )

  if (!course) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <EmptyState icon={BookOpen} title="Course not found" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

      <SEO
        title={`${course.title} | Stakepedia`}
        description={course.shortDescription || course.description}
        keywords={course.tags?.join(', ')}
        canonicalUrl={`https://stakepedia.info/courses/${course.slug}`}
        ogImage={course.coverImage}
        ogType="article"
      />

      {/* Back */}
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Courses
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT - Main content */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* Hero */}
          <div>
            {/* Cover */}
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-border mb-6 bg-linear-to-br from-primary/10 to-primary/3">
              {course.coverImage ? (
                <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <GraduationCap className="h-20 w-20 text-primary/20" />
                </div>
              )}
              {course.isFeatured && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/90 text-amber-950 text-[10px] font-bold uppercase tracking-wide">
                    <Sparkles className="h-2.5 w-2.5" /> Featured
                  </span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide border ${LEVEL_COLORS[course.level] || LEVEL_COLORS.beginner}`}>
                {course.level || 'Beginner'}
              </span>
              {course.pricing === 'paid' && course.price > 0
                ? <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold border border-border bg-card">${course.price}</span>
                : <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Free</span>
              }
              {course.category && (
                <span className="px-2.5 py-0.5 rounded-md text-xs border border-border text-muted-foreground">{course.category}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">{course.title}</h1>
            <p className="text-sm text-muted-foreground mb-3">by <span className="font-medium text-foreground">{course.instructor}</span></p>

            {course.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={course.averageRating} showValue />
                <span className="text-xs text-muted-foreground">({course.reviewCount || reviews.length} reviews)</span>
              </div>
            )}

            <p className="text-muted-foreground leading-relaxed text-sm">
              {course.description || 'Course description will be updated soon.'}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: BookOpen, label: 'Lessons', value: lessons.length },
              { icon: Clock, label: 'Duration', value: formatDuration(totalDuration) },
              { icon: Users, label: 'Students', value: (course.enrollmentCount || 0).toLocaleString() },
              { icon: Unlock, label: 'Free lessons', value: freeLessons },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center p-4 rounded-2xl border border-border bg-card text-center gap-1">
                <Icon className="h-5 w-5 text-primary" />
                <p className="font-bold text-lg leading-none">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="curriculum">
            <TabsList className="mb-5">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Curriculum */}
            <TabsContent value="curriculum" className="space-y-2">
              {lessons.length === 0 ? (
                <div className="p-8 rounded-xl border border-border bg-muted/20 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Curriculum is being prepared.</p>
                </div>
              ) : lessons.map((lesson, i) => {
                const isFree = i === 0 || lesson.isFree
                const canAccess = isFree || !!user
                return (
                  <div
                    key={lesson._id}
                    onClick={() => canAccess ? navigate(`/courses/${slug}/${lesson._id}`) : navigate('/login')}
                    className={`flex items-center gap-3 p-4 rounded-xl border bg-card transition-all cursor-pointer group
                      ${canAccess ? 'hover:border-primary/30 hover:bg-accent/50' : 'opacity-70 hover:opacity-90'}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border
                      ${canAccess ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{lesson.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        {lesson.duration > 0 && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{formatDuration(lesson.duration)}</span>}
                        {lesson.videoUrl && <span>· Video</span>}
                        {lesson.resources?.length > 0 && <span>· {lesson.resources.length} resource{lesson.resources.length !== 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    {isFree ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 shrink-0">
                        <Unlock className="h-3.5 w-3.5" /> Free
                      </span>
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                )
              })}
            </TabsContent>

            {/* ── Reviews ── */}
            <TabsContent value="reviews" className="space-y-5">
              {course.averageRating > 0 && (
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-card">
                  <div className="text-center shrink-0">
                    <div className="text-4xl font-black">{course.averageRating.toFixed(1)}</div>
                    <StarRating rating={course.averageRating} size="sm" />
                    <p className="text-xs text-muted-foreground mt-1">{course.reviewCount || reviews.length} reviews</p>
                  </div>
                </div>
              )}
              {reviews.length > 0 && (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r._id} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={r.user?.avatar} />
                        <AvatarFallback className="text-xs font-semibold">{r.user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold">{r.user?.name}</span>
                          <StarRating rating={r.rating} size="sm" />
                          <span className="text-xs text-muted-foreground ml-auto">{formatDate(r.createdAt)}</span>
                        </div>
                        {r.title && <p className="text-sm font-medium mb-1">{r.title}</p>}
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <ReviewForm
                targetType="Course"
                targetId={course._id}
                queryKey={['course-reviews', course._id]}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT - Sticky sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="lg:sticky lg:top-24 space-y-4">

            {/* CTA card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              {course.pricing === 'paid' && course.price > 0 && (
                <div>
                  <p className="text-3xl font-extrabold">${course.price}</p>
                  <p className="text-xs text-muted-foreground">One-time payment</p>
                </div>
              )}

              {firstLesson ? (
                <Button className="w-full gap-2 h-11 rounded-xl text-sm font-semibold" onClick={handleStartCourse}>
                  <PlayCircle className="h-5 w-5" />
                  {course.pricing === 'free' || !course.pricing ? 'Start learning free' : 'Start course'}
                </Button>
              ) : (
                <Button className="w-full h-11 rounded-xl" disabled>Coming soon</Button>
              )}

              {/* Course details */}
              <div className="space-y-2.5 pt-2 border-t border-border text-sm">
                {[
                  { label: 'Level', value: <span className="capitalize font-medium">{course.level}</span> },
                  { label: 'Lessons', value: <span className="font-medium">{lessons.length}</span> },
                  { label: 'Duration', value: <span className="font-medium">{formatDuration(totalDuration)}</span> },
                  { label: 'Students', value: <span className="font-medium">{(course.enrollmentCount || 0).toLocaleString()}</span> },
                  { label: 'Category', value: <span className="font-medium">{course.category || 'General'}</span> },
                  { label: 'Free lessons', value: <span className="font-medium text-emerald-600">{freeLessons}</span> },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    {value}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {course.tags?.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <Link key={tag} to={`/courses?tag=${tag}`}
                      className="px-2.5 py-1 rounded-full border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick lesson list preview */}
            {lessons.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Quick overview
                </h3>
                <div className="space-y-1">
                  {lessons.slice(0, 5).map((l, i) => (
                    <div key={l._id} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                      <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] shrink-0">{i + 1}</span>
                      <span className="truncate flex-1">{l.title}</span>
                      {(i === 0 || l.isFree) && <Unlock className="h-3 w-3 text-emerald-500 shrink-0" />}
                    </div>
                  ))}
                  {lessons.length > 5 && (
                    <p className="text-[11px] text-muted-foreground pt-1 pl-6">+{lessons.length - 5} more lessons</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}