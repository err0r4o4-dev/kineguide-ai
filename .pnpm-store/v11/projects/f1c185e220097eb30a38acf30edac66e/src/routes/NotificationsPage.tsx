import { Bell, BellOff, CheckCircle2, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { useNotifications } from '@/features/notifications/NotificationContext'

export function NotificationsPage() {
  const { t } = useTranslation()
  const { notifications, unreadCount, markAllRead, markRead } =
    useNotifications()
  const [filter, setFilter] = useState<
    'all' | 'unread' | 'activity' | 'system'
  >('all')

  const filteredItems = notifications.filter((item) => {
    if (filter === 'unread') return !item.read
    if (filter === 'activity') return item.category === 'activity'
    if (filter === 'system') return item.category === 'system'
    return true
  })

  return (
    <div className="mx-auto max-w-5xl pb-8">
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

      {notifications.length > 0 && (
        <div
          aria-label={t('notifications.filters')}
          className="mt-8 flex gap-2 overflow-x-auto pb-2"
          role="group"
        >
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
      )}

      <section
        aria-label={t('notifications.list')}
        className={`${notifications.length > 0 ? 'kg-card mt-4 overflow-hidden' : 'mt-8'}`}
      >
        {filteredItems.length === 0 ? (
          <div className="kg-empty-state">
            <span className="grid size-16 place-items-center rounded-2xl bg-[var(--color-kg-night)] text-[var(--color-kg-accent)] shadow-lg shadow-emerald-950/10">
              <BellOff aria-hidden="true" size={29} />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-950">
              {t('notifications.empty')}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              {t('notifications.emptyBody')}
            </p>
            <Link className="kg-button-primary mt-6" to="/app/monitor">
              {t('dashboard.start')}
              <ChevronRight aria-hidden="true" size={18} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <article
                className={`flex gap-4 p-5 transition-colors ${!item.read ? 'bg-teal-50/45' : 'bg-white'}`}
                key={item.id}
              >
                <div className="mt-1">
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${!item.read ? 'bg-[var(--color-kg-night)] text-[var(--color-kg-accent)]' : 'bg-slate-100 text-slate-500'}`}
                  >
                    <Bell aria-hidden="true" size={18} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}
                    >
                      {t(item.titleKey)}
                    </p>
                    <p className="shrink-0 whitespace-nowrap text-xs text-slate-500">
                      {t(item.timeKey)}
                    </p>
                  </div>
                  <p
                    className={`mt-1 text-sm ${!item.read ? 'text-slate-700' : 'text-slate-500'}`}
                  >
                    {t(item.bodyKey)}
                  </p>
                  {!item.read && (
                    <button
                      aria-label={t('notifications.markOneRead', {
                        title: t(item.titleKey)
                      })}
                      className="mt-3 text-xs font-bold text-teal-800 underline decoration-teal-300 underline-offset-4"
                      onClick={() => markRead(item.id)}
                      type="button"
                    >
                      {t('notifications.markAllRead')}
                    </button>
                  )}
                </div>
                {item.actionTo && (
                  <Link
                    aria-label={t(item.actionKey ?? item.titleKey)}
                    className="grid size-11 shrink-0 place-items-center self-center rounded-xl text-slate-500 no-underline hover:bg-slate-100 hover:text-teal-800"
                    to={item.actionTo}
                  >
                    <ChevronRight aria-hidden="true" size={20} />
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
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
      className={active ? 'kg-filter-active' : 'kg-filter'}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}
