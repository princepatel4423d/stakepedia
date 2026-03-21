import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Bot, FileText, BookOpen, Zap,
  ArrowRight, Sparkles, Clock, Eye, Star,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PricingBadge from '@/components/shared/PricingBadge'
import { searchApi } from '@/api/search.api'

const TYPE_META = {
  AITool: { icon: Bot, path: 'ai-tools', color: 'text-primary', bg: 'bg-primary/10', label: 'AI Tool' },
  Blog: { icon: FileText, path: 'blogs', color: 'text-violet-600', bg: 'bg-violet-500/10', label: 'Blog' },
  Course: { icon: BookOpen, path: 'courses', color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Course' },
  Prompt: { icon: Zap, path: 'prompts', color: 'text-emerald-600', bg: 'bg-emerald-500/10', label: 'Prompt' },
}

const SECTION_META = {
  AITool: { label: 'AI Tools', icon: Bot, color: 'text-primary', bg: 'bg-primary/10' },
  Blog: { label: 'Blogs', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-500/10' },
  Course: { label: 'Courses', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  Prompt: { label: 'Prompts', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
}

const QUICK_LINKS = [
  { label: 'Free AI Tools', href: '/ai-tools?pricing=free', icon: Bot },
  { label: 'Featured Tools', href: '/ai-tools?featured=true', icon: Sparkles },
  { label: 'Latest Blogs', href: '/blogs', icon: FileText },
  { label: 'Free Courses', href: '/courses?pricing=free', icon: BookOpen },
  { label: 'Top Prompts', href: '/prompts?featured=true', icon: Zap },
]

/* ── Result card ──────────────────────────────────────────── */
function ResultCard({ item }) {
  const meta = TYPE_META[item.type] || TYPE_META.AITool
  const Icon = meta.icon

  return (
    <Link
      to={`/${meta.path}/${item.slug}`}
      className="group flex items-start gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Logo / icon */}
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-border/60 ${meta.bg}`}>
        {item.logo
          ? <img src={item.logo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          : <Icon className={`h-5 w-5 ${meta.color}`} />
        }
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
            {item.name || item.title}
          </h3>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${meta.bg} ${meta.color} border-current/20`}>
            {meta.label}
          </span>
          {item.pricing && <PricingBadge pricing={item.pricing} />}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {item.shortDescription || item.description || item.excerpt || 'No description available.'}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
          {item.averageRating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {item.averageRating.toFixed(1)}
            </span>
          )}
          {item.viewCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />{item.viewCount.toLocaleString()}
            </span>
          )}
          {item.category?.name && (
            <span className="flex items-center gap-1" style={{ color: item.category.color }}>
              {item.category.name}
            </span>
          )}
        </div>
      </div>

      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
    </Link>
  )
}

function ResultCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-border bg-card">
      <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────── */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput] = useState(searchParams.get('q') || '')
  const query = searchParams.get('q') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['global-search', query],
    queryFn: () => searchApi.global({ q: query, limit: 20 }),
    select: (res) => {
      const payload = res.data?.data || {}
      if (Array.isArray(payload.results)) return payload

      // Backward compatibility if API returns grouped object only.
      const groupedLegacy = payload || {}
      const legacyResults = [
        ...(groupedLegacy.AITool || groupedLegacy.tools || []).map((item) => ({ ...item, type: 'AITool' })),
        ...(groupedLegacy.Blog || groupedLegacy.blogs || []).map((item) => ({ ...item, type: 'Blog' })),
        ...(groupedLegacy.Course || groupedLegacy.courses || []).map((item) => ({ ...item, type: 'Course' })),
        ...(groupedLegacy.Prompt || groupedLegacy.prompts || []).map((item) => ({ ...item, type: 'Prompt' })),
      ]

      return {
        results: legacyResults,
        totalCount: legacyResults.length,
      }
    },
    enabled: !!query,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (input.trim()) setSearchParams({ q: input.trim() })
  }

  const results = data?.results || []
  const grouped = {
    AITool: results.filter((r) => r.type === 'AITool'),
    Blog: results.filter((r) => r.type === 'Blog'),
    Course: results.filter((r) => r.type === 'Course'),
    Prompt: results.filter((r) => r.type === 'Prompt'),
  }
  const totalCount = results.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

      {/* ── Header ── */}
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
          {query ? (
            <>Results for <span className="text-primary">"{query}"</span></>
          ) : (
            'Search everything'
          )}
        </h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search AI tools, blogs, courses, prompts..."
            className="w-full h-14 pl-12 pr-32 rounded-2xl border border-border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Result count + type filter pills */}
        {query && !isLoading && totalCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalCount}</span> results
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            {Object.entries(grouped).filter(([, items]) => items.length > 0).map(([type, items]) => {
              const s = SECTION_META[type]
              const Icon = s.icon
              return (
                <a key={type} href={`#${type}`}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-colors ${s.bg} ${s.color} border-current/20`}>
                  <Icon className="h-3 w-3" />{s.label} ({items.length})
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Empty state — no query ── */}
      {!query && (
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Empty prompt */}
          <div className="flex-1 text-center py-16">
            <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Search className="h-9 w-9 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-bold mb-2">Start searching</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Search across AI tools, blog posts, courses and prompts — all in one place.
            </p>
          </div>

          {/* Quick links */}
          <div className="w-full lg:w-72 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Popular pages</p>
            <div className="space-y-2">
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <Link key={label} to={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent transition-all group">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors flex-1">{label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {query && isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <ResultCardSkeleton key={i} />)}
        </div>
      )}

      {/* ── No results ── */}
      {query && !isLoading && totalCount === 0 && (
        <div className="text-center py-16">
          <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
            <Search className="h-9 w-9 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-bold mb-2">No results found</h2>
          <p className="text-muted-foreground text-sm mb-8">
            No results for "<strong>{query}</strong>". Try different keywords.
          </p>
          {/* Suggestion links */}
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_LINKS.map(({ label, href }) => (
              <Link key={label} to={href}
                className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all">
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Results grouped by type ── */}
      {totalCount > 0 && (
        <div className="space-y-10">
          {Object.entries(grouped).filter(([, items]) => items.length > 0).map(([type, items]) => {
            const s = SECTION_META[type]
            const Icon = s.icon
            return (
              <div key={type} id={type} className="scroll-mt-28">
                {/* Section header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                      <Icon className={`h-4.5 w-4.5 ${s.color}`} />
                    </div>
                    <div>
                      <h2 className="font-bold text-base leading-none">{s.label}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{items.length} result{items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <Link to={`/${TYPE_META[type].path}?q=${encodeURIComponent(query)}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1">
                    See all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {items.map((item) => <ResultCard key={item._id} item={item} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}