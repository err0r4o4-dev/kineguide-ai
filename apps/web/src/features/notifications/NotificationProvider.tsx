import { type ReactNode, useMemo, useState } from 'react'

import {
  NotificationContext,
  type NotificationContextValue
} from './NotificationContext'

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<
    NotificationContextValue['notifications']
  >([])
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
