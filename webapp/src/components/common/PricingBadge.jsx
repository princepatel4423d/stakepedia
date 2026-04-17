import { cn } from '@/lib/utils'

const STYLES = {
  free:         'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',
  freemium:     'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400',
  paid:         'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'open-source':'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  contact:      'bg-gray-100   text-gray-700   dark:bg-gray-800      dark:text-gray-300',
}

export default function PricingBadge({ pricing, className }) {
  if (!pricing) return null
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
      STYLES[pricing] || STYLES.contact,
      className
    )}>
      {pricing === 'open-source' ? 'Open Source' : pricing}
    </span>
  )
}