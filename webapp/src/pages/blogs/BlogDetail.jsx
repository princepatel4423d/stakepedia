import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Heart, Eye, MessageSquare, Send, Trash2,
  Clock, Calendar, Tag, Sparkles, Share2,
  Check, Twitter, Facebook, Linkedin, Link2,
  List, FileText, ImageOff, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { blogsApi } from '@/api/blogs.api'
import { useAuthStore } from '@/store/authStore'
import { formatDate, readTime } from '@/lib/utils'
import { toast } from 'sonner'

/* Parse h2/h3 headings from HTML for TOC */
function parseHeadings(html = '') {
  const div = document.createElement('div')
  div.innerHTML = html
  const nodes = div.querySelectorAll('h2, h3')
  return Array.from(nodes).map((node, i) => ({
    id: `heading-${i}`,
    text: node.textContent.trim(),
    level: parseInt(node.tagName[1]),
  }))
}

function injectHeadingIds(html = '') {
  let i = 0
  return html.replace(/<(h[1-4])(.*?)>/gi, (_, tag, attrs) => `<${tag}${attrs} id="heading-${i++}">`)
}

function normalizeRichHtml(html = '') {
  if (!html) return ''
  return html
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?\s*>)*<\/p>/gi, '')
    .replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li>$1</li>')
}

/* Table of Contents */
function TableOfContents({ headings, activeId }) {
  if (!headings.length) return null
  return (
    <nav className="space-y-0.5">
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className={`flex items-start gap-1.5 text-xs py-1.5 rounded transition-colors leading-snug
            ${h.level === 2 ? 'pl-3' : h.level === 3 ? 'pl-5' : ''}
            ${activeId === h.id
              ? 'text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          {activeId === h.id && <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />}
          {activeId !== h.id && <span className="h-3 w-3 mt-0.5 shrink-0" />}
          <span className="line-clamp-2">{h.text}</span>
        </a>
      ))}
    </nav>
  )
}

/* Social share */
function SocialShare({ url, title }) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent(url)
  const encT = encodeURIComponent(title)

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const socials = [
    { label: 'Twitter / X', icon: Twitter, href: `https://twitter.com/intent/tweet?url=${enc}&text=${encT}`, cls: 'hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/30' },
    { label: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`, cls: 'hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/30' },
    { label: 'LinkedIn', icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`, cls: 'hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30' },
  ]

  return (
    <div className="space-y-2">
      {socials.map(({ label, icon: Icon, href, cls }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground transition-all ${cls}`}>
          <Icon className="h-3.5 w-3.5 shrink-0" /> {label}
        </a>
      ))}
      <button onClick={copyLink}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <Link2 className="h-3.5 w-3.5 shrink-0" />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}

/* Related blog card */
function RelatedBlogCard({ blog }) {
  return (
    <Link to={`/blogs/${blog.slug}`}
      className="group flex gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition-all">
      <div className="h-14 w-14 rounded-lg shrink-0 overflow-hidden bg-muted border border-border/40">
        {blog.coverImage
          ? <img src={blog.coverImage} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
          : <div className="h-full w-full flex items-center justify-center"><ImageOff className="h-4 w-4 text-muted-foreground/40" /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors leading-snug">{blog.title}</p>
        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />{blog.readTime || readTime(blog.content)} min
        </p>
      </div>
    </Link>
  )
}

/* Comment item */
function CommentItem({ comment, onDelete, canDelete }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
          {comment.user?.name?.charAt(0)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold">{comment.user?.name || 'Anonymous'}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
            {canDelete && (
              <button onClick={() => onDelete(comment._id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
      </div>
    </div>
  )
}

/* Main page */
export default function BlogDetail() {
  const { slug } = useParams()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [comment, setComment] = useState('')
  const [activeHeading, setActiveHeading] = useState('')
  const [headings, setHeadings] = useState([])
  const [processedContent, setProcessedContent] = useState('')

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog-detail', slug],
    queryFn: () => blogsApi.getBySlug(slug),
    select: (res) => res.data.data,
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['blog-comments', blog?._id],
    queryFn: () => blogsApi.getComments(blog._id),
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.comments || [])
    },
    enabled: !!blog?._id,
  })

  const { data: relatedBlogs = [] } = useQuery({
    queryKey: ['related-blogs', blog?.categories?.[0], slug],
    queryFn: () => blogsApi.getAll({
      status: 'published', limit: 5,
      ...(blog?.categories?.[0] ? { category: blog.categories[0] } : {}),
    }),
    select: (res) => {
      const d = res.data.data
      const items = Array.isArray(d) ? d : (d?.items || [])
      return items.filter((b) => b.slug !== slug).slice(0, 4)
    },
    enabled: !!blog,
  })

  /* Build TOC after blog loads */
  useEffect(() => {
    if (blog?.content) {
      const normalized = normalizeRichHtml(blog.content)
      setHeadings(parseHeadings(normalized))
      setProcessedContent(injectHeadingIds(normalized))
    }
  }, [blog?.content])

  useEffect(() => {
    if (!blog?._id || !user?._id) return

    const sessionKey = `sp_blog_view_${user._id}_${blog._id}`
    if (sessionStorage.getItem(sessionKey)) return

    sessionStorage.setItem(sessionKey, 'pending')
    blogsApi.trackView(blog._id)
      .then(() => {
        sessionStorage.setItem(sessionKey, '1')
      })
      .catch(() => {
        sessionStorage.removeItem(sessionKey)
      })
  }, [blog?._id, user?._id])

  /* Track active heading via IntersectionObserver */
  useEffect(() => {
    if (!headings.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveHeading(e.target.id) })
      },
      { rootMargin: '-20% 0% -70% 0%' }
    )
    headings.forEach((h) => { const el = document.getElementById(h.id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [headings])

  const likeMutation = useMutation({
    mutationFn: () => blogsApi.toggleLike(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-detail', slug] }),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to like'),
  })

  const commentMutation = useMutation({
    mutationFn: (data) => blogsApi.addComment(blog._id, data),
    onSuccess: () => {
      toast.success('Comment submitted for moderation')
      setComment('')
      qc.invalidateQueries({ queryKey: ['blog-comments', blog._id] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to post comment'),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (cId) => blogsApi.deleteComment(blog._id, cId),
    onSuccess: () => { toast.success('Comment deleted'); qc.invalidateQueries({ queryKey: ['blog-comments', blog._id] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  })

  /* Loading */
  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <Skeleton className="h-4 w-28 mb-8" />
      <div className="flex gap-10">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
        <div className="w-64 shrink-0 space-y-3 hidden lg:block">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-4" />)}
        </div>
      </div>
    </div>
  )

  if (!blog) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <EmptyState icon={MessageSquare} title="Blog not found" description="This post may have been removed or the link is broken." />
    </div>
  )

  const articleReadTime = blog.readTime || readTime(blog.content)

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

      {/* Back */}
      <Link to="/blogs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Blog
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* LEFT - Article (80%) */}
        <div className="flex-1 min-w-0">

          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {blog.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-600 text-[10px] font-semibold uppercase tracking-wide">
                  <Sparkles className="h-2.5 w-2.5" /> Featured
                </span>
              )}
              {blog.categories?.map((cat) => (
                <Link key={cat} to={`/blogs?category=${encodeURIComponent(cat)}`}
                  className="text-[10px] font-semibold uppercase tracking-wider text-primary hover:underline">{cat}</Link>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-4">{blog.title}</h1>

            {blog.excerpt && (
              <p className="text-base text-muted-foreground leading-relaxed mb-5">{blog.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-3">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(blog.publishedAt || blog.createdAt)}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{articleReadTime} min read</span>
              <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{(blog.viewCount || 0).toLocaleString()} views</span>
              <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" />{blog.likeCount || 0} likes</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />{blog.commentCount || comments.length} comments</span>
            </div>
          </header>

          {/* Cover image */}
          {blog.coverImage && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-border">
              <img src={blog.coverImage} alt={blog.title} className="w-full h-64 sm:h-80 object-cover" referrerPolicy="no-referrer" />
            </div>
          )}

          {/* Article body */}
          <article
            className="blog-rich-content mb-10"
            dangerouslySetInnerHTML={{ __html: processedContent || blog.content || '<p>Content will be added soon.</p>' }}
          />

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border">
              {blog.tags.map((tag) => (
                <Link key={tag._id || tag} to={`/blogs?tag=${tag.slug || tag}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all">
                  <Tag className="h-2.5 w-2.5" />#{tag.name || tag}
                </Link>
              ))}
            </div>
          )}

          {/* Like bar */}
          <div className="flex items-center justify-between gap-4 mb-12 p-4 rounded-2xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">Found this helpful?</p>
            <Button
              variant={blog.isLiked ? 'default' : 'outline'}
              size="sm"
              className="gap-2 rounded-lg"
              onClick={() => user ? likeMutation.mutate() : toast.error('Sign in to like this post')}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 ${blog.isLiked ? 'fill-current' : ''}`} />
              {blog.isLiked ? 'Liked' : 'Like'} · {blog.likeCount || 0}
            </Button>
          </div>

          {/* Comments */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Comments
              {comments.length > 0 && <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>}
            </h2>

            {user ? (
              <div className="mb-6 space-y-3 p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..." rows={3}
                  className="resize-none rounded-xl border-border focus-visible:ring-primary/30" />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Comments are reviewed before publishing.</p>
                  <Button size="sm" className="gap-2 rounded-lg"
                    onClick={() => comment.trim() && commentMutation.mutate({ content: comment })}
                    disabled={!comment.trim() || commentMutation.isPending}>
                    <Send className="h-3.5 w-3.5" />
                    {commentMutation.isPending ? 'Posting...' : 'Post comment'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-6 rounded-2xl border border-dashed border-border bg-muted/20 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Sign in to join the conversation</p>
                <Link to="/login"><Button size="sm" className="rounded-lg">Sign in</Button></Link>
              </div>
            )}

            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((c) => (
                  <CommentItem key={c._id} comment={c}
                    canDelete={user?._id === c.user?._id}
                    onDelete={(id) => deleteCommentMutation.mutate(id)} />
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-border bg-card/50 text-center">
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT — Sidebar (20%) */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start">

          {/* Table of contents — sticky */}
          {headings.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <List className="h-3.5 w-3.5" /> On this page
              </h3>
              <TableOfContents headings={headings} activeId={activeHeading} />
            </div>
          )}

          {/* Share */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5" /> Share this post
            </h3>
            <SocialShare url={typeof window !== 'undefined' ? window.location.href : ''} title={blog.title} />
          </div>

          {/* Related articles */}
          {relatedBlogs.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Related articles
              </h3>
              <div className="space-y-2">
                {relatedBlogs.map((b) => <RelatedBlogCard key={b._id} blog={b} />)}
              </div>
              <Link to="/blogs" className="mt-3 flex items-center justify-center gap-1 text-xs text-primary hover:underline pt-2 border-t border-border">
                View all articles <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Categories */}
          {blog.categories?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Categories</h3>
              <div className="flex flex-wrap gap-1.5">
                {blog.categories.map((cat) => (
                  <Link key={cat} to={`/blogs?category=${encodeURIComponent(cat)}`}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-border hover:border-primary/30 hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {blog.tags.map((tag) => (
                  <Link key={tag._id || tag} to={`/blogs?tag=${tag.slug || tag}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all">
                    #{tag.name || tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}