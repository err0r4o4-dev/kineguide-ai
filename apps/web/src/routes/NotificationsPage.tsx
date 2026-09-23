import { Bell, CheckCircle2, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { useNotifications } from '@/features/notifications/NotificationContext'
import { formatTime } from '@/lib/format'

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const { unreadCount, markAllRead } = useNotifications()
  const [filter, setFilter] = useState<
    'all' | 'unread' | 'activity' | 'system'
  >('all')

  const language = i18n.resolvedLanguage === 'th' ? 'th' : 'en'

  // Placeholder static notifications for the posture context
  const items = [
    {
      id: 'n1',
      title: t('notifications.items.planTitle'),
      body: t('notifications.items.planBody'),
      date: new Date(),
      read: false,
      type: 'activity',
      link: '/app/monitor'
    },
    {
      id: 'n2',
      title: t('notifications.items.streakTitle'),
      body: t('notifications.items.streakBody'),
      date: new Date(Date.now() - 86400000), // yesterday
      read: true,
      type: 'activity',
      link: '/app/analytics'
    },
    {
      id: 'n3',
      title: t('notifications.items.cameraTitle'),
      body: t('notifications.items.cameraBody'),
      date: new Date(Date.now() - 172800000), // 2 days ago
      read: true,
      type: 'system',
      link: '/app/settings'
    }
  ]

  const filteredItems = items.filter((item) => {
    if (filter === 'unread') return !item.read
    if (filter === 'activity') return item.type === 'activity'
    if (filter === 'system') return item.type === 'system'
    return true
  })

  return (
    <div className="mx-auto max-w-4xl pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title={t('notifications.title')}
          subtitle={t('notifications.subtitle')}
        />
        {unreadCount > 0 && (
          <button
            className="kg-button-secondary self-start"
            onClick={markAllRead}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" size={18} />
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          {t('notifications.filter.all')}
        </FilterButton>
        <FilterButton
          active={filter === 'unread'}
          onClick={() => setFilter('unread')}
        >
          {t('notifications.filter.unread')}
        </FilterButton>
        <FilterButton
          active={filter === 'activity'}
          onClick={() => setFilter('activity')}
        >
          {t('notifications.filter.activity')}
        </FilterButton>
        <FilterButton
          active={filter === 'system'}
          onClick={() => setFilter('system')}
        >
          {t('notifications.filter.system')}
        </FilterButton>
      </div>

      <div className="kg-card mt-4 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Bell aria-hidden="true" className="text-slate-300" size={48} />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {t('notifications.empty')}
            </h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              {t('notifications.emptyBody')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className={`flex gap-4 p-5 no-underline hover:bg-slate-50 transition-colors ${
                  !item.read ? 'bg-teal-50/30' : ''
                }`}
              >
                <div className="mt-1">
                  {!item.read ? (
                    <span className="grid size-10 place-items-center rounded-full bg-teal-100 text-teal-800">
                      <Bell aria-hidden="true" size={18} />
                    </span>
                  ) : (
                    <span className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500">
                      <Bell aria-hidden="true" size={18} />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}
                    >
                      {item.title}
                    </p>
                    <p className="shrink-0 text-xs text-slate-500 whitespace-nowrap">
                      {formatTime(item.date, language)}
                    </p>
                  </div>
                  <p
                    className={`mt-1 text-sm ${!item.read ? 'text-slate-700' : 'text-slate-500'}`}
                  >
                    {item.body}
                  </p>
                </div>
                <div className="flex items-center self-center pl-2">
                  <ChevronRight
                    aria-hidden="true"
                    className="text-slate-400"
                    size={20}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
        active
          ? 'bg-teal-800 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}
