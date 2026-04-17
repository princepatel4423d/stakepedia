import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Bot, Settings, ExternalLink, MessageSquare,
  Star, Heart, Github, Twitter, Linkedin,
  Globe, Calendar, Shield, BookOpen, Bookmark,
  ThumbsUp, Clock, Ban,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PricingBadge from '@/components/common/PricingBadge'
import StarRating from '@/components/common/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { profileApi } from '@/api/profile.api'
import { useAuthStore } from '@/store/authStore'
import { formatDate, formatNumber } from '@/lib/utils'

// Stat card
function StatCard({ icon: Icon, value, label, color = 'bg-primary/10 text-primary' }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-muted/40 text-center">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
    </div>
  )
}

// Tool card
function ToolCard({ tool }) {
  return (
    <Link
      to={`/ai-tools/${tool.slug}`}
      className="group flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-sm hover:border-primary/30 transition-all"
    >
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 border overflow-hidden">
        {tool.logo
          ? <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          : <Bot className="h-5 w-5 text-muted-foreground" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{tool.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <PricingBadge pricing={tool.pricing} />
          {tool.averageRating > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {tool.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  )
}

// Social link
function SocialLink({ href, icon: Icon, label }) {
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium hover:bg-accent hover:border-primary/30 transition-all"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  )
}

// Main
export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  // Fetch full profile from server (has more fields than auth store)
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-me'],
    queryFn: profileApi.get,
    select: (res) => res.data.data,
  })

  // Sync server profile into auth store
  useEffect(() => {
    if (profile) updateUser(profile)
  }, [profile, updateUser])

  const currentUser = profile || user

  // Saved tools
  const { data: savedTools, isLoading: savedLoading } = useQuery({
    queryKey: ['saved-tools'],
    queryFn: profileApi.getSavedTools,
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.savedTools || [])
    },
  })

  // Activity (reviews + comments)
  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['profile-activity'],
    queryFn: profileApi.getActivity,
    select: (res) => res.data.data,
  })

  const reviews = activity?.reviews || []
  const comments = activity?.comments || []

  const isBanned = currentUser?.banStatus && currentUser.banStatus !== 'none'
  const socialLinks = [
    { href: currentUser?.social?.twitter, icon: Twitter, label: 'Twitter' },
    { href: currentUser?.social?.github, icon: Github, label: 'GitHub' },
    { href: currentUser?.social?.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { href: currentUser?.website, icon: Globe, label: 'Website' },
  ].filter((s) => s.href)

  if (profileLoading) return (
    <div className="max-w-7xl mx-auto px-4 pt-12 pb-16 space-y-6">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 pt-12 pb-16 space-y-6">

      {/* Ban notice */}
      {isBanned && (
        <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-start gap-3">
          <Ban className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Account restricted ({currentUser.banStatus})
            </p>
            {currentUser.banReason && (
              <p className="text-xs text-muted-foreground mt-0.5">{currentUser.banReason}</p>
            )}
            {currentUser.banStatus === 'temporary' && currentUser.bannedUntil && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Until: {formatDate(currentUser.bannedUntil)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Profile hero card */}
      <div className="rounded-2xl border bg-card overflow-hidden mb-6">
        {/* Top colour strip */}
        <div className="h-20 bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-card shadow-sm">
                <AvatarImage src={currentUser?.avatar} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {currentUser?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card" />
            </div>

            <div className="flex-1 sm:mb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
                {currentUser?.isEmailVerified && (
                  <Badge className="text-[10px] bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400 gap-1">
                    <Shield className="h-3 w-3" /> Verified
                  </Badge>
                )}
                {currentUser?.authProvider === 'google' && (
                  <Badge variant="outline" className="text-[10px]">Google account</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{currentUser?.email}</p>
            </div>

            <Link to="/profile/settings" className="sm:mb-1 shrink-0">
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <Settings className="h-4 w-4" /> Edit profile
              </Button>
            </Link>
          </div>

          {/* Bio */}
          {currentUser?.bio ? (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">
              {currentUser.bio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic mb-4">No bio added yet.</p>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {socialLinks.map(({ href, icon, label }) => (
                <SocialLink key={label} href={href} icon={icon} label={label} />
              ))}
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {currentUser?.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(currentUser.createdAt)}
              </span>
            )}
            {currentUser?.lastLogin && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Last seen {formatDate(currentUser.lastLogin)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={Bookmark}
          value={savedTools?.length ?? '—'}
          label="Saved tools"
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Heart}
          value={currentUser?.likedBlogs?.length ?? currentUser?.likedTools?.length ?? '—'}
          label="Liked items"
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
        <StatCard
          icon={Star}
          value={reviews.length || '-'}
          label="Reviews written"
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          icon={MessageSquare}
          value={comments.length || '-'}
          label="Comments posted"
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="saved">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="saved" className="gap-2 flex-1 sm:flex-none">
            <Bookmark className="h-4 w-4" />
            Saved tools
            {savedTools?.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ml-1">
                {savedTools.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2 flex-1 sm:flex-none">
            <Star className="h-4 w-4" />
            Reviews
            {reviews.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ml-1">
                {reviews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2 flex-1 sm:flex-none">
            <MessageSquare className="h-4 w-4" />
            Comments
            {comments.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ml-1">
                {comments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Saved tools */}
        <TabsContent value="saved" className="mt-6">
          {savedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : savedTools?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedTools.map((tool) => (
                <ToolCard key={tool._id} tool={tool} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bookmark}
              title="No saved tools yet"
              description="Browse AI tools and save the ones you want to come back to."
              action={
                <Link to="/ai-tools">
                  <Button size="sm" className="rounded-full">Browse AI tools</Button>
                </Link>
              }
            />
          )}
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="mt-6">
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="p-5 rounded-xl border bg-card">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      {r.title && (
                        <p className="font-semibold text-sm mb-1">{r.title}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <StarRating rating={r.rating} showValue size="sm" />
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {r.targetType}
                        </Badge>
                        {!r.isApproved && (
                          <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800 border-0 dark:bg-amber-900/30 dark:text-amber-400">
                            Pending approval
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {r.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Your reviews on AI tools, courses, blogs and prompts will appear here."
            />
          )}
        </TabsContent>

        {/* Comments */}
        <TabsContent value="comments" className="mt-6">
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="p-5 rounded-xl border bg-card">
                  <p className="text-sm leading-relaxed mb-3">{c.content}</p>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {c.blog?.title ? (
                        <Link
                          to={`/blogs/${c.blog.slug}`}
                          className="text-primary hover:underline"
                        >
                          {c.blog.title}
                        </Link>
                      ) : 'Unknown post'}
                    </span>
                    <div className="flex items-center gap-2">
                      {!c.isApproved && (
                        <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800 border-0 dark:bg-amber-900/30 dark:text-amber-400">
                          Pending
                        </Badge>
                      )}
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No comments yet"
              description="Comments you leave on blog posts will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}