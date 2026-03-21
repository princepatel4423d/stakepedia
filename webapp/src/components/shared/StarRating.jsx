import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StarRating({ rating = 0, max = 5, size = 'sm', showValue = false }) {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-muted-foreground">
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  )
}