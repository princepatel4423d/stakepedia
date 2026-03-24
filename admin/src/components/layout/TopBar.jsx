import { Moon, Sun, Monitor, LogOut, User, Settings, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@/hooks/useAdminAuth'

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor }

const TopBar = () => {
  const navigate = useNavigate()
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const admin = useAuthStore((s) => s.admin)
  const ThemeIcon = THEME_ICONS[theme]
  const { handleLogout } = useAdminAuth()

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