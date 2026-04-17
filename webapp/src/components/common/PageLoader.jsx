import { LoaderCircle, Sparkles } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 px-6">
      <div className="pointer-events-none absolute -left-16 top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-border/70 bg-background/80 px-8 py-7 text-center shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/65">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
          <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 animate-pulse text-primary/80" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-wide text-foreground">Preparing your page</p>
          <p className="text-xs text-muted-foreground">Loading content and setting things up...</p>
        </div>
      </div>
    </div>
  )
}