import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard, Bot, FileText, BookOpen, Zap,
  FolderOpen, Users, Shield, Mail, Flag,
  Bell, Settings, BarChart3, ChevronLeft, ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'viewAnalytics' },
  { type: 'separator', label: 'Content' },
  { label: 'AI Tools', href: '/ai-tools', icon: Bot, permission: 'manageAITools' },
  { label: 'Blogs', href: '/blogs', icon: FileText, permission: 'manageBlogs' },
  { label: 'Courses', href: '/courses', icon: BookOpen, permission: 'manageCourses' },
  { label: 'Prompts', href: '/prompts', icon: Zap, permission: 'managePrompts' },
  { label: 'Categories', href: '/categories', icon: FolderOpen, permission: 'manageAITools' },
  { type: 'separator', label: 'Management' },
  { label: 'Users', href: '/users', icon: Users, permission: 'manageUsers' },
  { label: 'Admins', href: '/admins', icon: Shield, permission: 'manageAdmins' },
  { label: 'Moderation', href: '/moderation', icon: Flag, permission: 'manageModeration' },
  { type: 'separator', label: 'System' },
  { label: 'Email', href: '/email/templates', icon: Mail, permission: 'manageEmail' },
  { label: 'Notifications', href: '/notifications/campaigns', icon: Bell, permission: 'manageNotifications' },
  { label: 'Audit Logs', href: '/audit', icon: BarChart3, permission: 'viewAuditLogs' },
  { label: 'Settings', href: '/settings', icon: Settings, permission: 'manageSettings' },
]

const NavItem = ({ item, collapsed }) => {
  const Icon = item.icon
  return (
    <NavLink
      to={item.href}
      end={item.href === '/dashboard'}
      className={({ isActive }) => cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all duration-150 group relative',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        collapsed && 'justify-center px-0'
      )}
    >
      {/* SAME SIZE ALWAYS */}
      <Icon className="h-4 w-4 shrink-0" />

      {!collapsed && <span className="truncate">{item.label}</span>}

      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-popover border text-popover-foreground text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-md transition-opacity">
          {item.label}
        </div>
      )}
    </NavLink>
  )
}

const Sidebar = () => {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.type === 'separator') return true
    if (item.permission && !hasPermission(item.permission)) return false
    if (item.anyPermissions && !item.anyPermissions.some((permission) => hasPermission(permission))) return false
    return true
  }).filter((item, index, items) => {
    if (item.type !== 'separator') return true
    const hasVisibleBefore = items.slice(0, index).some((entry) => entry.type !== 'separator')
    const hasVisibleAfter = items.slice(index + 1).some((entry) => entry.type !== 'separator')
    const nextItem = items[index + 1]
    return hasVisibleBefore && hasVisibleAfter && nextItem?.type !== 'separator'
  })

  return (
    <aside className={cn(
      'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0',
      collapsed ? 'w-14' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 px-3 border-b border-sidebar-border shrink-0',
        collapsed ? 'justify-center px-2' : 'justify-between'
      )}>
        {!collapsed && (
          <span className="font-bold text-base tracking-tight">
            Stake<span className="text-primary">pedia</span>
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
          onClick={toggleSidebar}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />
          }
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-hidden px-2 py-1 space-y-1">
        {visibleItems.map((item, i) => {
          if (item.type === 'separator') {
            return (
              <div key={i} className="pt-2 pb-1 px-1">
                {/* KEEP SPACE ALWAYS */}
                <span className={cn(
                  'block font-semibold uppercase tracking-widest text-muted-foreground/60',
                  collapsed ? 'text-xs opacity-0' : 'text-xs'
                )}>
                  {item.label}
                </span>
              </div>
            )
          }
          return <NavItem key={item.href} item={item} collapsed={collapsed} />
        })}
      </nav>
    </aside>
  )
}

export default Sidebar