import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Search, FileText, Heart, Eye, ImageOff,
  X, Sparkles, Clock, Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Pagination from '@/components/common/Pagination'
import EmptyState from '@/components/common/EmptyState'
import { NewsletterBanner, CoursesBanner } from '@/components/common/Banners'
import { blogsApi } from '@/api/blogs.api'
import { formatDate, readTime } from '@/lib/utils'
import SEO from '@/components/common/SEO'

/* Big featured hero (left side) */
function HeroBlogCard({ blog }) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group relative flex flex-col justify-end rounded-2xl overflow-hidden border border-border h-full min-h-105"
    >
      {blog.coverImage ? (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-primary/10" />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative p-6">
        {blog.categories?.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            <span className="text-xs text-white/80 font-medium">{blog.categories[0]}</span>
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-3 mb-3 leading-snug group-hover:text-white/90 transition-colors">
          {blog.title}
        </h2>
        <div className="flex items-center gap-2 text-xs text-white/55">
          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          <span>·</span>
          <span>{blog.readTime || readTime(blog.content)} min read</span>
        </div>
      </div>
    </Link>
  )
}

/* Small sidebar blog row */
function SidebarBlogCard({ blog }) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group flex gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition-all"
    >
      <div className="h-16 w-20 rounded-lg shrink-0 overflow-hidden bg-muted/40 border border-border/40">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageOff className="h-4 w-4 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1">
          {blog.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          <span>·</span>
          <span>{blog.readTime || readTime(blog.content)} min read</span>
        </div>
      </div>
    </Link>
  )
}

/* Grid blog card */
function BlogCard({ blog }) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="h-48 w-full overflow-hidden bg-muted/40 shrink-0">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        {blog.categories?.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-primary/70">{blog.categories[0]}</span>
          </div>
        )}

        <h2 className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors mb-2 leading-snug">
          {blog.title}
        </h2>

        <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed mb-4">
          {blog.excerpt || 'Summary coming soon.'}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-3 mt-auto">
          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {blog.readTime || readTime(blog.content)} min read
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Eye className="h-2.5 w-2.5" />{blog.viewCount || 0}
          </span>
        </div>
      </div>
    </Link>
  )
}

function BlogCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

/* Main */
export default function BlogsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const tag = searchParams.get('tag') || ''
  const featured = searchParams.get('featured') || ''

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['public-blogs', page, search, category, tag, featured],
    queryFn: () => blogsApi.getAll({
      page, limit: 9, search, status: 'published',
      ...(category ? { category } : {}),
      ...(tag ? { tag } : {}),
      ...(featured ? { isFeatured: true } : {}),
    }),
    select: (res) => ({ items: res.data.data, pagination: res.data.pagination }),
  })

  const { data: featuredBlogs = [] } = useQuery({
    queryKey: ['featured-blogs'],
    queryFn: () => blogsApi.getFeatured(2),
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.items || [])
    },
    enabled: page === 1 && !search && !category && !tag,
  })

  const { data: latestBlogs = [] } = useQuery({
    queryKey: ['latest-blogs-sidebar'],
    queryFn: () => blogsApi.getAll({ page: 1, limit: 2, status: 'published' }),
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.items || [])
    },
    enabled: page === 1 && !search && !category && !tag,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('q', searchInput.trim())
  }

  const clearFilters = () => {
    setSearchParams({})
    setSearchInput('')
  }

  const hasFilters = search || category || tag || featured
  const items = data?.items || []
  const showHeroSection = page === 1 && !hasFilters && featuredBlogs.length > 0

  /* Split items at midpoint for banner injection */
  const mid = Math.ceil(items.length / 2)
  const firstHalf = items.slice(0, mid)
  const secondHalf = items.slice(mid)

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

      <SEO
        title="Tips & Insights | Stakepedia Blog"
        description="Tutorials, deep-dives and thoughts on AI tools and productivity. Explore curated articles to supercharge your workflow."
        keywords="AI tools, productivity, tutorials, blog, insights"
        canonicalUrl="https://stakepedia.info/blogs"
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/70 mb-3">
          <FileText className="h-3.5 w-3.5" /> The Blog
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Tips & Insights</h1>
        <p className="text-muted-foreground text-lg">
          Tutorials, deep-dives and thoughts on AI tools and productivity.
        </p>
      </div>

      {/* Hero section */}
      {showHeroSection && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12">
          <div className="lg:col-span-2">
            <HeroBlogCard blog={featuredBlogs[0]} />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Latest post</h2>
            <div className="flex flex-col gap-3 flex-1">
              {latestBlogs.map((blog) => (
                <SidebarBlogCard key={blog._id} blog={blog} />
              ))}
              {latestBlogs.length < 2 && featuredBlogs[1] && (
                <SidebarBlogCard key={featuredBlogs[1]._id} blog={featuredBlogs[1]} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search articles, tips, tutorials..."
          className="w-full h-12 pl-11 pr-32 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg h-8 px-4">
          Search
        </Button>
      </form>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setParam('featured', featured ? '' : 'true')}
          className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5
            ${featured ? 'bg-amber-500 text-white border-amber-500' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-amber-400/40'}`}
        >
          <Sparkles className="h-3 w-3" /> Featured
        </button>

        {tag && (
          <span className="h-8 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-medium flex items-center gap-1.5">
            <Tag className="h-3 w-3" />#{tag}
            <button onClick={() => setParam('tag', '')} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-8 px-3 rounded-lg text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors ml-auto"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      {/* Result count */}
      {data?.pagination && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{data.pagination.total?.toLocaleString()}</span> articles
          </p>
        </div>
      )}

      {/* Article grid with mid-list banners */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* First half */}
          {firstHalf.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}

          {/* Mid-list banners */}
          <NewsletterBanner />
          <CoursesBanner />

          {/* Second half */}
          {secondHalf.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No articles found"
          description="Try a different search or check back later."
        />
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