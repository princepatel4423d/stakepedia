import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Pagination({ pagination, onPageChange, className }) {
  if (!pagination || pagination.pages <= 1) return null
  const { page, pages, hasPrev, hasNext } = pagination

  const getPages = () => {
    const delta = 2
    const range = []
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i)
    }
    if (page - delta > 2)      range.unshift('...')
    if (page + delta < pages - 1) range.push('...')
    range.unshift(1)
    if (pages > 1) range.push(pages)
    return range
  }

  const pageItems = getPages()

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-xl border border-border/70 bg-background/80 px-2 py-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground"
        disabled={!hasPrev}
        onClick={() => onPageChange(page - 1)}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageItems.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1 text-xs font-medium tracking-wide text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg text-sm font-medium transition-all',
              p === page
                ? 'shadow-sm ring-1 ring-primary/40'
                : 'border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground'
            )}
            onClick={() => onPageChange(p)}
            aria-label={`Go to page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}