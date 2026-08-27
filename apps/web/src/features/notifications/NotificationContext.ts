import { createContext, useContext } from 'react'

export type NotificationCategory = 'activity' | 'system'
export type NotificationGroup = 'today' | 'yesterday' | 'earlier'
export type NotificationIcon =
  'calendar' | 'camera' | 'check' | 'message' | 'shield' | 'trend'

export type AppNotification = {
  id: string
  category: NotificationCategory
  group: NotificationGroup
  icon: NotificationIcon
  titleKey: string
  bodyKey: string
  timeKey: string
  actionKey?: string
  actionTo?: string
  read: boolean
}

export type PreferenceKey =
  'activityReminder' | 'progressSummary' | 'systemUpdates'

export type NotificationContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  preferences: Record<PreferenceKey, boolean>
  markAllRead: () => void
  markRead: (id: string) => void
  togglePreference: (key: PreferenceKey) => void
}

export const NotificationContext =
  createContext<NotificationContextValue | null>(null)

export function useNotifications() {
  const value = useContext(NotificationContext)
  if (!value) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return value
}
