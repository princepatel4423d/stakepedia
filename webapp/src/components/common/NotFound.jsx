import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, SearchX, Compass, Search, User } from 'lucide-react'

export default function NotFound() {
  const quickLinks = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Search', icon: Search, href: '/search' },
    { label: 'Profile', icon: User, href: '/profile' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-16 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center justify-center">
        <section className="relative w-full rounded-3xl border border-border/60 bg-background/90 p-8 text-center shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:p-10">

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
            <SearchX className="h-7 w-7" />
          </div>

          {/* 404 digits */}
          <p className="mb-4 text-[96px] font-black leading-none tracking-tighter">
            <span className="text-primary/20">4</span>
            <span className="text-primary/30">0</span>
            <span className="text-primary/20">4</span>
          </p>

          <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
            This page took a wrong turn
          </h1>
          <p className="mx-auto mb-8 max-w-sm text-sm text-muted-foreground sm:text-base">
            We couldn't find the page you're looking for. It may have been moved,
            removed, or the URL might have a typo.
          </p>

          {/* CTA buttons */}
          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/">
              <Button className="h-10 gap-2 rounded-full px-6">
                <Home className="h-4 w-4" />
                Go to home
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="h-10 gap-2 rounded-full px-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Button>
          </div>

          {/* Divider + quick links */}
          <div className="mb-6 border-t border-border/50" />
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Maybe you were looking for
          </p>
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            {quickLinks.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                to={href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            ))}
          </div>

          {/* Tip */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <Compass className="h-3.5 w-3.5" />
            Check the URL for typos and try again
          </div>
        </section>
      </div>
    </div>
  )
}