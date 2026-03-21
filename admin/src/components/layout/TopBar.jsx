import { Bell, Moon, Sun, Monitor, LogOut, User, Settings, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { useThemeStore } from '@/store/themeStore'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor }

const TopBar = () => {
  const navigate = useNavigate()
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const admin = useAuthStore((s) => s.admin)
  const ThemeIcon = THEME_ICONS[theme]
  const { handleLogout } = useAdminAuth()

  const {
    notifications, unreadCount,
    refresh,
    markRead, markAllRead, clearAll,
  } = useNotifications()

  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-10">
      {/* Left — breadcrumb / title area */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground capitalize">
          {admin?.role === 'superadmin' ? 'Super Admin' : 'Admin'} Panel
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="h-4 w-4 mr-2" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="h-4 w-4 mr-2" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="h-4 w-4 mr-2" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Sheet onOpenChange={(open) => {
          if (open) refresh()
        }}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-destructive border-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-96 p-0 flex flex-col">
            <SheetHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0">
              <SheetTitle className="text-base">Notifications</SheetTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearAll}>
                    Clear all
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <Bell className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium">All caught up</p>
                  <p className="text-xs text-muted-foreground mt-1">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      if (!n.isRead) markRead(n._id)
                      if (n.link) navigate(n.link)
                    }}
                    className={cn(
                      'px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors',
                      !n.isRead && 'bg-primary/5'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                      <div className={cn('flex-1 min-w-0', n.isRead && 'pl-4')}>
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Profile dropdown — with logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-6 gap-2 px-2 py-6 hover:bg-accent"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={admin?.avatar}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                  {admin?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-medium leading-tight max-w-25 truncate">
                  {admin?.name}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize leading-tight">
                  {admin?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Header */}
            <div className="px-3 py-2.5 border-b mb-1">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={admin?.avatar} referrerPolicy="no-referrer" />
                  <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                    {admin?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{admin?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
                </div>
              </div>
            </div>

            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" /> My profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/theme')}>
              <Monitor className="h-4 w-4 mr-2" /> Theme settings
            </DropdownMenuItem>
            {admin?.role !== 'superadmin' ? null : (
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" /> Site settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate('/profile?tab=security')}>
              <Shield className="h-4 w-4 mr-2" />
              {admin?.twoFactorEnabled ? '2FA enabled' : 'Enable 2FA'}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default TopBar