import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search, BookOpen, Star, Users, Clock, X,
  Zap, GraduationCap, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import PricingBadge from '@/components/common/PricingBadge'
import StarRating from '@/components/common/StarRating'
import Pagination from '@/components/common/Pagination'
import EmptyState from '@/components/common/EmptyState'
import { BlogsBanner, PromptsBanner } from '@/components/common/Banners'
import { coursesApi } from '@/api/courses.api'
import SEO from '@/components/common/SEO'

const LEVEL_COLORS = {
  beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  advanced: 'bg-red-500/10 text-red-600 border-red-500/20',
}

function CourseCard({ course }) {
  const totalDuration = course.lessons?.reduce((s, l) => s + (l.duration || 0), 0) || course.totalDuration || 0

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-44 overflow-hidden bg-linear-to-br from-primary/10 to-primary/3">
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap className="h-14 w-14 text-primary/20" />
          </div>
        )}
        {course.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/90 text-amber-950 text-[10px] font-bold uppercase tracking-wide">
              <Sparkles className="h-2.5 w-2.5" /> Featured
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          {course.pricing === 'paid' && course.price > 0
            ? <span className="px-2 py-0.5 rounded-full bg-background/90 border border-border text-xs font-bold">${course.price}</span>
            : <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-wide">Free</span>
          }
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${LEVEL_COLORS[course.level] || LEVEL_COLORS.beginner}`}>
            {course.level || 'Beginner'}
          </span>
          {course.category && (
            <span className="text-[11px] text-muted-foreground truncate">{course.category}</span>
          )}
        </div>

        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {course.title || 'Untitled course'}
        </h3>

        <p className="text-xs text-muted-foreground">by {course.instructor || 'Instructor TBA'}</p>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {course.shortDescription || course.description || ''}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-2 border-t border-border/40">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.lessons?.length || 0} lessons
          </span>
          {totalDuration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {totalDuration}m
            </span>
          )}
          {course.enrollmentCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.enrollmentCount.toLocaleString()}
            </span>
          )}
          {course.averageRating > 0 && (
            <span className="flex items-center gap-1 ml-auto">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {course.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

export default function CoursesList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('q') || ''
  const level = searchParams.get('level') || ''
  const pricing = searchParams.get('pricing') || ''
  const featured = searchParams.get('featured') || ''

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['public-courses', page, search, level, pricing, featured],
    queryFn: () => coursesApi.getAll({
      page, limit: 12, search, level, pricing, status: 'published',
      ...(featured ? { isFeatured: true } : {}),
    }),
    select: (res) => ({ items: res.data.data, pagination: res.data.pagination }),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('q', searchInput.trim())
  }

  const clearFilters = () => {
    setSearchParams({})
    setSearchInput('')
  }

  const hasFilters = search || level || pricing || featured
  const items = data?.items || []

  /* Split items at midpoint for banner injection */
  const mid = Math.ceil(items.length / 2)
  const firstHalf = items.slice(0, mid)
  const secondHalf = items.slice(mid)

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

      <SEO
        title="Courses | Stakepedia"
        description="Master AI skills with structured, hands-on courses built for every level. Browse free and paid courses on AI tools and productivity."
        keywords="AI courses, learn AI, online courses, productivity, tutorials"
        canonicalUrl="https://stakepedia.info/courses"
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/70 mb-3">
          <Zap className="h-3.5 w-3.5" /> Learning Hub
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Courses</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Master AI skills with structured, hands-on courses built for every level.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search courses by title, topic, or instructor..."
          className="w-full h-12 pl-11 pr-32 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg h-8 px-4">
          Search
        </Button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Select value={level || 'all'} onValueChange={(v) => setParam('level', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-9 rounded-lg text-xs border-border bg-card w-auto min-w-32">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={pricing || 'all'} onValueChange={(v) => setParam('pricing', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-9 rounded-lg text-xs border-border bg-card w-auto min-w-28">
            <SelectValue placeholder="Pricing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pricing</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={() => setParam('featured', featured ? '' : 'true')}
          className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${featured ? 'bg-amber-500 text-white border-amber-500' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-amber-400/30'}`}
        >
          <Sparkles className="h-3 w-3" /> Featured
        </button>

        {hasFilters && (
          <button onClick={clearFilters} className="h-9 px-3 rounded-lg text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors ml-auto">
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Count */}
      {data?.pagination && (
        <p className="text-sm text-muted-foreground mb-5">
          <span className="font-medium text-foreground">{data.pagination.total?.toLocaleString()}</span> courses available
        </p>
      )}

      {/* Grid with mid-list banners */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* First half */}
          {firstHalf.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}

          {/* Mid-list banners */}
          <BlogsBanner />
          <PromptsBanner />

          {/* Second half */}
          {secondHalf.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No courses found" description="Try adjusting your filters or check back soon for new content." />
      )}

      <Pagination
        pagination={data?.pagination}
        onPageChange={(p) => {
          const params = new URLSearchParams(searchParams)
          params.set('page', p)
          setSearchParams(params)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        className="mt-10"
      />
    </div>
  )
}