import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Mail, CheckCircle, XCircle, Clock, Eye, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import StatusBadge from '@/components/shared/StatusBadge'
import { emailApi } from '@/api/email.api'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import SearchInput from '@/components/shared/SearchInput'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

const LogDetailsDialog = ({ log, open, onClose }) => {
    if (!log) return null

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Email log details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Recipient</p>
                            <p className="font-medium break-all">{log.to || '—'}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <div className="mt-1"><StatusBadge status={log.status} /></div>
                        </div>
                    </div>

                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Subject</p>
                        <p className="font-medium">{log.subject || '—'}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Template</p>
                            <p className="font-mono text-xs mt-1">{log.template || 'Custom'}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Campaign ID</p>
                            <p className="font-mono text-xs mt-1 break-all">{log.campaignId || '—'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Type</p>
                            <p className="mt-1">{log.isBulk ? 'Campaign' : 'Transactional'}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Sent by</p>
                            <p className="mt-1 break-all">{log.sentBy?.name || log.sentBy?.email || 'System / Service'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Created at</p>
                            <p className="mt-1">{log.createdAt ? format(new Date(log.createdAt), 'PPP p') : '—'}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Sent at</p>
                            <p className="mt-1">{log.sentAt ? format(new Date(log.sentAt), 'PPP p') : '—'}</p>
                        </div>
                    </div>

                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Log ID</p>
                        <p className="font-mono text-xs mt-1 break-all">{log._id}</p>
                    </div>

                    {log.error && (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                            <p className="text-xs text-destructive font-medium">Error</p>
                            <p className="mt-1 text-sm whitespace-pre-wrap wrap-break-word">{log.error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const FILTERS = [
    {
        key: 'status',
        label: 'Status',
        options: [
            { value: 'sent', label: 'Sent' },
            { value: 'failed', label: 'Failed' },
            { value: 'pending', label: 'Pending' },
        ],
    },
    {
        key: 'isBulk',
        label: 'Type',
        options: [
            { value: 'true', label: 'Campaign' },
            { value: 'false', label: 'Transactional' },
        ],
    },
]

const EmailLogs = () => {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({})
    const [search, setSearch] = useState('')
    const [selectedLog, setSelectedLog] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['email-logs', page, search, filters],
        queryFn: () => emailApi.getLogs({ page, limit: 20, q: search, ...filters }),
        select: (res) => ({ items: res.data.data?.logs ?? res.data.data, pagination: res.data.pagination }),
    })

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['email-stats'],
        queryFn: () => emailApi.getStats(),
        select: (res) => res.data.data,
    })

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(1)
    }

    const columns = [
        {
            key: 'to',
            label: 'Recipient',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${row.status === 'sent'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : row.status === 'failed'
                                ? 'bg-red-100 dark:bg-red-900/30'
                                : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        {row.status === 'sent'
                            ? <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            : row.status === 'failed'
                                ? <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                : <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-mono truncate max-w-52">{row.to}</p>
                        {row.sentBy?.name && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-52">
                                by {row.sentBy.name}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'subject',
            label: 'Subject',
            render: (row) => (
                <div className="min-w-0">
                    <p className="text-sm truncate max-w-60">{row.subject}</p>
                    {row.campaignId && (
                        <p className="text-[11px] text-muted-foreground font-mono truncate max-w-60">
                            campaign: {row.campaignId}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: 'template',
            label: 'Template',
            render: (row) => row.template ? (
                <Badge variant="outline" className="text-xs font-mono">{row.template}</Badge>
            ) : <span className="text-muted-foreground text-xs">Custom</span>,
        },
        {
            key: 'type',
            label: 'Type',
            render: (row) => (
                <Badge
                    variant="outline"
                    className={row.isBulk
                        ? 'text-xs bg-purple-100 text-purple-800 border-0 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'text-xs bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400'
                    }
                >
                    {row.isBulk ? 'Campaign' : 'Transactional'}
                </Badge>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'sentAt',
            label: 'Sent at',
            render: (row) => (
                <span className="text-xs text-muted-foreground">
                    {row.sentAt
                        ? format(new Date(row.sentAt), 'MMM d, HH:mm')
                        : '—'
                    }
                </span>
            ),
        },
        {
            key: 'error',
            label: 'Error',
            render: (row) => row.error ? (
                <div className="flex items-center gap-1.5 text-destructive text-xs max-w-44">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{row.error}</span>
                </div>
            ) : (
                <span className="text-xs text-muted-foreground">—</span>
            ),
        },
        {
            key: 'actions',
            label: '',
            cellClassName: 'text-right',
            render: (row) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setSelectedLog(row)}
                >
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Details
                </Button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Email logs"
                description="Delivery history for all outgoing emails"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Email', href: '/email/templates' },
                    { label: 'Logs' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate('/email/templates')}>
                            Templates
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/email/campaigns')}>
                            Campaigns
                        </Button>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {statsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))
                ) : (
                    <>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Total sent (30d)</p>
                                <p className="text-2xl font-bold mt-0.5">{stats?.last30Days?.total || 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Delivered</p>
                                <p className="text-2xl font-bold mt-0.5 text-green-600 dark:text-green-400">
                                    {stats?.last30Days?.sent || 0}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Failed</p>
                                <p className="text-2xl font-bold mt-0.5 text-destructive">
                                    {stats?.last30Days?.failed || 0}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Delivery rate</p>
                                <p className="text-2xl font-bold mt-0.5">{stats?.deliveryRate || '—'}</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <FilterBar
                filters={FILTERS}
                values={filters}
                onChange={handleFilterChange}
                onReset={() => { setFilters({}); setPage(1) }}
            />

            <SearchInput
                value={search}
                onChange={(val) => { setSearch(val); setPage(1) }}
                placeholder="Search recipient, subject, template, campaign ID or error..."
                className="sm:w-120"
            />

            <DataTable
                columns={columns}
                data={data?.items || []}
                isLoading={isLoading}
                pagination={data?.pagination}
                onPageChange={setPage}
                rowClassName={(row) =>
                    row.status === 'failed' ? 'bg-destructive/5 hover:bg-destructive/10' : ''
                }
            />

            <LogDetailsDialog
                log={selectedLog}
                open={!!selectedLog}
                onClose={() => setSelectedLog(null)}
            />
        </div>
    )
}

export default EmailLogs