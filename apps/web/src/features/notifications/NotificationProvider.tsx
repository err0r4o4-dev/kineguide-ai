import { type ReactNode, useMemo, useState } from 'react'

import {
  type AppNotification,
  NotificationContext,
  type NotificationContextValue
} from './NotificationContext'

const initialNotifications: AppNotification[] = [
  {
    id: 'today-plan',
    category: 'activity',
    group: 'today',
    icon: 'calendar',
    titleKey: 'notifications.items.planTitle',
    bodyKey: 'notifications.items.planBody',
    timeKey: 'notifications.times.today0900',
    actionKey: 'notifications.startActivity',
    actionTo: '/app/plan',
    read: false
  },
  {
    id: 'streak',
    category: 'activity',
    group: 'today',
    icon: 'trend',
    titleKey: 'notifications.items.streakTitle',
    bodyKey: 'notifications.items.streakBody',
    timeKey: 'notifications.times.today0815',
    read: false
  },
  {
    id: 'assistant-summary',
    category: 'system',
    group: 'today',
    icon: 'message',
    titleKey: 'notifications.items.assistantTitle',
    bodyKey: 'notifications.items.assistantBody',
    timeKey: 'notifications.times.today0740',
    actionKey: 'notifications.openMessage',
    actionTo: '/app/chat',
    read: false
  },
  {
    id: 'activity-saved',
    category: 'activity',
    group: 'yesterday',
    icon: 'check',
    titleKey: 'notifications.items.savedTitle',
    bodyKey: 'notifications.items.savedBody',
    timeKey: 'notifications.times.yesterday1830',
    read: true
  },
  {
    id: 'camera-permission',
    category: 'activity',
    group: 'yesterday',
    icon: 'camera',
    titleKey: 'notifications.items.cameraTitle',
    bodyKey: 'notifications.items.cameraBody',
    timeKey: 'notifications.times.yesterday1020',
    actionKey: 'notifications.checkSettings',
    actionTo: '/app/settings',
    read: true
  },
  {
    id: 'privacy-update',
    category: 'system',
    group: 'earlier',
    icon: 'shield',
    titleKey: 'notifications.items.privacyTitle',
    bodyKey: 'notifications.items.privacyBody',
    timeKey: 'notifications.times.earlier',
    read: true
  }
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [preferences, setPreferences] = useState({
    activityReminder: true,
    progressSummary: true,
    systemUpdates: true
  })

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read)
        .length,
      preferences,
      markAllRead: () =>
        setNotifications((current) =>
          current.map((notification) => ({ ...notification, read: true }))
        ),
      markRead: (id) =>
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        ),
      togglePreference: (key) =>
        setPreferences((current) => ({
          ...current,
          [key]: !current[key]
        }))
    }),
    [notifications, preferences]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
