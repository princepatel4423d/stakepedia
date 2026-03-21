import { Link } from "react-router-dom"
import {
    Sparkles, Users, Star, Globe,
    Bot, Zap, GraduationCap, TrendingUp
} from "lucide-react"

import { Button } from "@/components/ui/button"

const CTASection = ({
    stats = {
        tools: "500+",
        prompts: "1K+",
        courses: "50+",
        users: "10K+",
    }
}) => {
    return (
        <section className="py-20 relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-primary" />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.04)_1px,transparent_1px)] bg-size-[40px_40px]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-full max-w-lg bg-white/5 blur-[80px] rounded-full" />

            <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">

                {/* LEFT */}
                <div className="text-center lg:text-left">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-primary-foreground/80 text-xs font-semibold mb-5 border border-white/10">
                        <Sparkles className="h-3 w-3" />
                        Free forever. No credit card.
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary-foreground mb-5 leading-tight">
                        Start exploring <br />
                        <span className="text-white">AI tools today</span>
                    </h2>

                    {/* Description */}
                    <p className="text-primary-foreground/70 text-sm sm:text-base mb-6 max-w-md mx-auto lg:mx-0">
                        Discover curated AI tools, prompts, and courses to boost productivity,
                        automate workflows, and stay ahead in the AI revolution.
                    </p>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center lg:justify-start">
                        <Link to="/register">
                            <Button className="px-6 h-11 text-sm font-semibold bg-white text-primary hover:bg-white/90 rounded-lg shadow-lg">
                                Create free account
                            </Button>
                        </Link>

                        <Link to="/ai-tools">
                            <Button
                                variant="outline"
                                className="px-6 h-11 text-sm border-white/20 text-primary-foreground hover:bg-white/10 rounded-lg"
                            >
                                Browse tools
                            </Button>
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="flex flex-wrap gap-4 text-primary-foreground/70 text-xs sm:text-sm justify-center lg:justify-start">
                        <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" /> {stats.users} users
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-amber-300 fill-amber-300" /> 4.9/5 rating
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Globe className="h-4 w-4" /> 50+ countries
                        </span>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="relative">

                    {/* Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-6 shadow-2xl">

                        {/* Features */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3">
                                What you get
                            </h3>

                            <div className="grid grid-cols-2 gap-3 text-sm text-primary-foreground/80">
                                <div className="flex items-center gap-2">
                                    <Bot className="h-4 w-4 text-white" />
                                    AI Tools Directory
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-white" />
                                    Ready Prompts
                                </div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-white" />
                                    AI Courses
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-white" />
                                    Daily Updates
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10" />

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">

                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-xs text-primary-foreground/60">Tools Listed</p>
                                <p className="text-lg font-semibold text-white">{stats.tools}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-xs text-primary-foreground/60">Prompts</p>
                                <p className="text-lg font-semibold text-white">{stats.prompts}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-xs text-primary-foreground/60">Courses</p>
                                <p className="text-lg font-semibold text-white">{stats.courses}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-xs text-primary-foreground/60">Active Users</p>
                                <p className="text-lg font-semibold text-white">{stats.users}</p>
                            </div>

                        </div>

                        {/* Bottom */}
                        <div className="text-xs text-primary-foreground/60 text-center">
                            Trusted by developers, creators & AI enthusiasts worldwide 🚀
                        </div>

                    </div>

                    {/* Glow */}
                    <div className="absolute -z-10 inset-0 blur-3xl opacity-30 bg-white/20 rounded-full" />
                </div>

            </div>
        </section>
    )
}

export default CTASection