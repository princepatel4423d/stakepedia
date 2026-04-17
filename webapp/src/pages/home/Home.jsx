import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Bot, BookOpen, FileText,
  Zap, Star, Users, Sparkles, ImageOff,
  Clock, Heart, GraduationCap, TrendingUp, Globe,
  ChevronRight, Code2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import PricingBadge from '@/components/common/PricingBadge'
import StarRating from '@/components/common/StarRating'
import { ReviewsBanner } from '@/components/common/Banners'
import { aiToolsApi } from '@/api/aitools.api'
import { blogsApi } from '@/api/blogs.api'
import { categoriesApi } from '@/api/categories.api'
import { coursesApi } from '@/api/courses.api'
import { promptsApi } from '@/api/prompts.api'
import { statsApi } from '@/api/stats.api'
import { formatDate, readTime } from '@/lib/utils'
import Hero from './Hero'
import CTASection from './CTASection'

/* Tool card */
function ToolCard({ tool }) {
  return (
    <Link
      to={`/ai-tools/${tool.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Mini cover band */}
      <div className="h-24 w-full bg-linear-to-br from-primary/8 to-transparent overflow-hidden relative">
        {tool.coverImage && (
          <img src={tool.coverImage} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300" referrerPolicy="no-referrer" />
        )}
        {tool.isFeatured && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400/90 text-amber-950 text-[9px] font-bold uppercase tracking-wide">
            <Sparkles className="h-2 w-2" /> Featured
          </span>
        )}
      </div>
      {/* Logo */}
      <div className="px-4 -mt-5 mb-3 z-10">
        <div className="h-12 w-12 rounded-xl border-2 border-background bg-card shadow-md flex items-center justify-center overflow-hidden">
          {tool.logo
            ? <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            : <Bot className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>
      <div className="px-4 pb-4 flex flex-col flex-1 gap-1.5">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{tool.name}</h3>
          <PricingBadge pricing={tool.pricing} className="shrink-0" />
        </div>
        {tool.category && (
          <span className="text-[10px] font-semibold" style={{ color: tool.category.color || '#6366f1' }}>{tool.category.name}</span>
        )}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {tool.shortDescription || tool.description || 'Description coming soon.'}
        </p>
        {tool.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-auto pt-1">
            <StarRating rating={tool.averageRating} size="sm" />
            <span className="text-[11px] text-muted-foreground">({tool.reviewCount || 0})</span>
          </div>
        )}
      </div>
    </Link>
  )
}

/* Blog card */
function BlogCard({ blog }) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group flex gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
    >
      <div className="h-18 w-24 rounded-xl shrink-0 overflow-hidden border border-border/40 bg-muted/40">
        {blog.coverImage ? (
          <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
        ) : (
          <div className="h-full w-full flex items-center justify-center"><ImageOff className="h-4 w-4 text-muted-foreground/40" /></div>
        )}
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1 leading-snug">{blog.title}</h3>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{blog.readTime || readTime(blog.content)} min</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />{blog.likeCount || 0}</span>
        </div>
      </div>
    </Link>
  )
}

/* Course card */
function CourseCard({ course }) {
  const totalDuration = course.totalDuration || course.lessons?.reduce((s, l) => s + (l.duration || 0), 0) || 0
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative w-full h-44 bg-linear-to-br from-primary/10 to-primary/3 overflow-hidden">
        {course.coverImage
          ? <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
          : <div className="w-full h-full flex items-center justify-center"><GraduationCap className="h-14 w-14 text-primary/20" /></div>
        }
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-background/80 text-foreground">{course.level || 'Beginner'}</span>
          {course.pricing === 'free' && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-emerald-500 text-white">Free</span>}
          {course.pricing === 'paid' && course.price > 0 && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-background/80 text-foreground">${course.price}</span>}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1 leading-snug">{course.title}</h3>
        <p className="text-xs text-muted-foreground mb-3">{course.instructor || 'Instructor TBA'}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.lessons?.length || 0} lessons</span>
          {totalDuration > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{totalDuration}m</span>}
          {course.averageRating > 0 && <span className="flex items-center gap-1 ml-auto"><Star className="h-3 w-3 text-amber-400 fill-amber-400" />{course.averageRating.toFixed(1)}</span>}
        </div>
      </div>
    </Link>
  )
}

/* Main */
export default function Home() {
  const { data: featuredTools, isLoading: toolsLoading } = useQuery({
    queryKey: ['featured-tools'],
    queryFn: () => aiToolsApi.getFeatured(8),
    select: (res) => res.data.data,
  })

  const { data: featuredBlogs, isLoading: blogsLoading } = useQuery({
    queryKey: ['featured-blogs'],
    queryFn: () => blogsApi.getFeatured(4),
    select: (res) => res.data.data,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories-home'],
    queryFn: () => categoriesApi.getAll({ limit: 12 }),
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.items || [])
    },
  })

  const { data: featuredCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: () => coursesApi.getAll({ limit: 3, status: 'published', isFeatured: true }),
    select: (res) => res.data.data,
  })

  const { data: toolsSummary } = useQuery({
    queryKey: ['tools-summary-home'],
    queryFn: () => aiToolsApi.getAll({ page: 1, limit: 1, status: 'published' }),
    select: (res) => ({ total: res.data?.pagination?.total || 0 }),
  })

  const { data: coursesSummary } = useQuery({
    queryKey: ['courses-summary-home'],
    queryFn: () => coursesApi.getAll({ page: 1, limit: 1, status: 'published' }),
    select: (res) => ({ total: res.data?.pagination?.total || 0 }),
  })

  const { data: promptsSummary } = useQuery({
    queryKey: ['prompts-summary-home'],
    queryFn: () => promptsApi.getAll({ page: 1, limit: 1, status: 'published' }),
    select: (res) => ({
      total: res.data?.pagination?.total || 0,
    }),
  })

  const { data: publicStats } = useQuery({
    queryKey: ['public-stats-home'],
    queryFn: () => statsApi.getPublic(),
    select: (res) => res.data?.data || null,
  })

  const formatCount = (num, fallback = '0') => {
    const n = Number(num)
    if (!Number.isFinite(n) || n <= 0) return fallback
    if (n >= 1000000) return `${Math.floor(n / 100000) / 10}M+`
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`
    return `${n}+`
  }

  const tools = Array.isArray(featuredTools) ? featuredTools : []
  const blogs = Array.isArray(featuredBlogs) ? featuredBlogs : []
  const courses = Array.isArray(featuredCourses) ? featuredCourses : []

  const topCategory = Array.isArray(categories) && categories.length > 0
    ? [...categories].sort((a, b) => (b.toolCount || 0) - (a.toolCount || 0))[0]
    : null

  const heroStats = {
    tools: formatCount(toolsSummary?.total || 0, '0'),
    courses: formatCount(coursesSummary?.total || 0, '0'),
    prompts: formatCount(promptsSummary?.total || 0, '0'),
    users: formatCount(publicStats?.users?.total || 0, '0'),
  }

  const ctaStats = {
    tools: formatCount(toolsSummary?.total || 0, '0'),
    prompts: formatCount(promptsSummary?.total || 0, '0'),
    courses: formatCount(coursesSummary?.total || 0, '0'),
    users: formatCount(publicStats?.users?.total || 0, '0'),
  }

  /* ── Split tools at midpoint for banner injection ── */
  const toolsMid = Math.ceil(tools.length / 2)
  const toolsFirstHalf = tools.slice(0, toolsMid)
  const toolsSecondHalf = tools.slice(toolsMid)

  return (
    <div className="overflow-x-hidden">

      <Hero
        heroPills={tools}
        stats={heroStats}
        featuredTool={tools[0] || null}
        topCategories={(categories || []).slice(0, 5).map((c) => c.name)}
        metaStats={{
          newToday: tools.length,
          topCategory: topCategory?.name || 'N/A',
          prompts: promptsSummary?.total || 0,
          users: formatCount(publicStats?.users?.total || 0, '0'),
        }}
      />

      {/* CATEGORIES */}
      {categories?.length > 0 && (
        <section className="py-14 bg-muted/20 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Browse</p>
                <h2 className="text-3xl font-bold">Explore by category</h2>
                <p className="text-muted-foreground mt-1 text-sm">Find exactly the type of AI tool you need</p>
              </div>
              <Link to="/ai-tools" className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0">
                All tools <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/ai-tools?category=${cat._id}`}
                  className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-center"
                >
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
                    style={{ backgroundColor: cat.color || '#6366f1' }}
                  >
                    {/* {cat.icon ? <img src={cat.icon} alt="" className="h-6 w-6 object-contain" /> : cat.name?.charAt(0)} */}
                  </div>
                  <span className="text-xs font-semibold group-hover:text-primary transition-colors leading-tight">{cat.name}</span>
                  {cat.toolCount > 0 && (
                    <span className="text-[10px] text-muted-foreground">{cat.toolCount} tools</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED TOOLS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Hand-picked</p>
              <h2 className="text-3xl font-bold">Featured AI Tools</h2>
              <p className="text-muted-foreground mt-1 text-sm">Tools our team has reviewed and recommends</p>
            </div>
            <Link to="/ai-tools" className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {toolsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
            </div>
          ) : tools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* First half */}
              {toolsFirstHalf.map((tool) => (
                <ToolCard key={tool._id} tool={tool} />
              ))}

              {/* ── Mid-list banner ── */}
              <ReviewsBanner />

              {/* Second half */}
              {toolsSecondHalf.map((tool) => (
                <ToolCard key={tool._id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground">No featured tools yet.</div>
          )}

          {tools.length > 0 && (
            <div className="mt-8 text-center">
              <Link to="/ai-tools">
                <Button variant="outline" className="rounded-xl gap-2 px-8">
                  Browse all tools <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* WHY US — Feature strip */}
      <section className="py-16 bg-muted/20 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Why choose us</p>
            <h2 className="text-3xl font-bold mb-3">Everything AI in one place</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">We've built the most comprehensive AI resource hub so you don't have to search anywhere else.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/10',
                title: 'AI Tools Directory',
                desc: '500+ curated AI tools across every category, with honest reviews and ratings from real users.',
              },
              {
                icon: GraduationCap, color: 'text-violet-500', bg: 'bg-violet-500/10',
                title: 'Structured Courses',
                desc: 'Learn AI skills step by step with beginner to advanced courses taught by industry experts.',
              },
              {
                icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10',
                title: 'Prompt Library',
                desc: 'Over 1,000 ready-to-use prompts with variable support - just fill in and copy.',
              },
              {
                icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10',
                title: 'Expert Blog',
                desc: 'In-depth tutorials, comparisons and insights written by AI practitioners.',
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES */}
      {(coursesLoading || courses.length > 0) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Learn</p>
                <h2 className="text-3xl font-bold">Learn AI Skills</h2>
                <p className="text-muted-foreground mt-1 text-sm">Structured courses for every skill level</p>
              </div>
              <Link to="/courses" className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0">
                All courses <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {coursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => <CourseCard key={course._id} course={course} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* BLOGS + PROMPTS SPLIT */}
      <section className="py-16 bg-muted/20 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Blogs */}
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Read</p>
                  <h2 className="text-2xl font-bold">From the Blog</h2>
                  <p className="text-muted-foreground mt-1 text-sm">Tips, tutorials and AI insights</p>
                </div>
                <Link to="/blogs" className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0">
                  All posts <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {blogsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
              ) : blogs.length > 0 ? (
                <div className="space-y-3">
                  {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No blog posts yet.</p>
              )}
            </div>

            {/* Prompts CTA */}
            <div className="flex flex-col">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Use</p>
                <h2 className="text-2xl font-bold">Prompt Library</h2>
                <p className="text-muted-foreground mt-1 text-sm">Copy-ready prompts for every AI tool</p>
              </div>

              <div className="space-y-3 flex-1">
                {[
                  { icon: Code2, label: 'Coding Prompts', desc: 'Debug, refactor & ship faster', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { icon: FileText, label: 'Writing Prompts', desc: 'Drafts, edits & creative copy', color: 'text-violet-500', bg: 'bg-violet-500/10' },
                  { icon: TrendingUp, label: 'Marketing Prompts', desc: 'Campaigns, hooks & ad copy', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { icon: Globe, label: 'SEO Prompts', desc: 'Rankings, meta & content briefs', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map(({ icon: Icon, label, desc, color, bg }) => (
                  <Link
                    key={label}
                    to={`/prompts?category=${encodeURIComponent(label.replace(' Prompts', ''))}`}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <CTASection stats={ctaStats} />

      {/* Float animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}