/**
 * InListBanners.jsx
 * A collection of mid-list promotional components.
 *
 * USAGE EXAMPLE — BlogsList, CoursesList, AIToolsList, PromptsList:
 *
 *   import {
 *     NewsletterBanner,
 *     SubmitToolBanner,
 *     PromptsBanner,
 *     CoursesBanner,
 *     BlogsBanner,
 *     JoinCommunityBanner,
 *   } from '@/components/shared/InListBanners'
 *
 *   // Inside your list render, split items at the midpoint:
 *   const mid = Math.floor(items.length / 2)
 *   const firstHalf  = items.slice(0, mid)
 *   const secondHalf = items.slice(mid)
 *
 *   return (
 *     <>
 *       {firstHalf.map(item => <Card key={item._id} item={item} />)}
 *       <NewsletterBanner />          // ← injected mid-list
 *       {secondHalf.map(item => <Card key={item._id} item={item} />)}
 *     </>
 *   )
 *
 * Each banner is self-contained and works in any list layout
 * (vertical list OR grid — they all span full width via col-span-full
 *  when used inside a CSS grid).
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Mail, Sparkles, ArrowRight, Zap, BookOpen,
    FileText, Bot, Users, CheckCircle, Star,
    Lightbulb, Send, Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

/* Shared wrapper Handles the col-span-full trick for grid lists */
function BannerWrapper({ children, className = '' }) {
    return (
        <div className={`col-span-full w-full ${className}`}>
            {children}
        </div>
    )
}

/* 1. NEWSLETTER BANNER Best for: BlogsList, AIToolsList (any page) */
export function NewsletterBanner() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!email.trim()) return
        setSent(true)
        toast.success('You\'re subscribed!')
        setEmail('')
    }

    return (
        <BannerWrapper>
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)] pointer-events-none" />
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-center gap-6 px-6 py-8 sm:px-10">
                    {/* Icon */}
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Mail className="h-7 w-7 text-primary" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wide mb-2">
                            <Sparkles className="h-3 w-3" /> Weekly digest
                        </div>
                        <h3 className="font-black text-lg sm:text-xl tracking-tight mb-1">
                            Stay ahead of the AI curve
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Get the best AI tools, prompts and tutorials delivered to your inbox every week. No spam, unsubscribe anytime.
                        </p>
                    </div>

                    {/* Form */}
                    {sent ? (
                        <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-semibold shrink-0">
                            <CheckCircle className="h-4 w-4" /> You're subscribed!
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto shrink-0">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-52"
                            />
                            <Button type="submit" size="sm" className="h-10 px-4 rounded-xl gap-1.5 shrink-0">
                                <Send className="h-3.5 w-3.5" /> Subscribe
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </BannerWrapper>
    )
}

/* 2. SUBMIT A TOOL BANNER Best for: AIToolsList */
export function SubmitToolBanner() {
    return (
        <BannerWrapper>
            <div className="relative rounded-2xl overflow-hidden border border-dashed border-primary/30 bg-primary/3">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_0%_50%,hsl(var(--primary)/0.06),transparent)] pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-center gap-5 px-6 py-7 sm:px-10">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Lightbulb className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-base mb-1">Know an AI tool we haven't listed?</h3>
                        <p className="text-sm text-muted-foreground">
                            Submit it to Stakepedia. Our team reviews every submission and publishes the best ones within 48 hours.
                        </p>
                    </div>

                    <Link to="/contact?subject=tool-submission" className="shrink-0">
                        <Button variant="outline" size="sm" className="rounded-xl gap-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50">
                            <Bot className="h-4 w-4" /> Submit a tool <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </BannerWrapper>
    )
}

/* 3. PROMPTS LIBRARY BANNER Best for: AIToolsList, BlogsList */
export function PromptsBanner() {
    const categories = ['Coding', 'Writing', 'Marketing', 'SEO', 'Design']

    return (
        <BannerWrapper>
            <div className="relative rounded-2xl overflow-hidden border border-border bg-linear-to-br from-amber-500/8 via-card to-card">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

                <div className="relative px-6 py-8 sm:px-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        {/* Icon */}
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
                            <Zap className="h-6 w-6 text-amber-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold uppercase tracking-wide mb-2">
                                1,000+ Prompts
                            </div>
                            <h3 className="font-black text-lg tracking-tight mb-1">Ready-to-use prompt library</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Stop writing prompts from scratch. Copy battle-tested prompts for every AI tool and use case.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat}
                                        to={`/prompts?category=${cat}`}
                                        className="px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-medium hover:bg-amber-500/20 transition-colors"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link to="/prompts" className="shrink-0">
                            <Button className="rounded-xl gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0">
                                Browse prompts <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </BannerWrapper>
    )
}

/* 4. COURSES BANNER Best for: BlogsList, PromptsList, AIToolsList */
export function CoursesBanner() {
    const highlights = ['Beginner to advanced', 'Free & paid courses', 'Video lessons', 'Certificates']

    return (
        <BannerWrapper>
            <div className="relative rounded-2xl overflow-hidden border border-border bg-linear-to-br from-violet-500/8 via-card to-card">
                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-center gap-6 px-6 py-8 sm:px-10">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-2xl bg-violet-500/15 flex items-center justify-center shrink-0">
                        <BookOpen className="h-6 w-6 text-violet-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 text-[10px] font-bold uppercase tracking-wide mb-2">
                            50+ Courses
                        </div>
                        <h3 className="font-black text-lg tracking-tight mb-1">Learn AI from scratch or level up</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Structured courses taught by AI practitioners. Go from zero to productive in days, not months.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {highlights.map((h) => (
                                <span key={h} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {h}
                                </span>
                            ))}
                        </div>
                    </div>

                    <Link to="/courses" className="shrink-0">
                        <Button className="rounded-xl gap-2 bg-violet-600 hover:bg-violet-700 text-white border-0">
                            View courses <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </BannerWrapper>
    )
}

/* 5. BLOGS BANNER Best for: AIToolsList, CoursesList, PromptsList */
export function BlogsBanner() {
    return (
        <BannerWrapper>
            <div className="relative rounded-2xl overflow-hidden border border-border bg-linear-to-br from-emerald-500/8 via-card to-card">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-center gap-6 px-6 py-7 sm:px-10">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 text-emerald-600" />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-black text-lg tracking-tight mb-1">Expert tips & deep-dives</h3>
                        <p className="text-sm text-muted-foreground">
                            Our editorial team publishes in-depth tutorials, tool comparisons and AI workflow guides every week.
                        </p>
                    </div>

                    <Link to="/blogs" className="shrink-0">
                        <Button variant="outline" className="rounded-xl gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10">
                            Read the blog <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </BannerWrapper>
    )
}

/* 6. JOIN COMMUNITY / REGISTER BANNER Best for: any listing page (unauthenticated users) */
export function JoinCommunityBanner() {
    return (
        <BannerWrapper>
            <div className="relative rounded-2xl overflow-hidden bg-primary text-primary-foreground">
                {/* Grid texture */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.04)_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-24 w-64 bg-white/5 blur-2xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-center gap-6 px-6 py-8 sm:px-10">
                    {/* Avatar stack */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex -space-x-3">
                            {['A', 'B', 'C', 'D'].map((l, i) => (
                                <div
                                    key={l}
                                    className="h-10 w-10 rounded-full border-2 border-primary bg-primary-foreground/20 flex items-center justify-center text-xs font-bold text-primary-foreground"
                                    style={{ zIndex: 4 - i }}
                                >
                                    {l}
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-primary-foreground/70">
                            <p className="font-bold text-primary-foreground">10,000+</p>
                            <p>users joined</p>
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-black text-xl tracking-tight mb-1">
                            Join the Stakepedia community
                        </h3>
                        <p className="text-primary-foreground/70 text-sm">
                            Save tools, write reviews, track courses and get personalised AI recommendations — all for free.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <Link to="/register">
                            <Button size="sm" className="rounded-xl h-10 px-5 bg-white text-primary font-bold hover:bg-white/90 gap-2 shadow-lg">
                                Get started free <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="sm" variant="outline" className="rounded-xl h-10 px-5 border-white/20 text-primary-foreground hover:bg-white/10">
                                Sign in
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </BannerWrapper>
    )
}

/* 7. FEATURED TOOLS STRIP — shows 3 tool pills inline Best for: BlogsList, CoursesList, PromptsList */
export function FeaturedToolsStrip({ tools = [] }) {
    if (!tools.length) return null
    return (
        <BannerWrapper>
            <div className="rounded-2xl border border-border bg-card px-6 py-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Editor's picks</p>
                        <p className="text-sm font-bold">Top AI tools this week</p>
                    </div>
                    <div className="flex flex-1 flex-wrap gap-2">
                        {tools.slice(0, 4).map((tool) => (
                            <Link
                                key={tool._id}
                                to={`/ai-tools/${tool.slug}`}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/50 hover:border-primary/30 hover:bg-accent transition-all text-xs font-medium group"
                            >
                                <div className="h-5 w-5 rounded-md bg-card border border-border overflow-hidden shrink-0">
                                    {tool.logo
                                        ? <img src={tool.logo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                        : <Bot className="h-3 w-3 text-muted-foreground m-auto mt-1" />}
                                </div>
                                <span className="group-hover:text-primary transition-colors">{tool.name}</span>
                            </Link>
                        ))}
                    </div>
                    <Link to="/ai-tools" className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
                        All tools <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </BannerWrapper>
    )
}

/* 8. RATING / REVIEW CTA BANNER Best for: AIToolsList, CoursesList (after a few results) */
export function ReviewsBanner() {
    return (
        <BannerWrapper>
            <div className="rounded-2xl border border-border bg-card px-6 py-6 sm:px-10">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Stars illustration */}
                    <div className="flex items-center gap-1 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-7 w-7 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/30 text-amber-400/30'}`} />
                        ))}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-base mb-1">Tried one of these? Leave a review.</h3>
                        <p className="text-sm text-muted-foreground">
                            Your honest reviews help thousands of people pick the right AI tool. It only takes 30 seconds.
                        </p>
                    </div>

                    <Link to="/register" className="shrink-0">
                        <Button variant="outline" size="sm" className="rounded-xl gap-2">
                            <Star className="h-3.5 w-3.5" /> Write a review
                        </Button>
                    </Link>
                </div>
            </div>
        </BannerWrapper>
    )
}