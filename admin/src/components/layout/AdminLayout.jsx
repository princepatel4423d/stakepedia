import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useUIStore } from '@/store/uiStore'
import { useThemeStore } from '@/store/themeStore'
import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '@/api/settings.api'
import { cn } from '@/lib/utils'

const AdminLayout = () => {
  const collapsed    = useUIStore((s) => s.sidebarCollapsed)
  const syncFromServer = useThemeStore((s) => s.syncFromServer)

  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn:  () => settingsApi.get(),
    select:   (res) => res.data.data,
    staleTime: 1000 * 60 * 10,
  })

  useEffect(() => {
    if (data) syncFromServer(data)
  }, [data, syncFromServer])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className={cn(
        'flex flex-col flex-1 overflow-hidden transition-all duration-300',
        collapsed ? 'ml-0' : 'ml-0'
      )}>
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout