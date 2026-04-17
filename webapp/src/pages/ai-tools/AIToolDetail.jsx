import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ExternalLink, Star, Eye, Heart, Bot,
  CheckCircle, Shield, Tag, BookOpen, ArrowLeft,
  Copy, Check, Globe, Twitter, Linkedin, Youtube,
  Zap, Code2, Calendar, Building2, Mail, FileText,
  ThumbsUp, ThumbsDown, ChevronDown, ChevronUp,
  Sparkles, TrendingUp, Clock, Users, BadgeCheck,
  AlertCircle, BarChart3, Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import PricingBadge from '@/components/common/PricingBadge'
import StarRating from '@/components/common/StarRating'
import ReviewForm from '@/components/common/ReviewForm'
import EmptyState from '@/components/common/EmptyState'
import { aiToolsApi } from '@/api/aitools.api'
import { reviewsApi } from '@/api/reviews.api'
import { useAuthStore } from '@/store/authStore'
import { formatDate, formatNumber } from '@/lib/utils'
import { toast } from 'sonner'

/* small helpers */

function InfoRow({ label, value, href }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">{value} <ExternalLink className="h-3 w-3" /></a>
        : <span className="text-sm font-medium text-foreground">{value || 'N/A'}</span>
      }
    </div>
  )
}

function SocialLink({ href, icon: Icon, label }) {
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-all">
      <Icon className="h-4 w-4" />
      {label}
    </a>
  )
}

function ProConList({ items, type }) {
  if (!items?.length) return (
    <p className="text-sm text-muted-foreground italic">Not specified yet.</p>
  )
  const isPos = type === 'pro'
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          <span className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isPos ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
            {isPos ? '✓' : '✗'}
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent transition-colors"
      >
        <span className="text-sm font-medium">{question}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border/50 pt-3">
          {answer}
        </div>
      )}
    </div>
  )
}

function PricingPlanCard({ plan }) {
  return (
    <div className={`relative flex flex-col rounded-2xl border p-5 ${plan.isPopular ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-card'}`}>
      {plan.isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wide">
          Most Popular
        </span>
      )}
      <div className="mb-4">
        <h4 className="font-bold text-base">{plan.name}</h4>
        <div className="text-2xl font-extrabold mt-1">{plan.priceLabel}</div>
        {plan.billingNote && <p className="text-xs text-muted-foreground mt-0.5">{plan.billingNote}</p>}
        {plan.description && <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>}
      </div>
      {plan.features?.length > 0 && (
        <ul className="space-y-2 mb-4 flex-1">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}
      {plan.ctaUrl && (
        <a href={plan.ctaUrl} target="_blank" rel="noopener noreferrer">
          <Button variant={plan.isPopular ? 'default' : 'outline'} className="w-full rounded-lg mt-auto">
            Get started <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </a>
      )}
    </div>
  )
}

/* Main component */

export default function AIToolDetail() {
  const { slug } = useParams()
  const [copied, setCopied] = useState(false)
  const user = useAuthStore((s) => s.user)

  const { data: tool, isLoading } = useQuery({
    queryKey: ['aitool-detail', slug],
    queryFn: () => aiToolsApi.getBySlug(slug),
    select: (res) => res.data.data,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['aitool-reviews', tool?._id],
    queryFn: () => reviewsApi.getForTarget('AITool', tool._id),
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.reviews || [])
    },
    enabled: !!tool?._id,
  })

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('URL copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (!tool?._id || !user?._id) return

    const sessionKey = `sp_aitool_view_${user._id}_${tool._id}`
    if (sessionStorage.getItem(sessionKey)) return

    sessionStorage.setItem(sessionKey, 'pending')
    aiToolsApi.trackView(tool._id)
      .then(() => {
        sessionStorage.setItem(sessionKey, '1')
      })
      .catch(() => {
        sessionStorage.removeItem(sessionKey)
      })
  }, [tool?._id, user?._id])

  /* Loading skeleton */
  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 space-y-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
      </div>
    </div>
  )

  if (!tool) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <EmptyState icon={Bot} title="Tool not found" description="This tool may have been removed or the link is incorrect." />
    </div>
  )

  const hasPricingPlans = tool.pricingPlans?.length > 0
  const hasTutorials = tool.tutorials?.length > 0
  const hasFaqs = tool.faqs?.length > 0
  const hasProsCons = tool.pros?.length > 0 || tool.cons?.length > 0
  const hasSocialMedia = Object.values(tool.socialMedia || {}).some(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

      {/* Back */}
      <Link to="/ai-tools" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to AI Tools
      </Link>

      {/* Hero card */}
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden mb-6">
        <div className="relative z-0 h-44 sm:h-72 w-full bg-linear-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">

          {tool.coverImage ? (
            <img
              src={tool.coverImage}
              alt="cover"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/20 to-muted" />
          )}

          <div className="absolute inset-0 z-1 bg-linear-to-b from-transparent via-transparent to-card/65" />
        </div>

      {/* Content below cover */}
      <div className="relative z-10 px-6 pb-6">
        {/* Logo row */}
        <div className="relative z-20 flex items-end justify-between -mt-10 mb-4">
          <div className="h-20 w-20 rounded-2xl border-3 border-background bg-card shadow-lg flex items-center justify-center overflow-hidden shrink-0">
            {tool.logo
              ? <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              : <Bot className="h-9 w-9 text-muted-foreground" />
            }
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mb-1">
            <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-9" onClick={copyUrl}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Share'}
            </Button>
            <a href={tool.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="rounded-lg gap-1.5 h-9">
                Visit <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Name + badges */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">{tool.name}</h1>
          {tool.isVerified && (
            <Badge className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20 border">
              <BadgeCheck className="h-3 w-3" /> Verified
            </Badge>
          )}
          {tool.isFeatured && (
            <Badge className="gap-1 bg-amber-400/10 text-amber-600 border-amber-400/20 border">
              <Sparkles className="h-3 w-3" /> Featured
            </Badge>
          )}
          <PricingBadge pricing={tool.pricing} />
        </div>

        {/* Category */}
        {tool.category && (
          <p className="text-sm font-semibold mb-2" style={{ color: tool.category.color }}>
            {tool.category.name}
          </p>
        )}

        {/* Short desc */}
        <p className="text-muted-foreground text-sm max-w-2xl mb-4">
          {tool.shortDescription || tool.description || 'No description added yet.'}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{formatNumber(tool.viewCount)} views</span>
          </div>
          {tool.averageRating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold">{tool.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({tool.reviewCount} reviews)</span>
            </div>
          )}
          {tool.hasFreeTrial && (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              {tool.freeTrialDays ? `${tool.freeTrialDays}-day free trial` : 'Free trial'}
            </span>
          )}
          {tool.apiAvailable && (
            <span className="inline-flex items-center gap-1 text-violet-600">
              <Code2 className="h-4 w-4" /> API Available
            </span>
          )}
        </div>
      </div>
    </div>

      {/* Two-column layout */ }
  <div className="flex flex-col lg:flex-row gap-6">

    {/* Left: Tabs */}
    <div className="flex-1 min-w-0">
      <Tabs defaultValue="overview">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {tool.features?.length > 0 && <TabsTrigger value="features">Features</TabsTrigger>}
          {hasPricingPlans && <TabsTrigger value="pricing">Pricing</TabsTrigger>}
          {hasProsCons && <TabsTrigger value="proscons">Pros & Cons</TabsTrigger>}
          {tool.promptTips?.length > 0 && <TabsTrigger value="prompts">Prompt Tips</TabsTrigger>}
          {hasTutorials && <TabsTrigger value="tutorials">Tutorials</TabsTrigger>}
          {hasFaqs && <TabsTrigger value="faqs">FAQ</TabsTrigger>}
          <TabsTrigger value="reviews">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          {/* Description */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> About
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {tool.description || 'Description is not available yet.'}
            </p>
          </div>

          {/* Use cases */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Use Cases
            </h2>
            {tool.useCases?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tool.useCases.map((uc, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{uc}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Use cases have not been added yet.</p>}
          </div>

          {/* Pricing details */}
          {tool.pricingDetails && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Pricing Details
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.pricingDetails}</p>
            </div>
          )}

          {/* Tags */}
          {tool.tags?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Link
                    key={tag._id || tag}
                    to={`/ai-tools?tag=${tag.slug || tag}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-xs hover:bg-accent hover:border-primary/30 transition-all"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag.name || tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Screenshots */}
          {tool.screenshots?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold text-base mb-3">Screenshots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tool.screenshots.map((url, i) => (
                  <img key={i} src={url} alt={`Screenshot ${i + 1}`}
                    className="w-full rounded-xl border border-border object-cover hover:opacity-90 transition-opacity cursor-zoom-in"
                    referrerPolicy="no-referrer" />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* FEATURES */}
        {tool.features?.length > 0 && (
          <TabsContent value="features" className="space-y-2">
            {tool.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed">{f}</p>
              </div>
            ))}
          </TabsContent>
        )}

        {/* PRICING PLANS */}
        {hasPricingPlans && (
          <TabsContent value="pricing">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...tool.pricingPlans].sort((a, b) => a.sortOrder - b.sortOrder).map((plan, i) => (
                <PricingPlanCard key={i} plan={plan} />
              ))}
            </div>
          </TabsContent>
        )}

        {/* PROS & CONS */}
        {hasProsCons && (
          <TabsContent value="proscons">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <ThumbsUp className="h-4 w-4" /> Pros
                </h3>
                <ProConList items={tool.pros} type="pro" />
              </div>
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <ThumbsDown className="h-4 w-4" /> Cons
                </h3>
                <ProConList items={tool.cons} type="con" />
              </div>
            </div>
          </TabsContent>
        )}

        {/* PROMPT TIPS */}
        {tool.promptTips?.length > 0 && (
          <TabsContent value="prompts" className="space-y-3">
            {tool.promptTips.map((tip, i) => (
              <div key={i} className="relative group p-4 rounded-xl border border-border bg-muted/30 font-mono text-sm leading-relaxed">
                <span className="absolute top-2 right-2 text-[10px] text-muted-foreground/50 uppercase tracking-wider">Prompt {i + 1}</span>
                {tip}
              </div>
            ))}
          </TabsContent>
        )}

        {/* TUTORIALS */}
        {hasTutorials && (
          <TabsContent value="tutorials" className="space-y-3">
            {[...tool.tutorials].sort((a, b) => a.sortOrder - b.sortOrder).map((tut, i) => (
              <a key={i} href={tut.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent transition-all group">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <Youtube className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">{tut.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {tut.channelName && <span>{tut.channelName}</span>}
                    {tut.durationText && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{tut.durationText}</span>}
                    {tut.level && tut.level !== 'all' && (
                      <Badge variant="outline" className="text-[10px] h-4 capitalize">{tut.level}</Badge>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
              </a>
            ))}
          </TabsContent>
        )}

        {/* FAQs */}
        {hasFaqs && (
          <TabsContent value="faqs" className="space-y-2">
            {tool.faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </TabsContent>
        )}

        {/* REVIEWS */}
        <TabsContent value="reviews" className="space-y-5">
          {/* Rating summary */}
          {tool.averageRating > 0 && (
            <div className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-card">
              <div className="text-center shrink-0">
                <div className="text-4xl font-black">{tool.averageRating.toFixed(1)}</div>
                <StarRating rating={tool.averageRating} size="sm" />
                <p className="text-xs text-muted-foreground mt-1">{tool.reviewCount} reviews</p>
              </div>
            </div>
          )}
          {reviews.length > 0 && (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review._id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={review.user?.avatar} />
                      <AvatarFallback className="text-xs font-semibold">
                        {review.user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold">{review.user?.name}</span>
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-muted-foreground ml-auto">{formatDate(review.createdAt)}</span>
                      </div>
                      {review.title && <p className="text-sm font-medium mb-1">{review.title}</p>}
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <ReviewForm
            targetType="AITool"
            targetId={tool._id}
            queryKey={['aitool-reviews', tool._id]}
          />
        </TabsContent>
      </Tabs>
    </div>

    {/* Right sidebar */}
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">

      {/* Tool info card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-sm">Tool Information</h3>
        <div className="space-y-3">
          <InfoRow label="Company" value={tool.companyName} />
          <InfoRow label="Developer" value={tool.developerName} />
          {tool.foundedYear && <InfoRow label="Founded" value={tool.foundedYear} />}
          <InfoRow label="Headquarters" value={tool.headquarters} />
          {tool.supportEmail && (
            <InfoRow label="Support" value={tool.supportEmail} href={`mailto:${tool.supportEmail}`} />
          )}
          <InfoRow label="API" value={tool.apiAvailable ? '✓ Available' : 'Not available'} />
          {tool.hasFreeTrial && (
            <InfoRow label="Free Trial" value={tool.freeTrialDays ? `${tool.freeTrialDays} days` : 'Yes'} />
          )}
        </div>
        {tool.docsUrl && (
          <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-all mt-2">
            <FileText className="h-4 w-4" /> Documentation
            <ExternalLink className="h-3 w-3 ml-auto" />
          </a>
        )}
      </div>

      {/* Social / links */}
      {hasSocialMedia && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">Links</h3>
          <div className="space-y-2">
            <SocialLink href={tool.socialMedia?.website} icon={Globe} label="Website" />
            <SocialLink href={tool.socialMedia?.x} icon={Twitter} label="X / Twitter" />
            <SocialLink href={tool.socialMedia?.linkedin} icon={Linkedin} label="LinkedIn" />
            <SocialLink href={tool.socialMedia?.youtube} icon={Youtube} label="YouTube" />
          </div>
        </div>
      )}

      {/* Categories */}
      {tool.categories?.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {tool.categories.map((cat) => (
              <Link key={cat._id} to={`/ai-tools?category=${cat._id}`}
                className="px-2.5 py-1 rounded-lg text-xs border border-border hover:border-primary/30 hover:bg-accent transition-all font-medium"
                style={{ color: cat.color }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Prompts linked */}
      {tool.prompts?.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Related Prompts
          </h3>
          <p className="text-sm text-muted-foreground">{tool.prompts.length} prompt{tool.prompts.length !== 1 ? 's' : ''} available</p>
          <Link to={`/prompts?tool=${tool._id}`}>
            <Button variant="outline" size="sm" className="w-full rounded-lg">
              Browse Prompts
            </Button>
          </Link>
        </div>
      )}

      {/* Meta / SEO info (admin debug - only show if meta exists) */}
      {tool.meta?.title && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">SEO Meta</p>
          <p className="text-xs font-medium">{tool.meta.title}</p>
          {tool.meta.description && <p className="text-xs text-muted-foreground">{tool.meta.description}</p>}
        </div>
      )}
    </aside>
  </div>
    </div >
  )
}