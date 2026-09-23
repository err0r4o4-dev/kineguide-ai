import { useQuery } from '@tanstack/react-query'
import {
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  Search,
  Monitor
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { StatCard } from '@/components/StatCard'
import { formatDate, formatDuration } from '@/lib/format'
import { getDashboard, getSessions } from '@/services/product'

const HISTORY_PAGE_SIZE = 10

export function ProgressPage() {
  const { t, i18n } = useTranslation()
  const [range, setRange] = useState(7)
  const [search, setSearch] = useState('')
  const [historyPage, setHistoryPage] = useState(1)

  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => getDashboard(signal)
  })
  const sessions = useQuery({
    queryKey: ['sessions'],
    queryFn: ({ signal }) => getSessions(signal)
  })

  const visibleSessions = useMemo(
    () =>
      (sessions.data ?? [])
        .filter(() =>
          t('dashboard.todayName').toLowerCase().includes(search.toLowerCase())
        )
        .filter(
          (session) =>
            range === 0 ||
            new Date(session.started_at).getTime() >=
              Date.now() - range * 86400000
        ),
    [range, search, sessions.data, t]
  )

  const historyPageCount = Math.max(
    1,
    Math.ceil(visibleSessions.length / HISTORY_PAGE_SIZE)
  )
  const currentHistoryPage = Math.min(historyPage, historyPageCount)
  const paginatedSessions = visibleSessions.slice(
    (currentHistoryPage - 1) * HISTORY_PAGE_SIZE,
    currentHistoryPage * HISTORY_PAGE_SIZE
  )

  if (dashboard.isLoading || sessions.isLoading) return <QueryLoading />
  if (dashboard.isError || sessions.isError)
    return (
      <QueryError
        retry={() => {
          void dashboard.refetch()
          void sessions.refetch()
        }}
      />
    )
  if (!dashboard.data) return null

  return (
    <div>
      <PageHeader
        title={t('progress.title')}
        subtitle={t('progress.subtitle')}
      />
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarCheck2}
          label={t('progress.sessions')}
          value={String(dashboard.data.completed_sessions)}
        />
        <StatCard
          icon={Clock3}
          label={t('progress.time')}
          value={formatDuration(dashboard.data.total_seconds)}
        />
        <StatCard
          icon={Flame}
          label={t('progress.streak')}
          value={String(dashboard.data.current_streak)}
        />
      </section>

      <section className="kg-card mt-6 p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">{t('progress.chart')}</h2>
          <div className="flex gap-2" aria-label={t('progress.chart')}>
            {[7, 30, 90, 0].map((value) => (
              <button
                className={range === value ? 'kg-filter-active' : 'kg-filter'}
                key={value}
                onClick={() => {
                  setRange(value)
                  setHistoryPage(1)
                }}
                type="button"
              >
                {value === 0
                  ? t('notifications.filter.all')
                  : `${value} ${i18n.resolvedLanguage === 'th' ? 'วัน' : 'days'}`}
              </button>
            ))}
          </div>
        </div>
        <div
          className="mt-7 flex h-52 items-end gap-3 border-b border-slate-200 px-2"
          aria-label={t('progress.subtitle')}
          role="img"
        >
          {visibleSessions
            .slice(0, 12)
            .reverse()
            .map((session) => {
              const heightPercentage = Math.max(
                8,
                Math.min(100, (session.metrics.duration_seconds / 3600) * 100)
              )
              return (
                <div
                  className="flex h-full flex-1 flex-col justify-end"
                  key={session.id}
                >
                  <span
                    className="rounded-t-lg bg-teal-700 transition-all hover:bg-teal-600"
                    style={{ height: `${heightPercentage}%` }}
                    title={formatDuration(session.metrics.duration_seconds)}
                  />
                  <span className="pt-2 text-center text-xs text-slate-500">
                    {new Date(session.started_at).getDate()}
                  </span>
                </div>
              )
            })}
          {visibleSessions.length === 0 && (
            <p className="m-auto text-slate-500">{t('history.empty')}</p>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-500">{t('dashboard.manual')}</p>
      </section>

      <section className="kg-card mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">{t('history.title')}</h2>
          <label className="relative">
            <span className="sr-only">{t('history.search')}</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-3 text-slate-500"
              size={18}
            />
            <input
              className="min-h-11 rounded-xl border border-slate-300 bg-white pl-10 pr-3 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              onChange={(event) => {
                setSearch(event.target.value)
                setHistoryPage(1)
              }}
              placeholder={t('history.search')}
              value={search}
            />
          </label>
        </div>
        <div className="divide-y divide-slate-100">
          {paginatedSessions.map((session) => (
            <Link
              className="flex items-center gap-3 p-4 no-underline hover:bg-slate-50 sm:px-6"
              key={session.id}
              to={`/app/monitor/summary/${session.id}`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700">
                <Monitor aria-hidden="true" size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="block truncate font-semibold text-slate-900">
                    {t('dashboard.todayName')}
                  </span>
                  <span
                    className={`size-2 rounded-full ${session.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    title={
                      session.status === 'completed'
                        ? t('history.completed')
                        : t('history.stopped')
                    }
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {formatDate(
                    session.started_at,
                    i18n.resolvedLanguage ?? 'th'
                  )}
                </span>
              </span>
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {formatDuration(session.metrics.duration_seconds)}
              </span>
              <ChevronRight
                aria-hidden="true"
                className="text-slate-400"
                size={18}
              />
            </Link>
          ))}
          {visibleSessions.length === 0 && (
            <p className="p-8 text-center text-slate-500">
              {t('history.empty')}
            </p>
          )}
        </div>
        {visibleSessions.length > HISTORY_PAGE_SIZE && (
          <nav
            aria-label={t('history.pagination')}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:px-6"
          >
            <button
              className="kg-button-secondary"
              disabled={currentHistoryPage === 1}
              onClick={() => setHistoryPage(currentHistoryPage - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={18} />
              {t('history.previousPage')}
            </button>
            <p aria-live="polite" className="text-sm text-slate-600">
              {t('history.pageStatus', {
                page: currentHistoryPage,
                total: historyPageCount
              })}
            </p>
            <button
              className="kg-button-secondary"
              disabled={currentHistoryPage === historyPageCount}
              onClick={() => setHistoryPage(currentHistoryPage + 1)}
              type="button"
            >
              {t('history.nextPage')}
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}
