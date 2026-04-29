import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, ArrowRight, Lock, ExternalLink, BookOpen,
  Clock, CheckCircle, ChevronRight, PlayCircle, FileText,
  Unlock, GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { coursesApi } from '@/api/courses.api'
import { useAuthStore } from '@/store/authStore'
import SEO from '@/components/common/SEO'

function formatDuration(minutes) {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default function LessonView() {
  const { slug, lessonId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-detail', slug],
    queryFn: () => coursesApi.getBySlug(slug),
    select: (res) => res.data.data,
  })

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
        <div className="w-72 shrink-0 space-y-2 hidden lg:block">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
        </div>
      </div>
    </div>
  )

  const lessons = [...(course?.lessons || [])].sort((a, b) => a.order - b.order)
  const currentIndex = lessons.findIndex((l) => l._id === lessonId)
  const lesson = lessons[currentIndex]
  const prevLesson = lessons[currentIndex - 1]
  const nextLesson = lessons[currentIndex + 1]

  const isFree = currentIndex === 0 || lesson?.isFree
  const locked = !isFree && !user

  if (!course || !lesson) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <EmptyState icon={BookOpen} title="Lesson not found" />
    </div>
  )

  if (locked) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <div className="max-w-md mx-auto text-center pt-10">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">This lesson is locked</h2>
        <p className="text-sm text-muted-foreground mb-6">Sign in to access all lessons in this course.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to={`/login?redirect=/courses/${slug}/${lessonId}`}>
            <Button className="rounded-xl">Sign in to continue</Button>
          </Link>
          <Link to={`/courses/${slug}`}>
            <Button variant="outline" className="rounded-xl">Back to course</Button>
          </Link>
        </div>
      </div>
    </div>
  )

  const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl)
  const isExternalVideo = lesson.videoUrl && !embedUrl
  const progress = Math.round(((currentIndex + 1) / lessons.length) * 100)

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

      <SEO
        title={`${lesson.title} — ${course.title} | Stakepedia`}
        description={`Lesson ${currentIndex + 1} of ${lessons.length} in ${course.title}. ${course.shortDescription || course.description || ''}`}
        canonicalUrl={`https://stakepedia.info/courses/${slug}/${lesson._id}`}
        ogImage={course.coverImage}
        ogType="article"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/courses" className="hover:text-foreground transition-colors">Courses</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/courses/${slug}`} className="hover:text-foreground transition-colors truncate max-w-48">{course.title}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-48">{lesson.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT - Lesson content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Lesson header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Lesson {currentIndex + 1} of {lessons.length}
              </Badge>
              {lesson.duration > 0 && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDuration(lesson.duration)}
                </Badge>
              )}
              {isFree && (
                <Badge className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border gap-1">
                  <Unlock className="h-3 w-3" /> Free
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{lesson.title}</h1>
          </div>

          {/* Video */}
          {lesson.videoUrl && (
            <div>
              {embedUrl ? (
                <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden border border-border bg-black">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              ) : (
                <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent transition-all group">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">Watch video</p>
                    <p className="text-xs text-muted-foreground">Opens in a new tab</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                </a>
              )}
            </div>
          )}

          {/* Lesson content */}
          {lesson.content && (
            <article
              className="prose prose-sm sm:prose-base dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:border prose-img:border-border
                prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}

          {/* Resources */}
          {lesson.resources?.length > 0 && (
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Resources
              </h3>
              <div className="space-y-2">
                {lesson.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:text-primary" />
                    {r.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Prev / Next nav */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
            {prevLesson ? (
              <Button variant="outline" className="gap-2 rounded-xl"
                onClick={() => navigate(`/courses/${slug}/${prevLesson._id}`)}>
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
            ) : (
              <Link to={`/courses/${slug}`}>
                <Button variant="ghost" className="gap-2 rounded-xl">
                  <ArrowLeft className="h-4 w-4" /> Back to course
                </Button>
              </Link>
            )}

            {nextLesson ? (
              <Button className="gap-2 rounded-xl"
                onClick={() => navigate(`/courses/${slug}/${nextLesson._id}`)}
                disabled={!(nextLesson.isFree || user)}>
                {!(nextLesson.isFree || user) && <Lock className="h-3.5 w-3.5" />}
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" className="gap-2 rounded-xl"
                onClick={() => navigate(`/courses/${slug}`)}>
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Finish course
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT - Course sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="lg:sticky lg:top-24 space-y-4">

            {/* Progress */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your progress</h3>
                <span className="text-xs font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{currentIndex + 1} of {lessons.length} lessons</p>
            </div>

            {/* Lesson list */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Course contents
                </h3>
                <Link to={`/courses/${slug}`} className="text-[11px] text-primary hover:underline">View all</Link>
              </div>
              <div className="space-y-0.5 max-h-105 overflow-y-auto">
                {lessons.map((l, i) => {
                  const isActive = l._id === lessonId
                  const canAccess = i === 0 || l.isFree || !!user
                  return (
                    <button
                      key={l._id}
                      onClick={() => canAccess && navigate(`/courses/${slug}/${l._id}`)}
                      disabled={!canAccess}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors
                        ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}
                        ${!canAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold border
                        ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border'}`}>
                        {i + 1}
                      </span>
                      <span className="truncate flex-1 text-xs">{l.title}</span>
                      {!canAccess
                        ? <Lock className="h-3 w-3 shrink-0" />
                        : isActive
                          ? <PlayCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                          : (i === 0 || l.isFree) && <Unlock className="h-3 w-3 text-emerald-500 shrink-0" />
                      }
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Back to course */}
            <Link to={`/courses/${slug}`}>
              <Button variant="outline" className="w-full rounded-xl gap-2 text-sm">
                <GraduationCap className="h-4 w-4" /> Course overview
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}