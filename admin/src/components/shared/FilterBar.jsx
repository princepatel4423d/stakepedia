import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const FilterBar = ({ filters = [], values = {}, onChange, onReset, className }) => {
  const hasActive = filters.some((f) => values[f.key] && values[f.key] !== 'all')

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={values[filter.key] || 'all'}
          onValueChange={(val) => onChange(filter.key, val === 'all' ? '' : val)}
        >
          <SelectTrigger className="h-9 w-auto min-w-32.5 text-sm">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 text-muted-foreground hover:text-foreground gap-1"
        >
          <X className="h-3 w-3" />
          Reset
        </Button>
      )}
    </div>
  )
}

export default FilterBar