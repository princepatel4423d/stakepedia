import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search, X, Bot, Star, Eye, Zap, ArrowRight,
  SlidersHorizontal, ChevronDown, Sparkles, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import PricingBadge from '@/components/shared/PricingBadge'
import StarRating from '@/components/shared/StarRating'
import Pagination from '@/components/shared/Pagination'
import EmptyState from '@/components/shared/EmptyState'
import { SubmitToolBanner, NewsletterBanner } from '@/components/shared/Banners'
import { aiToolsApi } from '@/api/aitools.api'
import { categoriesApi } from '@/api/categories.api'

const PRICING_COLORS = {
  free: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  freemium: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  paid: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  'open-source': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  contact: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

function ToolCard({ tool }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/ai-tools/${tool.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      {/* Featured ribbon */}
      {tool.isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-600 text-[10px] font-semibold uppercase tracking-wide">
            <Sparkles className="h-2.5 w-2.5" /> Featured
          </span>
        </div>
      )}

      {/* Cover image or gradient banner */}
      <div className="relative h-28 w-full overflow-hidden bg-linear-to-br from-primary/5 via-primary/3 to-transparent border-b border-border/40">
        {tool.coverImage ? (
          <img src={tool.coverImage} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300" referrerPolicy="no-referrer" />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/8 to-transparent" />
        )}
        {/* Logo floated */}
        <div className="absolute left-4 bottom-0 translate-y-1/2">
          <div className="h-12 w-12 rounded-xl border-2 border-background bg-card shadow-md flex items-center justify-center overflow-hidden">
            {tool.logo
              ? <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              : <Bot className="h-6 w-6 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-4 pt-8 pb-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            {tool.category && (
              <span className="text-[11px] font-medium" style={{ color: tool.category.color || '#6366f1' }}>
                {tool.category.name}
              </span>
            )}
          </div>
          <PricingBadge pricing={tool.pricing} className="shrink-0" />
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {tool.shortDescription || tool.description || 'No description available.'}
        </p>

        {/* Tags */}
        {tool.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag) => (
              <span key={tag._id || tag} className="px-1.5 py-0.5 text-[10px] rounded-md bg-muted text-muted-foreground">
                {tag.name || tag}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-muted text-muted-foreground">+{tool.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
          <StarRating rating={tool.averageRating || 0} showValue size="sm" />
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" />
            {(tool.viewCount || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </Link>
  )
}

function ToolCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="px-4 pt-8 pb-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

export default function AIToolsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const pricing = searchParams.get('pricing') || ''
  const sort = searchParams.get('sort') || 'newest'
  const apiAvailable = searchParams.get('api') || ''
  const featured = searchParams.get('featured') || ''

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['public-aitools', page, search, category, pricing, sort, apiAvailable, featured],
    queryFn: () => aiToolsApi.getAll({
      page, limit: 12, search, category, pricing,
      status: 'published',
      ...(apiAvailable ? { apiAvailable: true } : {}),
      ...(featured ? { isFeatured: true } : {}),
      sort: sort === 'rating' ? '-averageRating' : sort === 'popular' ? '-viewCount' : sort === 'liked' ? '-likeCount' : '-createdAt',
    }),
    select: (res) => ({ items: res.data.data, pagination: res.data.pagination }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-filter'],
    queryFn: () => categoriesApi.getAll({ limit: 100 }),
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.items || [])
    },
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('q', searchInput.trim())
  }

  const clearFilters = () => {
    setSearchParams({})
    setSearchInput('')
  }

  const hasFilters = search || category || pricing || sort !== 'newest' || apiAvailable || featured
  const items = data?.items || []
  const activeFilterCount = [search, category, pricing, apiAvailable, featured].filter(Boolean).length + (sort !== 'newest' ? 1 : 0)

  /* ── Split items at midpoint for banner injection ── */
  const mid = Math.ceil(items.length / 2)
  const firstHalf = items.slice(0, mid)
  const secondHalf = items.slice(mid)

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/70 mb-3">
          <Zap className="h-3.5 w-3.5" />
          AI Tools Directory
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          Discover AI Tools
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Explore {data?.pagination?.total?.toLocaleString() || '...'} curated AI tools to supercharge your workflow.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search tools by name, description, or tag..."
          className="w-full h-12 pl-11 pr-32 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg h-8 px-4">
          Search
        </Button>
      </form>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {/* Category */}
        <Select value={category || 'all'} onValueChange={(v) => setParam('category', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-9 rounded-lg text-xs border-border bg-card w-auto min-w-32">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Pricing */}
        <Select value={pricing || 'all'} onValueChange={(v) => setParam('pricing', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-9 rounded-lg text-xs border-border bg-card w-auto min-w-28">
            <SelectValue placeholder="Pricing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pricing</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="freemium">Freemium</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="open-source">Open Source</SelectItem>
            <SelectItem value="contact">Contact Sales</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => setParam('sort', v)}>
          <SelectTrigger className="h-9 rounded-lg text-xs border-border bg-card w-auto min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="liked">Most Liked</SelectItem>
          </SelectContent>
        </Select>

        {/* Toggle chips */}
        <button
          onClick={() => setParam('api', apiAvailable ? '' : 'true')}
          className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all ${apiAvailable ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
        >
          API Available
        </button>
        <button
          onClick={() => setParam('featured', featured ? '' : 'true')}
          className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${featured ? 'bg-amber-500 text-white border-amber-500' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-amber-400/30'}`}
        >
          <Sparkles className="h-3 w-3" /> Featured
        </button>

        {hasFilters && (
          <button onClick={clearFilters} className="h-9 px-3 rounded-lg text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors ml-auto">
            <X className="h-3.5 w-3.5" /> Clear all
            {activeFilterCount > 0 && (
              <span className="ml-1 h-4 w-4 rounded-full bg-destructive/20 text-destructive text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Results count */}
      {data?.pagination && (
        <p className="text-sm text-muted-foreground mb-5">
          Showing <span className="font-medium text-foreground">{items.length}</span> of{' '}
          <span className="font-medium text-foreground">{data.pagination.total?.toLocaleString()}</span> tools
        </p>
      )}

      {/* Grid with mid-list banners */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <ToolCardSkeleton key={i} />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* First half */}
          {firstHalf.map((tool) => (
            <ToolCard key={tool._id} tool={tool} />
          ))}

          {/* ── Mid-list banners ── */}
          <SubmitToolBanner />
          <NewsletterBanner />

          {/* Second half */}
          {secondHalf.map((tool) => (
            <ToolCard key={tool._id} tool={tool} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Bot} title="No tools found" description="Try adjusting your search or filters to discover more tools." />
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