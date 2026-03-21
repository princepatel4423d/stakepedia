import { useQuery } from '@tanstack/react-query'
import { Outlet, Link } from 'react-router-dom'
import {
  Bot, Sparkles, Star, CheckCircle,
  Zap, BookOpen, Users, TrendingUp, Shield,
} from 'lucide-react'
import { statsApi } from '@/api/stats.api'

const FEATURES = [
  { icon: CheckCircle, text: 'Curated & verified AI tools' },
  { icon: CheckCircle, text: 'Structured courses for every level' },
  { icon: CheckCircle, text: 'Ready-to-use prompt library' },
  { icon: CheckCircle, text: 'Free to join, always' },
]

const TESTIMONIAL = {
  name: 'Sarah K.',
  role: 'Product Designer',
  avatar: 'S',
  text: 'Stakepedia saved me hours of research. Found the perfect AI tools for my workflow in minutes.',
  rating: 5,
}

export default function AuthLayout() {
  const { data: publicStats } = useQuery({
    queryKey: ['public-stats-auth-layout'],
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

  const toolsCount = formatCount(publicStats?.content?.aiTools?.total || 0, '0')
  const coursesCount = formatCount(publicStats?.content?.courses?.total || 0, '0')
  const promptsCount = formatCount(publicStats?.content?.prompts?.total || 0, '0')
  const usersCount = formatCount(publicStats?.users?.total || 0, '0')

  const STATS = [
    { value: toolsCount, label: 'AI Tools', icon: Bot },
    { value: coursesCount, label: 'Courses', icon: BookOpen },
    { value: promptsCount, label: 'Prompts', icon: Zap },
    { value: usersCount, label: 'Community', icon: Users },
  ]

  return (
    <div className="h-screen w-screen overflow-hidden grid lg:grid-cols-2">

      {/* ══ LEFT PANEL ════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-background relative overflow-hidden">

        {/* Backgrounds */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-0 right-0 h-100 w-100 rounded-full bg-primary/25 blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/15 blur-[80px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-blue-500/10 blur-[60px]" />

        {/* Logo */}
        <Link to="/" className="relative inline-flex items-center gap-2.5 w-fit">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Bot className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-black text-xl text-background tracking-tight">Stakepedia</span>
        </Link>

        {/* Main content — tightly packed */}
        <div className="relative space-y-5 max-w-md">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 border border-background/15 text-background/80 text-xs font-semibold">
            <Sparkles className="h-3 w-3 text-primary" />
            The #1 AI Tools Directory
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-background leading-[1.05] tracking-tight">
              Discover the best
              <span className="block text-primary">AI tools</span>
              for your workflow
            </h1>
            <p className="text-background/55 text-sm leading-relaxed">
              Join thousands of creators and developers exploring curated AI tools, courses, prompts and resources - all in one place.
            </p>
          </div>

          {/* Feature list — 2 columns to save vertical space */}
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-xs text-background/75">
                <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-background/8 border border-background/10 text-center">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <p className="text-base font-extrabold text-background leading-none">{value}</p>
                <p className="text-[9px] text-background/45 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Single testimonial */}
          <div className="flex gap-3 p-3.5 rounded-2xl bg-background/8 border border-background/10">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
              {TESTIMONIAL.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-xs font-semibold text-background">{TESTIMONIAL.name}</span>
                  <span className="text-[10px] text-background/40 ml-1.5">· {TESTIMONIAL.role}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: TESTIMONIAL.rating }).map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-background/55 leading-relaxed">"{TESTIMONIAL.text}"</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between">
          <p className="text-background/25 text-xs">
            © {new Date().getFullYear()} Stakepedia. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-background/25 text-xs">
            <Shield className="h-3 w-3" /> Secure & private
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ═══════════════════════════════════════ */}
      <div className="h-screen flex flex-col bg-background overflow-hidden">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-4 border-b shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-black text-lg tracking-tight">Stakepedia</span>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-primary" />
            {toolsCount} AI Tools
          </div>
        </div>

        {/* Form — centered, fills remaining height */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 overflow-hidden">

          {/* Top trust row — desktop */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {['A', 'B', 'C'].map((l) => (
                  <div key={l} className="h-6 w-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[9px] font-bold text-primary">
                    {l}
                  </div>
                ))}
              </div>
              <span>Join <strong>{usersCount}</strong> users</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              SSL Secured
            </div>
          </div>

          {/* Form outlet */}
          <div className="w-full max-w-md mx-auto">
            <Outlet />
          </div>

          {/* Bottom trust strip */}
          <div className="mt-8 pt-5 border-t w-full max-w-md mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> No credit card
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Free forever
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-emerald-500" /> Data is safe
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}