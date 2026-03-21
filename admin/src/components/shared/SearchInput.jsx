import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect, useCallback } from 'react'

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  debounce = 400,
}) => {
  const [internal, setInternal] = useState(value || '')

  useEffect(() => {
    setInternal(value || '')
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internal !== value) onChange(internal)
    }, debounce)
    return () => clearTimeout(timer)
  }, [internal, debounce])

  const clear = useCallback(() => {
    setInternal('')
    onChange('')
  }, [onChange])

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {internal && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={clear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

export default SearchInput