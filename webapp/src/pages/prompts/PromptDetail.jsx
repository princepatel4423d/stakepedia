import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Copy, Check, Heart, Zap, Tag,
  Sparkles, Star, ExternalLink, RotateCcw,
  ChevronRight, Bot, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReviewForm from '@/components/common/ReviewForm'
import EmptyState from '@/components/common/EmptyState'
import StarRating from '@/components/common/StarRating'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { promptsApi } from '@/api/prompts.api'
import { reviewsApi } from '@/api/reviews.api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import SEO from '@/components/common/SEO'

export default function PromptDetail() {
  const { slug } = useParams()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [copied, setCopied] = useState(false)
  const [filledVars, setFilledVars] = useState({})

  const { data: prompt, isLoading } = useQuery({
    queryKey: ['prompt-detail', slug],
    queryFn: () => promptsApi.getBySlug(slug),
    select: (res) => res.data.data,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['prompt-reviews', prompt?._id],
    queryFn: () => reviewsApi.getForTarget('Prompt', prompt._id),
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.reviews || [])
    },
    enabled: !!prompt?._id,
  })

  const likeMutation = useMutation({
    mutationFn: () => promptsApi.toggleLike(prompt._id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prompt-detail', slug] }),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const variables = prompt?.variables || []

  const getFilledContent = () => {
    if (!prompt?.content) return ''
    return prompt.content.replace(/\{\{(\w+)\}\}/g, (_, key) => filledVars[key] || `{{${key}}}`)
  }

  const allVarsFilled = variables.every((v) => filledVars[v.name]?.trim())

  useEffect(() => {
    if (!prompt?._id || !user?._id) return

    const sessionKey = `sp_prompt_usage_${user._id}_${prompt._id}`
    if (sessionStorage.getItem(sessionKey)) return

    // Mark early to prevent duplicate calls during rapid rerenders.
    sessionStorage.setItem(sessionKey, 'pending')

    promptsApi.trackUsage(prompt._id)
      .then(() => {
        sessionStorage.setItem(sessionKey, '1')
        qc.invalidateQueries({ queryKey: ['prompt-detail', slug] })
        qc.invalidateQueries({ queryKey: ['public-prompts'] })
      })
      .catch(() => {
        sessionStorage.removeItem(sessionKey)
      })
  }, [prompt?._id, qc, slug, user?._id])

  const handleCopy = () => {
    navigator.clipboard.writeText(getFilledContent())
    setCopied(true)
    toast.success('Prompt copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setFilledVars({})
    toast.success('Variables cleared')
  }

  // highlight {{variables}} in the preview
  const renderHighlightedContent = () => {
    const content = getFilledContent()
    const parts = content.split(/(\{\{[^}]+\}\})/g)
    return parts.map((part, i) => {
      if (/^\{\{[^}]+\}\}$/.test(part)) {
        return (
          <span key={i} className="px-1 py-0.5 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 font-semibold">
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  /* Loading */
  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <Skeleton className="h-4 w-28 mb-8" />
      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="w-64 shrink-0 space-y-3 hidden lg:block">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
        </div>
      </div>
    </div>
  )

  if (!prompt) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <EmptyState icon={Zap} title="Prompt not found" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

      <SEO
        title={`${prompt.title} | Stakepedia Prompts`}
        description={prompt.description || `${prompt.category || 'AI'} prompt with ${prompt.variables?.length || 0} variables. Used ${(prompt.usageCount || 0).toLocaleString()} times on Stakepedia.`}
        keywords={prompt.tags?.map((t) => t.name || t).join(', ')}
        canonicalUrl={`https://stakepedia.info/prompts/${prompt.slug}`}
        ogType="article"
      />

      {/* Back */}
      <Link to="/prompts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Prompts
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT - Main content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide bg-primary/8 text-primary border border-primary/15">
                {prompt.category || 'General'}
              </span>
              {prompt.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-600 text-[10px] font-semibold uppercase tracking-wide">
                  <Sparkles className="h-2.5 w-2.5" /> Featured
                </span>
              )}
              {prompt.tool && (
                <Link to={`/ai-tools/${prompt.tool.slug}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border hover:border-primary/30 hover:bg-accent text-xs text-muted-foreground hover:text-foreground transition-all">
                  {prompt.tool.logo && <img src={prompt.tool.logo} alt="" className="h-3.5 w-3.5 rounded object-cover" referrerPolicy="no-referrer" />}
                  {prompt.tool.name}
                  <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">{prompt.title}</h1>
            {prompt.description && (
              <p className="text-muted-foreground leading-relaxed text-sm">{prompt.description}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="text-muted-foreground">{(prompt.usageCount || 0).toLocaleString()} uses</span>
              <button
                onClick={() => user ? likeMutation.mutate() : toast.error('Sign in to like')}
                className={`flex items-center gap-1.5 transition-colors ${prompt.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                disabled={likeMutation.isPending}
              >
                <Heart className={`h-4 w-4 ${prompt.isLiked ? 'fill-red-500' : ''}`} />
                {prompt.likeCount || 0} likes
              </button>
            </div>
          </div>

          {/* Variable inputs */}
          {variables.length > 0 && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-amber-400/20 text-amber-600 text-[10px] font-bold flex items-center justify-center">{variables.length}</span>
                  Fill in variables
                </h3>
                {Object.keys(filledVars).some((k) => filledVars[k]) && (
                  <button onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {variables.map((v) => (
                  <div key={v.name} className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-medium">
                      <code className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 font-mono text-[11px]">
                        {`{{${v.name}}}`}
                      </code>
                      {v.description && <span className="text-muted-foreground font-normal truncate">{v.description}</span>}
                    </label>
                    <input
                      value={filledVars[v.name] || ''}
                      onChange={(e) => setFilledVars({ ...filledVars, [v.name]: e.target.value })}
                      placeholder={v.example || `Enter ${v.name}...`}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/50 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt content */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/60" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/60" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/60" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Prompt</span>
                {variables.length > 0 && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${allVarsFilled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    {allVarsFilled ? '✓ Ready to copy' : `${variables.filter(v => !filledVars[v.name]?.trim()).length} vars missing`}
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-lg h-7 text-xs" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 min-h-30">
              {renderHighlightedContent()}
            </div>
          </div>

          {/* Tags */}
          {prompt.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <Link key={tag._id || tag} to={`/prompts?tag=${tag.slug || tag}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all">
                  <Tag className="h-2.5 w-2.5" />{tag.name || tag}
                </Link>
              ))}
            </div>
          )}

          {/* Reviews */}
          <div className="pt-4">
            <Tabs defaultValue="reviews">
              <TabsList className="mb-5">
                <TabsTrigger value="reviews">
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="reviews" className="space-y-5">
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
                  targetType="Prompt"
                  targetId={prompt._id}
                  queryKey={['prompt-reviews', prompt._id]}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* RIGHT - Sidebar */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-4">

          {/* Quick actions */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</h3>
            <Button className="w-full gap-2 rounded-xl" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy prompt'}
            </Button>
            <Button
              variant={prompt.isLiked ? 'default' : 'outline'}
              className="w-full gap-2 rounded-xl"
              onClick={() => user ? likeMutation.mutate() : toast.error('Sign in to like')}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 ${prompt.isLiked ? 'fill-current' : ''}`} />
              {prompt.isLiked ? 'Liked' : 'Like'} · {prompt.likeCount || 0}
            </Button>
          </div>

          {/* Prompt info */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Details</h3>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Category', value: prompt.category || 'General' },
                { label: 'Uses', value: (prompt.usageCount || 0).toLocaleString() },
                { label: 'Likes', value: prompt.likeCount || 0 },
                { label: 'Variables', value: variables.length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className="font-medium text-xs">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Linked AI tool */}
          {prompt.tool && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" /> AI Tool
              </h3>
              <Link to={`/ai-tools/${prompt.tool.slug}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-accent transition-all group">
                <div className="h-9 w-9 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {prompt.tool.logo
                    ? <img src={prompt.tool.logo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    : <Bot className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{prompt.tool.name}</p>
                  <p className="text-[11px] text-muted-foreground">View tool</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
              </Link>
            </div>
          )}

          {/* Variables reference */}
          {variables.length > 0 && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70 mb-3">Variables</h3>
              <div className="space-y-2">
                {variables.map((v) => (
                  <div key={v.name} className="space-y-0.5">
                    <code className="text-[11px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 font-mono">
                      {`{{${v.name}}}`}
                    </code>
                    {v.description && <p className="text-[11px] text-muted-foreground pl-1">{v.description}</p>}
                    {v.example && <p className="text-[11px] text-muted-foreground/60 pl-1 italic">e.g. {v.example}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {prompt.tags?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map((tag) => (
                  <Link key={tag._id || tag} to={`/prompts?tag=${tag.slug || tag}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all">
                    #{tag.name || tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}