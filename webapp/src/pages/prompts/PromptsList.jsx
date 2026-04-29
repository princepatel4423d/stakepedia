import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search, Zap, Heart, Copy, Check, X,
  Sparkles, Tag, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import Pagination from '@/components/common/Pagination'
import EmptyState from '@/components/common/EmptyState'
import { CoursesBanner, JoinCommunityBanner } from '@/components/common/Banners'
import { promptsApi } from '@/api/prompts.api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import SEO from '@/components/common/SEO'

function PromptCard({ prompt }) {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [copied, setCopied] = useState(false)

  const likeMutation = useMutation({
    mutationFn: () => promptsApi.toggleLike(prompt._id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['public-prompts'] }),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const handleCopy = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(prompt.content)
    setCopied(true)
    toast.success('Prompt copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLike = (e) => {
    e.preventDefault()
    user ? likeMutation.mutate() : toast.error('Sign in to like')
  }

  return (
    <Link
      to={`/prompts/${prompt.slug}`}
      className="group flex flex-col rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-border/40">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {prompt.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-primary/8 text-primary border border-primary/15">
              {prompt.category || 'General'}
            </span>
            {prompt.tool && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {prompt.tool.logo && (
                  <img src={prompt.tool.logo} alt="" className="h-3.5 w-3.5 rounded object-cover" referrerPolicy="no-referrer" />
                )}
                {prompt.tool.name}
              </span>
            )}
            {prompt.isFeatured && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold">
                <Sparkles className="h-2.5 w-2.5" /> Featured
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleLike}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors">
            <Heart className={`h-3.5 w-3.5 ${prompt.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </button>
          <button onClick={handleCopy}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors">
            {copied
              ? <Check className="h-3.5 w-3.5 text-emerald-500" />
              : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      <div className="px-4 py-3 flex-1">
        <p className="text-xs font-mono text-muted-foreground line-clamp-4 leading-relaxed whitespace-pre-wrap">
          {prompt.content || 'Content not available.'}
        </p>
      </div>

      <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-border/40 mt-auto">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{(prompt.usageCount || 0).toLocaleString()} uses</span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />{prompt.likeCount || 0}
          </span>
          {prompt.variables?.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-medium">
              {prompt.variables.length} var{prompt.variables.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-[11px] text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

function PromptCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border/40 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-border/40">
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export default function PromptsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const featured = searchParams.get('featured') || ''

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['public-prompts', page, search, category, featured],
    queryFn: () => promptsApi.getAll({
      page, limit: 15, search, category, status: 'published',
      ...(featured ? { isFeatured: true } : {}),
    }),
    select: (res) => ({ items: res.data.data, pagination: res.data.pagination }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['prompt-categories'],
    queryFn: promptsApi.getCategories,
    select: (res) => res.data.data || [],
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('q', searchInput.trim())
  }

  const clearFilters = () => {
    setSearchParams({})
    setSearchInput('')
  }

  const hasFilters = search || category || featured
  const items = data?.items || []

  /* ── Split items at midpoint for banner injection ── */
  const mid = Math.ceil(items.length / 2)
  const firstHalf = items.slice(0, mid)
  const secondHalf = items.slice(mid)

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

      <SEO
        title="Prompt Library | Stakepedia"
        description="Browse 1000+ ready-to-use AI prompts for coding, writing, marketing, SEO and more. Copy and use instantly with variable support."
        keywords="AI prompts, prompt library, ChatGPT prompts, copy prompts, AI workflow"
        canonicalUrl="https://stakepedia.info/prompts"
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/70 mb-3">
          <Zap className="h-3.5 w-3.5" /> Prompt Library
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Prompts</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Ready-to-use prompts to supercharge your AI workflow.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search prompts by title or content..."
          className="w-full h-12 pl-11 pr-32 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg h-8 px-4">
          Search
        </Button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {categories.length > 0 && (
          <Select value={category || 'all'} onValueChange={(v) => setParam('category', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-9 rounded-lg text-xs border-border bg-card w-auto min-w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <button
          onClick={() => setParam('featured', featured ? '' : 'true')}
          className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5
            ${featured ? 'bg-amber-500 text-white border-amber-500' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-amber-400/30'}`}
        >
          <Sparkles className="h-3 w-3" /> Featured
        </button>

        {category && (
          <span className="h-9 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-medium flex items-center gap-1.5">
            <Tag className="h-3 w-3" />{category}
            <button onClick={() => setParam('category', '')} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {hasFilters && (
          <button onClick={clearFilters}
            className="h-9 px-3 rounded-lg text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors ml-auto">
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Count */}
      {data?.pagination && (
        <p className="text-sm text-muted-foreground mb-5">
          <span className="font-medium text-foreground">{data.pagination.total?.toLocaleString()}</span> prompts available
        </p>
      )}

      {/* Grid with mid-list banners */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <PromptCardSkeleton key={i} />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First half */}
          {firstHalf.map((prompt) => (
            <PromptCard key={prompt._id} prompt={prompt} />
          ))}

          {/* ── Mid-list banners ── */}
          <CoursesBanner />
          <JoinCommunityBanner />

          {/* Second half */}
          {secondHalf.map((prompt) => (
            <PromptCard key={prompt._id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Zap} title="No prompts found" description="Try a different search or category." />
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