import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Shield, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import SearchInput from '@/components/shared/SearchInput'
import EmptyState from '@/components/shared/EmptyState'
import { auditApi } from '@/api/audit.api'
import { formatDistanceToNow, format } from 'date-fns'

const ACTION_COLORS = {
    created: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    published: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    login: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    enabled: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    disabled: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const getActionColor = (action = '') => {
    const key = Object.keys(ACTION_COLORS).find((k) => action.includes(k))
    return key ? ACTION_COLORS[key] : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

const FILTERS = [
    {
        key: 'resource',
        label: 'Resource',
        options: [
            'Admin', 'User', 'AITool', 'Blog', 'Course', 'Lesson',
            'Prompt', 'Category', 'Tag', 'Review', 'Comment',
            'EmailTemplate', 'SiteSettings',
        ].map((r) => ({ value: r, label: r })),
    },
    {
        key: 'status',
        label: 'Status',
        options: [
            { value: 'success', label: 'Success' },
            { value: 'failed', label: 'Failed' },
        ],
    },
]

// Expandable row detail
const LogDetail = ({ log }) => {
    const [expanded, setExpanded] = useState(false)
    const hasData = log.oldData || log.newData || Object.keys(log.metadata || {}).length > 0

    return (
        <div>
            <div className="flex items-start gap-3">
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarImage src={log.admin?.avatar} />
                    <AvatarFallback className="text-xs">
                        {log.admin?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{log.admin?.name || 'System'}</span>
                        <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getActionColor(log.action)}`}
                        >
                            {log.action}
                        </span>
                        {log.resourceName && (
                            <span className="text-xs text-muted-foreground truncate max-w-50">
                                {log.resourceName}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{log.ip}</span>
                        <span>·</span>
                        <span title={format(new Date(log.createdAt), 'PPpp')}>
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
                {hasData && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded
                            ? <ChevronUp className="h-3.5 w-3.5" />
                            : <ChevronDown className="h-3.5 w-3.5" />
                        }
                    </Button>
                )}
            </div>

            {expanded && (
                <div className="mt-3 ml-10 space-y-3">
                    {log.oldData && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Before</p>
                            <pre className="text-xs bg-muted/50 rounded-md p-2.5 overflow-auto max-h-40">
                                {JSON.stringify(log.oldData, null, 2)}
                            </pre>
                        </div>
                    )}
                    {log.newData && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">After</p>
                            <pre className="text-xs bg-muted/50 rounded-md p-2.5 overflow-auto max-h-40">
                                {JSON.stringify(log.newData, null, 2)}
                            </pre>
                        </div>
                    )}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Metadata</p>
                            <pre className="text-xs bg-muted/50 rounded-md p-2.5 overflow-auto max-h-32">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                    {log.errorMessage && (
                        <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs">
                            {log.errorMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const AuditLogs = () => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({})

    const { data, isLoading } = useQuery({
        queryKey: ['audit-logs', page, search, filters],
        queryFn: () => auditApi.getAll({ page, limit: 20, search, ...filters }),
        select: (res) => ({ logs: res.data.data?.logs ?? res.data.data ?? [], pagination: res.data.pagination }),
    })

    const { data: stats } = useQuery({
        queryKey: ['audit-stats'],
        queryFn: () => auditApi.getStats(),
        select: (res) => res.data.data,
    })

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(1)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Audit logs"
                description="Full history of admin actions across Stakepedia"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Audit logs' },
                ]}
            />

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Total (30d)</p>
                            <p className="text-2xl font-bold mt-0.5">{stats.totalLast30Days}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Failed (30d)</p>
                            <p className="text-2xl font-bold mt-0.5 text-destructive">
                                {stats.failedLast30Days}
                            </p>
                        </CardContent>
                    </Card>
                    {stats.topAdmins?.[0] && (
                        <Card className="sm:col-span-2">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">Most active admin (30d)</p>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                            {stats.topAdmins[0].admin?.name?.charAt(0)?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{stats.topAdmins[0].admin?.name}</span>
                                    <Badge variant="outline" className="ml-auto text-xs">
                                        {stats.topAdmins[0].count} actions
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput
                    value={search}
                    onChange={(val) => { setSearch(val); setPage(1) }}
                    placeholder="Search actions or resources..."
                    className="sm:w-72"
                />
                <FilterBar
                    filters={FILTERS}
                    values={filters}
                    onChange={handleFilterChange}
                    onReset={() => { setFilters({}); setPage(1) }}
                />
            </div>

            {/* Log list */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-0 divide-y">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="p-4">
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : !data?.logs?.length ? (
                        <EmptyState
                            icon={Shield}
                            title="No audit logs found"
                            description="Try adjusting your filters"
                        />
                    ) : (
                        <div className="divide-y">
                            {data.logs.map((log) => (
                                <div
                                    key={log._id}
                                    className={`p-4 ${log.status === 'failed' ? 'bg-destructive/5' : ''}`}
                                >
                                    <LogDetail log={log} />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {data?.pagination && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing {((data.pagination.page - 1) * data.pagination.limit) + 1}–
                        {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                        {data.pagination.total}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline" size="sm"
                            disabled={!data.pagination.hasPrev}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            disabled={!data.pagination.hasNext}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AuditLogs