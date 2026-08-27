import {
  Bell,
  CalendarClock,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  LineChart,
  MessageCircle,
  Settings,
  ShieldCheck
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import {
  type AppNotification,
  type NotificationCategory,
  type NotificationGroup,
  type NotificationIcon,
  useNotifications
} from '@/features/notifications/NotificationContext'

type Filter = 'all' | 'unread' | NotificationCategory

const iconByType: Record<NotificationIcon, LucideIcon> = {
  calendar: CalendarClock,
  camera: Camera,
  check: CheckCircle2,
  message: MessageCircle,
  shield: ShieldCheck,
  trend: LineChart
}

const iconStyleByType: Record<NotificationIcon, string> = {
  calendar: 'bg-teal-50 text-teal-700 ring-teal-100',
  camera: 'bg-blue-50 text-blue-700 ring-blue-100',
  check: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  message: 'bg-teal-50 text-teal-700 ring-teal-100',
  shield: 'bg-violet-50 text-violet-700 ring-violet-100',
  trend: 'bg-emerald-50 text-emerald-700 ring-emerald-100'
}

const groups: NotificationGroup[] = ['today', 'yesterday', 'earlier']

export function NotificationsPage() {
  const { t } = useTranslation()
  const {
    notifications,
    unreadCount,
    preferences,
    markAllRead,
    markRead,
    togglePreference
  } = useNotifications()
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(
    () => ({
      all: notifications.length,
      unread: unreadCount,
      activity: notifications.filter(({ category }) => category === 'activity')
        .length,
      system: notifications.filter(({ category }) => category === 'system')
        .length
    }),
    [notifications, unreadCount]
  )
  const visibleNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    return notification.category === filter
  })

  const filters: Filter[] = ['all', 'unread', 'activity', 'system']

  return (
    <div>
      <PageHeader
        actions={
          <button
            className="kg-button-secondary"
            disabled={unreadCount === 0}
            onClick={markAllRead}
            type="button"
          >
            <Check aria-hidden="true" size={19} />
            {t('notifications.markAllRead')}
          </button>
        }
        subtitle={t('notifications.subtitle')}
        title={t('notifications.title')}
      />

      <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          aria-label={t('notifications.filters')}
          className="grid grid-cols-2 overflow-hidden rounded-xl border border-kg-border bg-white sm:inline-flex sm:w-auto"
          role="group"
        >
          {filters.map((value) => (
            <button
              aria-pressed={filter === value}
              className={`min-h-11 border-kg-border px-4 py-2 text-sm font-semibold transition-colors sm:min-w-28 sm:border-r last:sm:border-r-0 ${filter === value ? 'bg-kg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {t(`notifications.filter.${value}`)} {counts[value]}
            </button>
          ))}
        </div>
        <span className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-kg-border bg-white px-4 text-sm font-medium text-slate-600 lg:self-auto">
          <CalendarClock aria-hidden="true" size={18} />
          {t('notifications.last30Days')}
        </span>
      </div>

      <p aria-live="polite" className="sr-only">
        {t('notifications.unreadStatus', { count: unreadCount })}
      </p>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,0.85fr)]">
        <section
          aria-label={t('notifications.list')}
          className="kg-card overflow-hidden"
        >
          {visibleNotifications.length === 0 ? (
            <div className="grid min-h-64 place-items-center px-5 py-12 text-center">
              <div>
                <Bell
                  aria-hidden="true"
                  className="mx-auto text-slate-300"
                  size={38}
                />
                <h2 className="mt-4 font-bold text-slate-900">
                  {t('notifications.empty')}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('notifications.emptyBody')}
                </p>
              </div>
            </div>
          ) : (
            groups.map((group) => {
              const grouped = visibleNotifications.filter(
                (notification) => notification.group === group
              )
              if (grouped.length === 0) return null
              return (
                <div key={group}>
                  <h2 className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-base font-bold text-slate-900 sm:px-6">
                    {t(`notifications.group.${group}`)}
                  </h2>
                  <div className="divide-y divide-slate-100">
                    {grouped.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={markRead}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </section>

        <aside className="grid gap-5" aria-label={t('notifications.summary')}>
          <section className="kg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              {t('notifications.summary')}
            </h2>
            <dl className="mt-4 grid gap-3">
              <SummaryRow
                icon={MessageCircle}
                label={t('notifications.filter.unread')}
                value={counts.unread}
              />
              <SummaryRow
                icon={LineChart}
                label={t('notifications.filter.activity')}
                value={counts.activity}
              />
              <SummaryRow
                icon={Settings}
                label={t('notifications.filter.system')}
                value={counts.system}
              />
            </dl>
          </section>

          <section className="kg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              {t('notifications.preferences')}
            </h2>
            <div className="mt-3 divide-y divide-slate-100">
              <PreferenceSwitch
                checked={preferences.activityReminder}
                label={t('notifications.preference.activityReminder')}
                onChange={() => togglePreference('activityReminder')}
              />
              <PreferenceSwitch
                checked={preferences.progressSummary}
                label={t('notifications.preference.progressSummary')}
                onChange={() => togglePreference('progressSummary')}
              />
              <PreferenceSwitch
                checked={preferences.systemUpdates}
                label={t('notifications.preference.systemUpdates')}
                onChange={() => togglePreference('systemUpdates')}
              />
            </div>
            <Link
              className="mt-3 flex min-h-11 items-center justify-between gap-3 font-semibold text-teal-700 no-underline hover:text-teal-900"
              to="/app/settings"
            >
              {t('notifications.manageSettings')}
              <ChevronRight aria-hidden="true" size={18} />
            </Link>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {t('notifications.preferencesBody')}
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

function NotificationItem({
  notification,
  onRead
}: {
  notification: AppNotification
  onRead: (id: string) => void
}) {
  const { t } = useTranslation()
  const Icon = iconByType[notification.icon]

  return (
    <article
      className={`relative flex gap-3 px-4 py-4 sm:gap-4 sm:px-6 ${notification.read ? 'bg-white' : 'bg-teal-50/45'}`}
      data-testid="notification-item"
    >
      <span
        aria-hidden="true"
        className={`grid size-11 shrink-0 place-items-center rounded-full ring-1 ring-inset ${iconStyleByType[notification.icon]}`}
      >
        <Icon size={21} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="font-bold leading-6 text-slate-950">
              {t(notification.titleKey)}
            </h3>
            <p className="mt-0.5 text-sm leading-6 text-slate-600">
              {t(notification.bodyKey)}
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium text-slate-500 sm:pt-1">
            {t(notification.timeKey)}
          </span>
        </div>
        <div className="mt-2 flex min-h-6 items-center justify-between gap-3">
          {notification.actionKey && notification.actionTo ? (
            <Link
              className="font-semibold text-teal-700 no-underline hover:text-teal-900"
              onClick={() => onRead(notification.id)}
              to={notification.actionTo}
            >
              {t(notification.actionKey)}
            </Link>
          ) : (
            <span />
          )}
          {!notification.read && (
            <button
              aria-label={t('notifications.markOneRead', {
                title: t(notification.titleKey)
              })}
              className="grid size-8 shrink-0 place-items-center rounded-full text-teal-700 hover:bg-teal-100"
              onClick={() => onRead(notification.id)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-teal-700"
              />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function SummaryRow({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4">
      <Icon aria-hidden="true" className="text-teal-700" size={19} />
      <dt className="flex-1 text-sm text-slate-700">{label}</dt>
      <dd className="m-0 text-lg font-bold tabular-nums text-slate-950">
        {value}
      </dd>
    </div>
  )
}

function PreferenceSwitch({
  checked,
  label,
  onChange
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        aria-checked={checked}
        aria-label={label}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${checked ? 'border-teal-700 bg-teal-700' : 'border-slate-300 bg-slate-200'}`}
        onClick={onChange}
        role="switch"
        type="button"
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-0.5 translate-x-5' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}
