import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
    Bot, Users, Target, Sparkles, ArrowRight,
    Globe, BookOpen, Zap, FileText, CheckCircle,
    TrendingUp, Heart, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { aiToolsApi } from '@/api/aitools.api'
import { coursesApi } from '@/api/courses.api'
import { promptsApi } from '@/api/prompts.api'
import { statsApi } from '@/api/stats.api'
import { blogsApi } from '@/api/blogs.api'
import SEO from '@/components/common/SEO'

const VALUES = [
    {
        icon: Target,
        title: 'Curation over quantity',
        description: 'We hand-review every AI tool before it goes live. Our team tests for real-world usefulness, not just feature lists. You get signal, not noise.',
        color: 'text-primary bg-primary/10',
    },
    {
        icon: Users,
        title: 'Community-first',
        description: 'Stakepedia is built with its community. User reviews, ratings and feedback shape our rankings and drive new listings. Every voice counts.',
        color: 'text-violet-600 bg-violet-500/10',
    },
    {
        icon: Sparkles,
        title: 'Always up to date',
        description: 'The AI landscape changes weekly. Our editorial team tracks launches, updates and shutdowns so you never rely on outdated information.',
        color: 'text-amber-600 bg-amber-500/10',
    },
    {
        icon: Globe,
        title: 'Free and open',
        description: "Core discovery is free forever. We believe access to good AI information shouldn't be paywalled. Premium features support the mission.",
        color: 'text-emerald-600 bg-emerald-500/10',
    },
]

const TIMELINE = [
    { year: '2023', event: 'Stakepedia founded with 50 hand-picked AI tools and a simple mission: help people navigate the AI explosion.' },
    { year: 'Q2 2023', event: 'Reached 500 registered users. Launched user reviews and ratings system after community requests.' },
    { year: 'Q4 2023', event: 'Crossed 200 listed tools. Launched Prompt Library with 100+ curated prompts for popular AI tools.' },
    { year: 'Q1 2024', event: 'Introduced Courses section. First cohort of 10 AI skills courses published with 2,000+ enrollments in 30 days.' },
    { year: '2024', event: '10,000+ active users. Expanded to cover AI news, tutorials and a weekly newsletter with 5,000 subscribers.' },
]

export default function About() {

    const { data: toolsSummary } = useQuery({
        queryKey: ['tools-summary-about'],
        queryFn: () => aiToolsApi.getAll({ page: 1, limit: 1, status: 'published' }),
        select: (res) => ({ total: res.data?.pagination?.total || 0 }),
    })

    const { data: coursesSummary } = useQuery({
        queryKey: ['courses-summary-about'],
        queryFn: () => coursesApi.getAll({ page: 1, limit: 1, status: 'published' }),
        select: (res) => ({ total: res.data?.pagination?.total || 0 }),
    })

    const { data: promptsSummary } = useQuery({
        queryKey: ['prompts-summary-about'],
        queryFn: () => promptsApi.getAll({ page: 1, limit: 1, status: 'published' }),
        select: (res) => ({ total: res.data?.pagination?.total || 0 }),
    })

    const { data: blogsSummary } = useQuery({
        queryKey: ['blogs-summary-about'],
        queryFn: () => blogsApi.getAll({ page: 1, limit: 1, status: 'published' }),
        select: (res) => ({ total: res.data?.pagination?.total || 0 }),
    })

    const { data: publicStats } = useQuery({
        queryKey: ['public-stats-about'],
        queryFn: () => statsApi.getPublic(),
        select: (res) => res.data?.data || null,
    })

    const formatCount = (num, fallback = '0') => {
        const n = Number(num)
        if (!Number.isFinite(n) || n <= 0) return fallback
        if (n >= 1000000) return `${Math.floor(n / 100000) / 10}M+`
        if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`
        return `${n}+`
    }

    const STATS = [
        { value: formatCount(toolsSummary?.total, '500+'), label: 'AI Tools listed', icon: Bot },
        { value: formatCount(coursesSummary?.total, '50+'), label: 'Courses available', icon: BookOpen },
        { value: formatCount(promptsSummary?.total, '1,000+'), label: 'Prompts in library', icon: Zap },
        { value: formatCount(publicStats?.users?.total, '10K+'), label: 'Active users', icon: Users },
    ]

    const RESOURCE_GRID = [
        { icon: Bot, label: 'AI Tools', count: formatCount(toolsSummary?.total, '500+'), color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
        { icon: BookOpen, label: 'Courses', count: formatCount(coursesSummary?.total, '50+'), color: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
        { icon: Zap, label: 'Prompts', count: formatCount(promptsSummary?.total, '1K+'), color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { icon: FileText, label: 'Blog posts', count: formatCount(blogsSummary?.total, '200+'), color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    ]

    return (
        <div className="pt-6">

            <SEO
                title="About Us | Stakepedia"
                description="Stakepedia was built to help people navigate the AI revolution. Learn about our mission, values and the story behind the most trusted AI tools directory."
                keywords="about Stakepedia, AI tools directory, our mission, AI resource hub"
                canonicalUrl="https://stakepedia.info/about"
            />

            {/* HERO */}
            <section className="relative py-12 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-size-[64px_64px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.1),transparent)]" />
                    <div className="absolute top-0 left-1/3 h-72 w-72 rounded-full bg-primary/8 blur-[80px]" />
                    <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-blue-500/6 blur-[80px]" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        Our story
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight tracking-tight">
                        We help people navigate<br />
                        <span className="text-primary">the AI revolution</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Stakepedia was born out of frustration. Finding the right AI tool for the job was a part-time job in itself - scattered reviews, outdated lists, no reliable signal. We built the resource we wished existed.
                    </p>
                </div>
            </section>

            {/* STATS */}
            <section className="border-y border-border bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {STATS.map(({ value, label, icon: Icon }) => (
                            <div key={label} className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold leading-none">{value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MISSION */}
            <section className="py-14">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3">Why we exist</p>
                            <h2 className="text-4xl font-black mb-6 tracking-tight">Our mission</h2>
                            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                                <p>
                                    AI is transforming every industry. But the landscape is moving faster than any single person can track — new tools launch daily, capabilities evolve weekly, and hype often outpaces reality.
                                </p>
                                <p>
                                    Stakepedia's mission is simple: be the most trusted, most useful resource for anyone trying to understand and use AI tools effectively. Not the biggest list. The best-curated one.
                                </p>
                                <p>
                                    We combine expert editorial judgment with real user feedback to give you the clearest picture of what works, what doesn't and what's worth your time.
                                </p>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-3">
                                {['Expert-curated', 'Community-driven', 'Always free', 'Updated daily'].map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/50 text-xs font-medium">
                                        <CheckCircle className="h-3 w-3 text-emerald-500" /> {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Resource grid with real counts */}
                        <div className="grid grid-cols-2 gap-4">
                            {RESOURCE_GRID.map(({ icon: Icon, label, count, color, bg, border }) => (
                                <div key={label} className={`p-6 rounded-2xl border ${border} ${bg} flex flex-col gap-4 hover:-translate-y-0.5 transition-transform`}>
                                    <div className="h-11 w-11 rounded-xl bg-background/60 flex items-center justify-center">
                                        <Icon className={`h-5 w-5 ${color}`} />
                                    </div>
                                    <div>
                                        <p className={`text-3xl font-black ${color} leading-none`}>{count}</p>
                                        <p className="text-sm text-muted-foreground mt-1 font-medium">{label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* VALUES */}
            <section className="py-14 bg-muted/20 border-y border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3">Principles</p>
                        <h2 className="text-4xl font-black mb-3 tracking-tight">What we stand for</h2>
                        <p className="text-muted-foreground max-w-md mx-auto text-sm">The principles that guide every decision we make.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {VALUES.map(({ icon: Icon, title, description, color }) => (
                            <div key={title} className="group flex gap-5 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">{title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ TIMELINE ═══════════════════════════════════════════ */}
            <section className="py-14">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3">History</p>
                        <h2 className="text-4xl font-black mb-3 tracking-tight">Our journey</h2>
                        <p className="text-muted-foreground text-sm">From side project to trusted AI resource.</p>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <div className="absolute left-22 top-3 bottom-3 w-px bg-linear-to-b from-primary/40 via-border to-transparent" />
                            <div className="space-y-6">
                                {TIMELINE.map(({ year, event }) => (
                                    <div key={year} className="flex gap-6 items-start group">
                                        <div className="w-19 shrink-0 flex justify-end pt-0.5">
                                            <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full whitespace-nowrap">
                                                {year}
                                            </span>
                                        </div>
                                        <div className="relative shrink-0 mt-2">
                                            <div className="h-3 w-3 rounded-full bg-primary border-2 border-background shadow-sm shadow-primary/30 group-hover:scale-125 transition-transform" />
                                        </div>
                                        <div className="flex-1 pb-2">
                                            <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group-hover:shadow-sm">
                                                <p className="text-sm text-muted-foreground leading-relaxed">{event}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-14 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-primary" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.04)_1px,transparent_1px)] bg-size-[40px_40px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-full max-w-lg bg-white/5 blur-[80px] rounded-full" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-primary-foreground/80 text-xs font-semibold mb-6 border border-white/10">
                        <Heart className="h-3 w-3" /> Join the community
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-primary-foreground mb-5 tracking-tight">
                        Want to contribute?
                    </h2>
                    <p className="text-primary-foreground/70 text-base mb-10 max-w-xl mx-auto leading-relaxed">
                        Know an AI tool we haven't listed? Have a course idea? Want to write for our blog? We love hearing from the community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contact">
                            <Button size="lg" className="px-10 rounded-xl h-12 text-base font-bold bg-white text-primary hover:bg-white/90 shadow-xl gap-2">
                                Get in touch <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/ai-tools">
                            <Button size="lg" variant="outline" className="px-10 rounded-xl h-12 text-base border-white/20 text-primary-foreground hover:bg-white/10">
                                Explore tools
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-primary-foreground/50 text-sm">
                        <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            {formatCount(publicStats?.users?.total, '10,000+')} users
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-amber-300 fill-amber-300" /> 4.9 / 5 rating
                        </span>
                        <span className="flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4" /> Growing daily
                        </span>
                    </div>
                </div>
            </section>
        </div>
    )
}