import { onlineManager, useQuery } from '@tanstack/react-query'
import {
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  Timer
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSyncExternalStore } from 'react'
import { Link, useSearchParams } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { StatCard } from '@/components/StatCard'
import { AnalyticsChart } from '@/features/analytics/AnalyticsChart'
import {
  selectAnalyticsSessions,
  summarizeAnalytics
} from '@/features/analytics/sessionAnalytics'
import { formatDate } from '@/lib/format'
import { getSessions } from '@/services/product'

const PAGE_SIZE = 10
const RANGES = ['7', '30', '90', 'all'] as const
const STATUSES = ['all', 'completed', 'stopped'] as const
const subscribeOnline = (onChange: () => void) =>
  onlineManager.subscribe(onChange)
const isOnline = () => onlineManager.isOnline()

export function ProgressPage() {
  const { t, i18n } = useTranslation()
  const online = useSyncExternalStore(subscribeOnline, isOnline)
  const [params, setParams] = useSearchParams()
  const range = RANGES.find((value) => value === params.get('range')) ?? '7'
  const status =
    STATUSES.find((value) => value === params.get('status')) ?? 'all'
  const search = params.get('q') ?? ''
  const language = i18n.resolvedLanguage ?? 'th'
  const requestedPage = Number(params.get('page') ?? 1)
  const query = useQuery({
    queryKey: ['sessions'],
    queryFn: ({ signal }) => getSessions(signal)
  })
  const selection = selectAnalyticsSessions(
    query.data ?? [],
    range === 'all' ? 0 : Number(range),
    Date.now()
  )
  const term = search.trim().toLocaleLowerCase(language)
  const sessions = selection.sessions.filter((session) => {
    if (status !== 'all' && session.status !== status) return false
    return [
      session.id,
      session.started_at,
      formatDate(session.started_at, language),
      t('history.sessionName'),
      t(`history.${session.status}`)
    ]
      .join(' ')
      .toLocaleLowerCase(language)
      .includes(term)
  })
  const summary = summarizeAnalytics(sessions)
  const pages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE))
  const page = Math.min(
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1,
    pages
  )
  const visible = sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const numbers = new Intl.NumberFormat(language)
  const duration = (seconds: number) =>
    t('analytics.duration', {
      hours: Math.floor(seconds / 3600),
      minutes: Math.floor(seconds / 60) % 60,
      seconds: seconds % 60
    })

  function setFilter(key: string, value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('page')
        if (value && value !== 'all') next.set(key, value)
        else if (key === 'range' && value === 'all') next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: key === 'q' }
    )
  }

  function setPage(nextPage: number) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.set('page', String(nextPage))
      return next
    })
  }

  return (
    <div className="min-w-0 [overflow-wrap:anywhere]">
      <PageHeader
        eyebrow={t('nav.historyAnalytics')}
        title={t('progress.title')}
        subtitle={t('analytics.subtitle')}
        actions={
          <button
            className="kg-button-secondary"
            disabled={
              !online || query.isFetching || query.fetchStatus === 'paused'
            }
            onClick={() => void query.refetch()}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={18} />
            {t(query.isFetching ? 'history.refreshing' : 'history.refresh')}
          </button>
        }
      />
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {t('analytics.scope')}
      </p>
      {(!online || query.fetchStatus === 'paused') && (
        <p
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
          role="status"
        >
          {t('analytics.offline')}
        </p>
      )}
      {query.isPending ? (
        query.fetchStatus !== 'paused' && <QueryLoading />
      ) : query.isError && !query.data ? (
        <QueryError retry={() => void query.refetch()} />
      ) : (
        <>
          {query.isError && (
            <p className="mt-4 text-sm text-amber-900" role="status">
              {t('history.refreshFailed')}
            </p>
          )}
          {selection.invalidCount > 0 && (
            <p className="mt-4 text-sm text-amber-900" role="status">
              {t('analytics.invalid', { count: selection.invalidCount })}
            </p>
          )}
          <section
            className="kg-card mt-6 space-y-4 p-4 sm:p-6"
            aria-label={t('analytics.filters')}
          >
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={t('history.range')}
            >
              {RANGES.map((value) => (
                <button
                  className={range === value ? 'kg-filter-active' : 'kg-filter'}
                  aria-pressed={range === value}
                  key={value}
                  onClick={() => setFilter('range', value)}
                  type="button"
                >
                  {value === 'all'
                    ? t('analytics.all')
                    : t('analytics.days', { count: Number(value) })}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <label className="block min-w-0 text-sm font-medium text-slate-700">
                {t('history.search')}
                <input
                  className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3"
                  aria-describedby="analytics-search-help"
                  value={search}
                  onChange={(event) => setFilter('q', event.target.value)}
                />
              </label>
              <label className="block min-w-0 text-sm font-medium text-slate-700">
                {t('history.status')}
                <select
                  className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                  value={status}
                  onChange={(event) => setFilter('status', event.target.value)}
                >
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {t(
                        value === 'all'
                          ? 'history.allStatuses'
                          : `history.${value}`
                      )}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-sm text-slate-600" id="analytics-search-help">
              {t('analytics.searchHelp')}
            </p>
            <button
              className="kg-button-secondary"
              onClick={() => setParams({})}
              type="button"
            >
              {t('history.clearFilters')}
            </button>
            <p
              className="text-sm text-slate-600"
              role="status"
              aria-live="polite"
            >
              {t('analytics.resultCount', { count: summary.count })}
            </p>
          </section>
          <section
            className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-4"
            aria-label={t('analytics.summary')}
          >
            <StatCard
              icon={CalendarCheck2}
              label={t('progress.sessions')}
              value={numbers.format(summary.count)}
            />
            <StatCard
              icon={Clock3}
              label={t('progress.time')}
              value={duration(summary.totalSeconds)}
            />
            <StatCard
              icon={Timer}
              label={t('analytics.average')}
              value={
                summary.averageSeconds === null
                  ? t('analytics.unavailable')
                  : duration(summary.averageSeconds)
              }
            />
          </section>
          <section
            className="kg-card mt-6 min-w-0 p-4 sm:p-6"
            aria-labelledby="analytics-chart-title"
          >
            <h2 className="text-xl font-bold" id="analytics-chart-title">
              {t('analytics.chart')}
            </h2>
            {summary.count ? (
              <AnalyticsChart days={summary.days} />
            ) : (
              <p className="py-8 text-slate-600">{t('analytics.empty')}</p>
            )}
          </section>
          <section
            className="kg-card mt-6 overflow-hidden"
            aria-labelledby="analytics-sessions-title"
          >
            <h2
              className="border-b border-slate-200 p-4 text-xl font-bold sm:px-6"
              id="analytics-sessions-title"
            >
              {t('history.title')}
            </h2>
            <ul className="divide-y divide-slate-100">
              {visible.map((session) => (
                <li key={session.id}>
                  <Link
                    className="flex min-h-20 items-center gap-3 p-4 no-underline hover:bg-emerald-50/40 sm:px-6"
                    to={`/app/monitor/summary/${session.id}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">
                        {t('history.sessionName')}
                      </span>
                      <span className="block text-sm text-slate-600">
                        {formatDate(session.started_at, language)}
                      </span>
                      <span className="block break-all text-xs text-slate-600">
                        {t('analytics.sessionId', { id: session.id })}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                        <span>
                          {t(`history.${session.status}`)} ·{' '}
                          {duration(session.metrics.duration_seconds)}
                        </span>
                        {session.posture_summary && (
                          <>
                            <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
                              {t('history.alertBadge', {
                                count: session.posture_summary.alert_count
                              })}
                            </span>
                            <span className="rounded-lg bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-900">
                              {t('history.breakBadge', {
                                count: session.posture_summary.break_count
                              })}
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="shrink-0 text-slate-500"
                      size={18}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            {summary.count === 0 && (
              <p className="p-6 text-slate-600">{t('analytics.empty')}</p>
            )}
            {pages > 1 && (
              <nav
                className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4"
                aria-label={t('history.pagination')}
              >
                <button
                  className="kg-button-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={18} />
                  {t('history.previousPage')}
                </button>
                <span className="text-sm text-slate-600">
                  {t('history.pageStatus', { page, total: pages })}
                </span>
                <button
                  className="kg-button-secondary"
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  type="button"
                >
                  {t('history.nextPage')}
                  <ChevronRight aria-hidden="true" size={18} />
                </button>
              </nav>
            )}
          </section>
          <section
            className="kg-card mt-6 p-4 sm:p-6"
            aria-labelledby="analytics-method-title"
          >
            <h2 className="text-xl font-bold" id="analytics-method-title">
              {t('analytics.method')}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {t('analytics.formula')}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {t('analytics.missing')}
            </p>
            <h3 className="mt-5 font-semibold">{t('analytics.references')}</h3>
            <ul className="mt-3 space-y-3 text-sm text-teal-800">
              <li>
                <a
                  className="underline"
                  href="https://www.w3.org/WAI/tutorials/images/complex/"
                  rel="noreferrer"
                  target="_blank"
                >
                  {t('analytics.referenceText')}
                </a>
              </li>
              <li>
                <a
                  className="underline"
                  href="https://service-manual.ons.gov.uk/data-visualisation/chart-types/bar-charts"
                  rel="noreferrer"
                  target="_blank"
                >
                  {t('analytics.referenceScale')}
                </a>
              </li>
              <li>
                <a
                  className="underline"
                  href="https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html"
                  rel="noreferrer"
                  target="_blank"
                >
                  {t('analytics.referenceContrast')}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {t('analytics.standardLimit')}
            </p>
          </section>
        </>
      )}
    </div>
  )
}
