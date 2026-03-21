import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search, Sun, Moon, Menu, Bot,
  BookOpen, FileText, Zap, LogOut,
  User, Settings, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const NAV = [
  { label: 'AI Tools', href: '/ai-tools', icon: Bot },
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'Blogs', href: '/blogs', icon: FileText },
  { label: 'Prompts', href: '/prompts', icon: Zap },
]

const CONTACT_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export default function Navbar({ transparent = false }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [mobileContactOpen, setMobileContactOpen] = useState(false)
  const [search, setSearch] = useState('')

  const userRef = useRef(null)
  const contactRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
      if (contactRef.current && !contactRef.current.contains(e.target)) setContactOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = search.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setSearch('')
      setMobileOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserOpen(false)
    setMobileOpen(false)
  }

  const solid = scrolled || !transparent || mobileOpen

  return (
    <header className={cn(
      'sticky top-0 inset-x-0 z-50 transition-all duration-300',
      solid
        ? 'bg-background/95 backdrop-blur-md border-b'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Stakepedia</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-2">
            {NAV.map(({ label, href }) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) => cn(
                  'px-2 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {label}
              </NavLink>
            ))}

            <div className="relative" ref={contactRef}>
              <button
                type="button"
                onClick={() => setContactOpen((s) => !s)}
                className="px-2 py-1.5 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-accent inline-flex items-center gap-1"
              >
                Contact
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', contactOpen && 'rotate-180')} />
              </button>

              {contactOpen && (
                <div className="absolute left-0 top-full mt-2 w-44 bg-popover border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                  {CONTACT_LINKS.map(({ label, href }) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setContactOpen(false)}
                      className="block px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-60 ml-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools, prompts..."
                className="w-full h-9 pl-9 pr-3 rounded-full bg-muted border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto sm:ml-2">

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />}
            </button>

            {/* Auth — desktop */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-1.5 h-8 px-1.5 rounded-md hover:bg-accent transition-colors"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatar} referrerPolicy="no-referrer" />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-popover border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                    <div className="px-3 py-2.5 border-b mb-1">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors">
                      <User className="h-4 w-4 text-muted-foreground" /> My profile
                    </Link>
                    <Link to="/profile/settings" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors">
                      <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                    </Link>
                    <div className="border-t my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/login"
                  className="px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                  Sign in
                </Link>
              </div>
            )}

            {/* Mobile menu trigger — Sheet */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                    <Menu className="h-4 w-4" />
                  </button>
                </SheetTrigger>

                <SheetContent side="left" className="w-70 sm:w-[320px] p-0 flex flex-col">

                  {/* Sidebar header */}
                  <SheetHeader className="px-5 py-5 border-b shrink-0">
                    <SheetTitle asChild>
                      <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                          <Bot className="h-4.5 w-4.5 text-primary-foreground" />
                        </div>
                        <span className="font-black text-lg tracking-tight">Stakepedia</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Scrollable body */}
                  <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search..."
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </form>

                    {/* Section label */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                      Navigate
                    </p>

                    {/* Main nav links */}
                    {NAV.map(({ label, href, icon: Icon }) => (
                      <NavLink
                        key={href}
                        to={href}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                          isActive
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <div className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                          'bg-muted'
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {label}
                      </NavLink>
                    ))}

                    {/* Contact accordion */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setMobileContactOpen((s) => !s)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          More pages
                        </span>
                        <ChevronDown className={cn('h-4 w-4 transition-transform shrink-0', mobileContactOpen && 'rotate-180')} />
                      </button>

                      {mobileContactOpen && (
                        <div className="pl-14 pr-2 pt-1 space-y-0.5">
                          {CONTACT_LINKS.map(({ label, href }) => (
                            <Link
                              key={href}
                              to={href}
                              onClick={() => { setMobileContactOpen(false); setMobileOpen(false) }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                              <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                              {label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar footer — auth */}
                  <div className="border-t px-3 py-4 shrink-0 space-y-1">
                    {user ? (
                      <>
                        {/* User info */}
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 mb-2">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={user.avatar} referrerPolicy="no-referrer" />
                            <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>

                        <Link to="/profile" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                          <User className="h-4 w-4" /> My profile
                        </Link>
                        <Link to="/profile/settings" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full">
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2 px-1">
                        <Link to="/login" onClick={() => setMobileOpen(false)}
                          className="w-full text-center py-2.5 rounded-xl border text-sm font-medium hover:bg-accent transition-colors">
                          Sign in
                        </Link>
                        <Link to="/register" onClick={() => setMobileOpen(false)}
                          className="w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                          Get started
                        </Link>
                      </div>
                    )}
                  </div>

                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>
      </div>
    </header>
  )
}