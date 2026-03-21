import { Link } from "react-router-dom"
import {
    Sparkles, Search, ArrowRight, CheckCircle,
    Shield, TrendingUp, Bot, GraduationCap,
    Zap, Users, BrainCircuit, Wand2
} from "lucide-react"

import { Button } from "@/components/ui/button"

const Hero = ({
    heroPills = [],
    ToolPill,
    stats = { tools: "500+", courses: "50+", prompts: "1K+", users: "10K+" },
    featuredTool = null,
    topCategories = ["Writing", "Image", "Coding", "Marketing", "Video"],
    metaStats = { newToday: 12, topCategory: "AI Writing", prompts: "1K+", users: "10K+" },
}) => {

    const trustItems = [
        { icon: CheckCircle, text: "No credit card" },
        { icon: Shield, text: "Free access" },
        { icon: TrendingUp, text: "Updated daily" },
    ]

    const statsData = [
        { value: stats.tools, label: "AI Tools", icon: Bot },
        { value: stats.courses, label: "Courses", icon: GraduationCap },
        { value: stats.prompts, label: "Prompts", icon: Zap },
        { value: stats.users, label: "Users", icon: Users },
    ]

    const RenderToolPill = ToolPill || (({ name }) => (
        <span className="px-2 py-1 rounded-md border bg-background/60 text-xs">
            {name}
        </span>
    ))

    const featured = featuredTool || {
        name: "ChatGPT",
        shortDescription: "AI assistant for everything",
    }

    return (
        <section className="relative min-h-[95vh] flex items-center overflow-hidden max-w-7xl mx-auto px-4">

            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-size-[48px_48px]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-87.5 w-162.5 bg-primary/10 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 items-center">

                {/* LEFT SIDE */}
                <div className="text-center lg:text-left">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs mb-4 border border-primary/20">
                        <Sparkles className="h-3 w-3" />
                        #1 AI Discovery Platform
                    </div>

                    {/* Heading */}
                    <h1 className="font-extrabold leading-tight tracking-tight mb-5
            text-2xl sm:text-3xl md:text-4xl lg:text-4xl">

                        Discover & Use the
                        <span className="block text-primary">
                            Best AI Tools, Prompts & Courses
                        </span>
                        in One Place
                    </h1>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-muted-foreground max-w-lg mb-6">
                        Explore curated AI tools, powerful prompts, expert courses, and real-world use cases —
                        everything you need to build, learn, and grow with AI.
                    </p>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-primary" />
                            Smart AI Tools
                        </div>
                        <div className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-primary" />
                            Ready Prompts
                        </div>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            AI Courses
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Daily Updates
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <Link to="/ai-tools">
                            <Button className="w-full sm:w-auto px-6 h-11 text-sm rounded-lg gap-2">
                                <Search className="h-4 w-4" />
                                Explore AI Tools
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>

                        <Link to="/register">
                            <Button variant="outline" className="w-full sm:w-auto px-6 h-11 text-sm rounded-lg">
                                Join for free
                            </Button>
                        </Link>
                    </div>

                    {/* Trust */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-6">
                        {trustItems.map(({ icon: Icon, text }) => (
                            <span key={text} className="flex items-center gap-1">
                                <Icon className="h-3.5 w-3.5 text-emerald-500" />
                                {text}
                            </span>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {statsData.map(({ value, label, icon: Icon }) => (
                            <div key={label} className="p-3 rounded-lg border bg-card/70 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold">{value}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="relative">

                    {/* Main Glass Container */}
                    <div className="rounded-2xl border bg-card/60 backdrop-blur-xl p-5 shadow-xl space-y-5">

                        {/* Search */}
                        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-background/70">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search AI tools, prompts, courses..."
                                className="bg-transparent outline-none text-sm w-full"
                            />
                        </div>

                        {/* Featured Tool */}
                        <div className="p-4 rounded-xl border bg-background/60">
                            <p className="text-xs text-muted-foreground mb-1">🔥 Featured Tool</p>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{featured.name}</p>
                                    <p className="text-xs text-muted-foreground">{featured.shortDescription || featured.description || "AI assistant for everything"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Trending Pills */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold">Trending Tools</h3>
                                <span className="text-xs text-muted-foreground">Live</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {heroPills.length > 0 ? (
                                    heroPills.slice(0, 6).map((t, i) => (
                                        <RenderToolPill
                                            key={t._id}
                                            name={t.name}
                                            logo={t.logo}
                                            category={t.category?.name}
                                            delay={`${i * 0.08}s`}
                                        />
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        No tools available
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Top Categories</h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {topCategories.map((cat) => (
                                    <span
                                        key={cat}
                                        className="px-2 py-1 rounded-md border bg-background/60 hover:bg-primary/10 transition cursor-pointer"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border bg-background/60">
                                <p className="text-xs text-muted-foreground">New Today</p>
                                <p className="text-sm font-semibold">{metaStats.newToday} Tools</p>
                            </div>

                            <div className="p-3 rounded-lg border bg-background/60">
                                <p className="text-xs text-muted-foreground">Top Category</p>
                                <p className="text-sm font-semibold">{metaStats.topCategory}</p>
                            </div>

                            <div className="p-3 rounded-lg border bg-background/60">
                                <p className="text-xs text-muted-foreground">Prompts</p>
                                <p className="text-sm font-semibold">{metaStats.prompts}</p>
                            </div>

                            <div className="p-3 rounded-lg border bg-background/60">
                                <p className="text-xs text-muted-foreground">Users</p>
                                <p className="text-sm font-semibold">{metaStats.users}</p>
                            </div>
                        </div>

                    </div>

                    {/* Glow */}
                    <div className="absolute -z-10 inset-0 blur-3xl opacity-30 bg-primary/20 rounded-full" />
                </div>

            </div>
        </section>
    )
}

export default Hero