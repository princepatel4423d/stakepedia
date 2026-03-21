import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard.api'
import PageHeader from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Users, Bot, FileText, BookOpen, Zap,
  Star, TrendingUp, Eye, ArrowRight,
  AlertCircle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useNavigate } from 'react-router-dom'

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, color, isLoading }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
          {isLoading
            ? <Skeleton className="h-7 w-20 mt-1" />
            : <p className="text-2xl font-bold tracking-tight">{value ?? '—'}</p>
          }
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const MiniMetric = ({ label, value, hint, isLoading }) => (
  <div className="rounded-lg border bg-card px-3 py-2.5">
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    {isLoading
      ? <Skeleton className="mt-1 h-5 w-16" />
      : <p className="text-lg font-semibold leading-tight">{value}</p>
    }
    <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
  </div>
)

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
    select: (res) => res.data.data,
    refetchInterval: 60000,
  })

  const stats = data || {}
  const totalPublished = (stats.content?.aiTools?.published || 0)
    + (stats.content?.blogs?.published || 0)
    + (stats.content?.courses?.published || 0)
    + (stats.content?.prompts?.published || 0)
  const totalDraft = (stats.content?.aiTools?.draft || 0)
    + (stats.content?.blogs?.draft || 0)
    + (stats.content?.courses?.draft || 0)
    + (stats.content?.prompts?.draft || 0)
  const moderationLoad = (stats.reviews?.pending || 0) > 10 ? 'High' : (stats.reviews?.pending || 0) > 0 ? 'Medium' : 'Low'
  const contentHealth = totalPublished + totalDraft > 0
    ? `${Math.round((totalPublished / (totalPublished + totalDraft)) * 100)}% published`
    : 'No content yet'

  // Build chart data from content stats
  const contentChartData = [
    {
      name: 'AI Tools',
      published: stats.content?.aiTools?.published || 0,
      draft: stats.content?.aiTools?.draft || 0,
    },
    {
      name: 'Blogs',
      published: stats.content?.blogs?.published || 0,
      draft: stats.content?.blogs?.draft || 0,
    },
    {
      name: 'Courses',
      published: stats.content?.courses?.published || 0,
      draft: stats.content?.courses?.draft || 0,
    },
    {
      name: 'Prompts',
      published: stats.content?.prompts?.published || 0,
      draft: stats.content?.prompts?.draft || 0,
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Welcome back - here's what's happening with Stakepedia"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          title="Total Users"
          value={stats.users?.total?.toLocaleString()}
          subtitle={`+${stats.users?.last30Days || 0} this month`}
          icon={Users}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          isLoading={isLoading}
        />
        <StatCard
          title="AI Tools"
          value={stats.content?.aiTools?.total}
          subtitle={`${stats.content?.aiTools?.published || 0} published`}
          icon={Bot}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          isLoading={isLoading}
        />
        <StatCard
          title="Blog Posts"
          value={stats.content?.blogs?.total}
          subtitle={`${stats.content?.blogs?.published || 0} published`}
          icon={FileText}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          isLoading={isLoading}
        />
        <StatCard
          title="Courses"
          value={stats.content?.courses?.total}
          subtitle={`${stats.content?.courses?.published || 0} published`}
          icon={BookOpen}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Prompts"
          value={stats.content?.prompts?.total}
          subtitle={`${stats.content?.prompts?.published || 0} published`}
          icon={Zap}
          color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.reviews?.pending}
          subtitle="Awaiting approval"
          icon={Star}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
          isLoading={isLoading}
        />
        <StatCard
          title="New Users (7d)"
          value={stats.users?.last7Days}
          subtitle={`${stats.users?.last30Days || 0} in last 30 days`}
          icon={TrendingUp}
          color="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
          isLoading={isLoading}
        />
      </div>

      {/* Snapshot Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Quick actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => navigate('/ai-tools/new')}
              className="w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <span>Add AI tool</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('/blogs/new')}
              className="w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <span>Create blog post</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('/notifications/campaigns')}
              className="w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <span>Send notification</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Platform snapshot</CardTitle>
            <CardDescription>Live operational summary</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <MiniMetric
              label="Published"
              value={totalPublished.toLocaleString()}
              hint="Live content"
              isLoading={isLoading}
            />
            <MiniMetric
              label="Drafts"
              value={totalDraft.toLocaleString()}
              hint="Work in progress"
              isLoading={isLoading}
            />
            <MiniMetric
              label="Moderation"
              value={moderationLoad}
              hint="Pending review load"
              isLoading={isLoading}
            />
            <MiniMetric
              label="Content Health"
              value={isLoading ? '—' : contentHealth}
              hint="Publish ratio"
              isLoading={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Traffic focus</CardTitle>
            <CardDescription>Where users are engaging</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-lg border px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Top source</span>
              <span className="text-sm font-medium">AI Tools</span>
            </div>
            <div className="rounded-lg border px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Top item views</span>
              <span className="text-sm font-medium">{stats.topTools?.[0]?.viewCount?.toLocaleString?.() || 0}</span>
            </div>
            <div className="rounded-lg border px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">7d user trend</span>
              <span className="text-sm font-medium">+{stats.users?.last7Days || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Content breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Content breakdown</CardTitle>
            <CardDescription>Published vs draft across all content types</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={contentChartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{value}</span>}
                  />
                  <Bar dataKey="published" name="Published" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="draft" name="Draft" fill="var(--color-muted-foreground)" radius={[4, 4, 0, 0]} opacity={0.4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top AI Tools */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top AI tools</CardTitle>
            <CardDescription>Most viewed published tools</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !stats.topTools?.length ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Bot className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No tools published yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.topTools.map((tool, i) => (
                  <div
                    key={tool._id}
                    onClick={() => navigate(`/ai-tools/${tool._id}/edit`)}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
                      {i + 1}
                    </span>
                    {tool.logo ? (
                      <img src={tool.logo} alt="" className="h-7 w-7 rounded object-cover shrink-0" />
                    ) : (
                      <div className="h-7 w-7 rounded bg-muted flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="flex-1 text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {tool.name}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {tool.viewCount?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {tool.averageRating?.toFixed(1) || '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      {(stats.reviews?.pending > 0) && (
        <Card className="border-amber-200 dark:border-amber-900/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base font-semibold">Needs attention</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              onClick={() => navigate('/moderation/reviews')}
              className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Pending reviews</span>
              </div>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-0 dark:bg-amber-900/40 dark:text-amber-400">
                {stats.reviews.pending}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard