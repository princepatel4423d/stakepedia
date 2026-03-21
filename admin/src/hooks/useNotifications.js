import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notifications.api'
import { toast } from 'sonner'

export const useNotifications = () => {
  const qc = useQueryClient()

  const {
    data: unreadData,
    refetch: refetchUnread,
  } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn:  () => notificationsApi.getUnreadCount(),
    select:   (res) => res.data.data.count,
    refetchInterval: 30000, // poll every 30s
  })

  const {
    data: notificationsData,
    isLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationsApi.getAll({ limit: 20 }),
    select:   (res) => res.data.data,
    refetchInterval: 30000,
  })

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'unread'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'unread'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'unread'] })
    },
  })

  const clearAllMutation = useMutation({
    mutationFn: notificationsApi.clearAll,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'unread'] })
      toast.success('All notifications cleared')
    },
  })

  const refresh = async () => {
    await Promise.all([refetchNotifications(), refetchUnread()])
  }

  return {
    notifications: notificationsData?.notifications || [],
    unreadCount:   unreadData || 0,
    isLoading,
    refresh,
    markRead:    (id) => markReadMutation.mutate(id),
    markAllRead: ()   => markAllReadMutation.mutate(),
    remove:      (id) => deleteMutation.mutate(id),
    clearAll:    ()   => clearAllMutation.mutate(),
  }
}