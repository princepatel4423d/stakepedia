import { Link } from 'react-router-dom'
import {
  Bot, Twitter, Github, Linkedin, Youtube,
  Zap, ArrowRight, Mail, ChevronRight, Sparkles,
} from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'AI Tools', href: '/ai-tools' },
    { label: 'Courses',  href: '/courses' },
    { label: 'Blogs',    href: '/blogs' },
    { label: 'Prompts',  href: '/prompts' },
  ],
  Company: [
    { label: 'About',   href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use',   href: '/terms' },
  ],
  Explore: [
    { label: 'Free AI Tools',  href: '/ai-tools?pricing=free' },
    { label: 'Featured Tools', href: '/ai-tools?featured=true' },
    { label: 'Top Prompts',    href: '/prompts?featured=true' },
    { label: 'Free Courses',   href: '/courses?pricing=free' },
  ],
}

const SOCIAL = [
  { icon: Twitter,  href: '#', label: 'Twitter',  hover: 'hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/30' },
  { icon: Github,   href: '#', label: 'GitHub',   hover: 'hover:bg-foreground/10 hover:text-foreground hover:border-foreground/20' },
  { icon: Linkedin, href: '#', label: 'LinkedIn', hover: 'hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30' },
  { icon: Youtube,  href: '#', label: 'YouTube',  hover: 'hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-muted/20 overflow-hidden">

      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_35%_at_50%_0%,hsl(var(--primary)/0.07),transparent)]" />

      {/* ── Main section: 30 / 70 ── */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── LEFT 30% — Brand + newsletter + social ── */}
          <div className="w-full lg:w-[30%] shrink-0 flex flex-col gap-6">

            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 group w-fit">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-shadow shrink-0">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-black text-xl tracking-tight">Stakepedia</span>
            </Link>

            {/* Tagline */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover, compare and learn AI tools, prompts and courses — all in one powerful platform built for creators and developers.
            </p>

            {/* Newsletter */}
            <div className="p-4 rounded-2xl border border-border bg-card/70 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Get AI updates in your inbox
              </div>
              <div className="flex items-center gap-2 h-10 rounded-lg border border-border bg-background px-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-transparent outline-none text-sm flex-1 min-w-0"
                />
                <button className="shrink-0 text-primary hover:text-primary/70 transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
            </div>

            {/* Social links */}
            <div className="flex gap-2">
              {SOCIAL.map(({ icon: Icon, href, label, hover }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className={`h-9 w-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground transition-all ${hover}`}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT 70% — Links grid + CTA card ── */}
          <div className="flex-1 flex flex-col gap-10">

            {/* Links grid — 4 equal columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {Object.entries(LINKS).map(([section, links]) => (
                <div key={section}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    {section}
                  </p>
                  <ul className="space-y-2.5">
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        <Link to={href}
                          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 group transition-colors">
                          <ChevronRight className="h-3 w-3 text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* ── Full-width CTA card ── */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-linear-to-r from-primary/40 to-blue-500/30 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl" />
              <div className="relative rounded-2xl bg-linear-to-br from-primary to-blue-600 text-white shadow-xl overflow-hidden">
                {/* Card inner grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-6 p-4">
                  {/* Left text */}
                  <div className="sm:col-span-2 space-y-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/15 border border-white/20">
                      🚀 AI Platform
                    </span>
                    <h3 className="text-xl font-black leading-snug">
                      Start using AI tools today
                    </h3>
                    <p className="text-sm text-white/75 leading-relaxed max-w-md">
                      Discover powerful tools, ready-to-use prompts and structured courses to supercharge your productivity — completely free.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-1 text-xs text-white/60">
                      <span>⚡ No credit card required</span>
                      <span>✓ Free forever plan</span>
                      <span>✓ 500+ AI tools</span>
                    </div>
                  </div>
                  {/* Right CTA */}
                  <div className="flex flex-col items-start sm:items-end gap-3">
                    <Link to="/register" className="w-full sm:w-auto">
                      <button className="w-full sm:w-auto px-7 h-11 rounded-xl bg-white text-primary text-sm font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                        Get Started Free <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to="/ai-tools"
                      className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1">
                      Browse tools without signing up <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
                {/* Decorative background blur blobs */}
                <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 h-20 w-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} <span className="font-semibold text-foreground">Stakepedia</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" />
            Built for the AI community
          </div>
        </div>
      </div>
    </footer>
  )
}