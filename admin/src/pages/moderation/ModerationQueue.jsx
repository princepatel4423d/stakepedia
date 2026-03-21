import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Trash2, Star, MessageSquare, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import { usePermission } from '@/hooks/usePermission'
import { reviewsApi } from '@/api/reviews.api'
import { commentsApi } from '@/api/comments.api'
import { formatDistanceToNow } from 'date-fns'

const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`h-3 w-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
                    }`}
            />
        ))}
    </div>
)

// ── Pending Reviews ───────────────────────────────────────────────────────────
const PendingReviews = () => {
    const qc = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['pending-reviews'],
        queryFn: () => reviewsApi.getAll({ isApproved: false, limit: 10 }),
        select: (res) => ({ items: res.data.data?.reviews ?? res.data.data, pagination: res.data.pagination }),
    })

    const approveMutation = useMutation({
        mutationFn: reviewsApi.approve,
        onSuccess: () => {
            toast.success('Review approved')
            qc.invalidateQueries({ queryKey: ['pending-reviews'] })
            qc.invalidateQueries({ queryKey: ['admin-reviews'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const rejectMutation = useMutation({
        mutationFn: reviewsApi.reject,
        onSuccess: () => {
            toast.success('Review rejected')
            qc.invalidateQueries({ queryKey: ['pending-reviews'] })
            qc.invalidateQueries({ queryKey: ['admin-reviews'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: reviewsApi.delete,
        onSuccess: () => {
            toast.success('Review deleted')
            qc.invalidateQueries({ queryKey: ['pending-reviews'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    if (isLoading) return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
    )

    if (!data?.items?.length) return (
        <EmptyState
            icon={Star}
            title="No pending reviews"
            description="All reviews have been moderated"
        />
    )

    return (
        <div className="space-y-3">
            {data.items.map((review) => (
                <div key={review._id} className="p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={review.user?.avatar} />
                            <AvatarFallback className="text-xs">
                                {review.user?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{review.user?.name}</span>
                                <StarRating rating={review.rating} />
                                <Badge variant="outline" className="text-[10px] capitalize">
                                    {review.targetType}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-auto">
                                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            {review.title && (
                                <p className="text-sm font-medium mt-1">{review.title}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {review.content}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                            onClick={() => deleteMutation.mutate(review._id)}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 gap-1"
                            onClick={() => rejectMutation.mutate(review._id)}
                            disabled={rejectMutation.isPending}
                        >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button
                            size="sm"
                            className="h-7 gap-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => approveMutation.mutate(review._id)}
                            disabled={approveMutation.isPending}
                        >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── Pending Comments ──────────────────────────────────────────────────────────
const PendingComments = () => {
    const qc = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['pending-comments'],
        queryFn: () => commentsApi.getAll({ isApproved: false, limit: 10 }),
        select: (res) => ({ items: res.data.data?.comments ?? res.data.data, pagination: res.data.pagination }),
    })

    const approveMutation = useMutation({
        mutationFn: commentsApi.approve,
        onSuccess: () => {
            toast.success('Comment approved')
            qc.invalidateQueries({ queryKey: ['pending-comments'] })
            qc.invalidateQueries({ queryKey: ['admin-comments'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: commentsApi.delete,
        onSuccess: () => {
            toast.success('Comment deleted')
            qc.invalidateQueries({ queryKey: ['pending-comments'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    if (isLoading) return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
    )

    if (!data?.items?.length) return (
        <EmptyState
            icon={MessageSquare}
            title="No pending comments"
            description="All comments have been moderated"
        />
    )

    return (
        <div className="space-y-3">
            {data.items.map((comment) => (
                <div key={comment._id} className="p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={comment.user?.avatar} />
                            <AvatarFallback className="text-xs">
                                {comment.user?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{comment.user?.name}</span>
                                {comment.parentComment && (
                                    <Badge variant="outline" className="text-[10px]">Reply</Badge>
                                )}
                                <span className="text-xs text-muted-foreground ml-auto">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {comment.content}
                            </p>
                            {comment.blog?.title && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    On: <span className="font-medium">{comment.blog.title}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                            onClick={() => deleteMutation.mutate(comment._id)}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                        <Button
                            size="sm"
                            className="h-7 gap-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => approveMutation.mutate(comment._id)}
                            disabled={approveMutation.isPending}
                        >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const ModerationQueue = () => {
    const navigate = useNavigate()
    const { hasPermission } = usePermission()
    const canManageReviews = hasPermission('manageModeration')
    const canManageComments = hasPermission('manageModeration')
    const defaultTab = canManageReviews ? 'reviews' : 'comments'

    const { data: reviewData } = useQuery({
        queryKey: ['pending-reviews-count'],
        queryFn: () => reviewsApi.getAll({ isApproved: false, limit: 1 }),
        select: (res) => res.data.pagination?.total || 0,
        enabled: canManageReviews,
    })

    const { data: commentData } = useQuery({
        queryKey: ['pending-comments-count'],
        queryFn: () => commentsApi.getAll({ isApproved: false, limit: 1 }),
        select: (res) => res.data.pagination?.total || 0,
        enabled: canManageComments,
    })

    const pendingReviews = reviewData || 0
    const pendingComments = commentData || 0
    const totalPending = pendingReviews + pendingComments

    return (
        <div className="space-y-6">
            <PageHeader
                title="Moderation queue"
                description="Review and approve user-submitted content"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Moderation' },
                ]}
            />

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total pending</p>
                                <p className="text-3xl font-bold mt-1">{totalPending}</p>
                            </div>
                            <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {canManageReviews && (
                <Card
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate('/moderation/reviews')}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending reviews</p>
                                <p className="text-3xl font-bold mt-1">{pendingReviews}</p>
                            </div>
                            <div className="h-11 w-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                            View all <ArrowRight className="h-3 w-3" />
                        </p>
                    </CardContent>
                </Card>
                )}
                {canManageComments && (
                <Card
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate('/moderation/comments')}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending comments</p>
                                <p className="text-3xl font-bold mt-1">{pendingComments}</p>
                            </div>
                            <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                            View all <ArrowRight className="h-3 w-3" />
                        </p>
                    </CardContent>
                </Card>
                )}
            </div>

            {/* Queue tabs */}
            <Tabs defaultValue={defaultTab}>
                <TabsList>
                    {canManageReviews && (
                    <TabsTrigger value="reviews" className="gap-2">
                        Reviews
                        {pendingReviews > 0 && (
                            <Badge className="h-4 px-1.5 text-[10px] bg-amber-500 hover:bg-amber-500 border-0">
                                {pendingReviews}
                            </Badge>
                        )}
                    </TabsTrigger>
                    )}
                    {canManageComments && (
                    <TabsTrigger value="comments" className="gap-2">
                        Comments
                        {pendingComments > 0 && (
                            <Badge className="h-4 px-1.5 text-[10px] bg-blue-500 hover:bg-blue-500 border-0">
                                {pendingComments}
                            </Badge>
                        )}
                    </TabsTrigger>
                    )}
                </TabsList>
                {canManageReviews && (
                <TabsContent value="reviews" className="mt-4">
                    <PendingReviews />
                </TabsContent>
                )}
                {canManageComments && (
                <TabsContent value="comments" className="mt-4">
                    <PendingComments />
                </TabsContent>
                )}
            </Tabs>
        </div>
    )
}

export default ModerationQueue