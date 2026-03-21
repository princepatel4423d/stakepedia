import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  published:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  draft:      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  archived:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  active:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  pending:    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  sent:       'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed:     'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  free:       'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  paid:       'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  freemium:   'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  admin:      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  user:       'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  success:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  beginner:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  intermediate:'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const StatusBadge = ({ status, className }) => {
  const style = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.draft
  return (
    <Badge
      variant="outline"
      className={cn('border-0 font-medium capitalize text-xs', style, className)}
    >
      {status}
    </Badge>
  )
}

export default StatusBadge