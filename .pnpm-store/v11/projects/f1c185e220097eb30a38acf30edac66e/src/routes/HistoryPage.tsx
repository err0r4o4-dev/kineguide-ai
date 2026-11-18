import { useQuery } from '@tanstack/react-query'
import {
  BarChart2,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  FileText,
  Layers,
  ListFilter,
  Monitor,
  RefreshCw,
  Search,
  ShieldCheck,
  Timer,
  TrendingUp,
  TriangleAlert,
  type LucideIcon
} from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import {
  type AnalyticsDay,
  selectAnalyticsSessions,
  summarizeAnalytics
} from '@/features/analytics/sessionAnalytics'
import { formatDate, formatDuration } from '@/lib/format'
import { getSessions } from '@/services/product'

const PAGE_SIZE = 10
const RANGES = ['all', '7', '30', '90'] as const
const CHART_RANGES = ['3', '7', '30', 'all'] as const
const STATUSES = ['all', 'active', 'completed', 'stopped'] as const
type ViewMode = 'all' | 'analytics' | 'records'
type ChartRange = (typeof CHART_RANGES)[number]
type ChartMode = 'combo' | 'bar' | 'line'

export function HistoryPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [chartDays, setChartDays] = useState<ChartRange>('3')
  const [chartMode, setChartMode] = useState<ChartMode>('combo')
  const range = RANGES.find((value) => value === params.get('range')) ?? 'all'
  const status =
    STATUSES.find((value) => value === params.get('status')) ?? 'all'
  const requestedPage = Number(params.get('page') ?? 1)
  const language = i18n.resolvedLanguage ?? 'th'
  const query = useQuery({
    queryKey: ['sessions'],
    queryFn: ({ signal }) => getSessions(signal)
  })

  function setFilter(key: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('page')
      if (value === 'all') next.delete(key)
      else next.set(key, value)
      return next
    })
  }

  function setPage(page: number) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (page === 1) next.delete('page')
      else next.set('page', String(page))
      return next
    })
  }

  const now = Date.now()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  if (range !== 'all') start.setDate(start.getDate() - Number(range) + 1)
  const term = search.trim().toLocaleLowerCase(language)
  const filtered = (query.data ?? [])
    .filter((session) => {
      if (status !== 'all' && session.status !== status) return false
      if (range !== 'all' && new Date(session.started_at) < start) return false
      const searchable = [
        session.id,
        session.started_at,
        formatDate(session.started_at, language),
        t('history.sessionName'),
        t(`history.${session.status}`)
      ]
        .join(' ')
        .toLocaleLowerCase(language)
      return searchable.includes(term)
    })
    .sort(
      (left, right) =>
        new Date(right.started_at).getTime() -
        new Date(left.started_at).getTime()
    )
  const analyticsSelection = selectAnalyticsSessions(filtered, 0, now)
  const analyticsSummary = summarizeAnalytics(analyticsSelection.sessions)
  const displayedChartDays =
    chartDays === 'all'
      ? analyticsSummary.days
      : analyticsSummary.days.slice(-Number(chartDays))
  const recentDayCount =
    analyticsSummary.days.length > 0
      ? analyticsSummary.days[analyticsSummary.days.length - 1].count
      : 0
  const numbers = new Intl.NumberFormat(language)
  const formatAnalyticsDuration = (seconds: number) =>
    t('analytics.duration', {
      hours: Math.floor(seconds / 3600),
      minutes: Math.floor(seconds / 60) % 60,
      seconds: seconds % 60
    })

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1,
    pages
  )
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-w-0 [overflow-wrap:anywhere]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex min-h-7 items-center rounded-full border border-teal-200/80 bg-white/90 px-3 text-xs font-bold uppercase tracking-[0.12em] text-teal-800 shadow-2xs">
            {t('nav.historyAnalytics')}
          </p>
          <h1 className="mt-2.5 max-w-4xl text-[2rem] font-bold leading-[1.18] tracking-[-0.04em] text-[var(--color-kg-ink)] sm:text-[2.5rem]">
            {t('history.title')}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-kg-muted)] sm:text-base">
            {t('history.subtitle')}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:pt-2">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-kg-border)] bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-xs transition hover:bg-[var(--color-kg-soft)] disabled:cursor-not-allowed disabled:opacity-55"
            disabled={query.isFetching || query.fetchStatus === 'paused'}
            onClick={() => void query.refetch()}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="text-teal-700" size={17} />
            {t(query.isFetching ? 'history.refreshing' : 'history.refresh')}
          </button>
        </div>
      </header>

      <p className="sr-only">{t('history.scope')}</p>

      {query.fetchStatus === 'paused' && (
        <p
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
          role="status"
        >
          {t('history.offline')}
        </p>
      )}
      {query.isPending ? (
        query.fetchStatus !== 'paused' && <QueryLoading />
      ) : query.isError && !query.data ? (
        <QueryError retry={() => query.refetch()} />
      ) : (
        <>
          {query.isError && (
            <p className="mt-4 text-sm text-amber-900" role="status">
              {t('history.refreshFailed')}
            </p>
          )}
          <div
            aria-label={t('history.viewModeLabel')}
            className="mt-5 flex flex-wrap gap-2.5"
            role="group"
          >
            {(
              [
                ['all', 'history.viewAll'],
                ['analytics', 'history.viewAnalytics'],
                ['records', 'history.viewRecords']
              ] as const
            ).map(([mode, labelKey]) => {
              const active = viewMode === mode
              return (
                <button
                  aria-pressed={active}
                  className={
                    active
                      ? 'min-h-11 rounded-full border border-[#38b2a3] bg-[linear-gradient(135deg,#5ad4c0,#3cb5a5)] px-5 py-2 text-sm font-bold text-slate-950 shadow-xs transition'
                      : 'min-h-11 rounded-full border border-[var(--color-kg-border)] bg-white/90 px-5 py-2 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-[var(--color-kg-soft)]'
                  }
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  type="button"
                >
                  {t(labelKey)}
                </button>
              )
            })}
          </div>

          {viewMode !== 'records' && (
            <>
              <section
                aria-label={t('analytics.summary')}
                className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-4"
              >
                <HistoryKpiCard
                  badge={
                    recentDayCount > 0
                      ? t('history.recentSessionsBadge', {
                          count: recentDayCount
                        })
                      : undefined
                  }
                  icon={Layers}
                  label={t('progress.sessions')}
                  value={numbers.format(analyticsSummary.count)}
                />
                <HistoryKpiCard
                  icon={Clock3}
                  label={t('progress.time')}
                  value={formatAnalyticsDuration(analyticsSummary.totalSeconds)}
                />
                <HistoryKpiCard
                  icon={Timer}
                  label={t('analytics.average')}
                  value={
                    analyticsSummary.averageSeconds === null
                      ? t('analytics.unavailable')
                      : formatAnalyticsDuration(analyticsSummary.averageSeconds)
                  }
                />
              </section>

              <section
                aria-labelledby="history-analytics-chart-title"
                className="kg-card mt-5 min-w-0 p-4 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <BarChart3
                      aria-hidden="true"
                      className="shrink-0 text-teal-700"
                      size={22}
                    />
                    <h2
                      className="text-lg font-bold text-slate-950 sm:text-xl"
                      id="history-analytics-chart-title"
                    >
                      {t('history.chartTitle')}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative inline-flex min-w-0 items-center">
                      <Calendar
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 text-slate-500"
                        size={15}
                      />
                      <select
                        aria-label={t('history.chartDayFilter')}
                        className="min-h-10 rounded-full border border-slate-200 bg-white pl-9 pr-8 text-xs font-semibold text-slate-800 shadow-2xs sm:text-sm"
                        onChange={(event) =>
                          setChartDays(event.target.value as ChartRange)
                        }
                        value={chartDays}
                      >
                        {CHART_RANGES.map((value) => (
                          <option key={value} value={value}>
                            {value === 'all'
                              ? t('history.allDates')
                              : t('history.chartLastDays', {
                                  count: Number(value)
                                })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      aria-label={t('history.chartModeLabel')}
                      className="inline-flex flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-slate-50/90 p-1"
                      role="group"
                    >
                      {(
                        [
                          ['combo', BarChart2, 'history.chartModeCombo'],
                          ['bar', BarChart3, 'history.chartModeBar'],
                          ['line', TrendingUp, 'history.chartModeLine']
                        ] as const
                      ).map(([mode, ModeIcon, labelKey]) => {
                        const active = chartMode === mode
                        return (
                          <button
                            aria-pressed={active}
                            className={
                              active
                                ? 'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-teal-300/80 bg-[#d5f5ec] px-3 py-1 text-xs font-bold text-teal-950 shadow-2xs'
                                : 'inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900'
                            }
                            key={mode}
                            onClick={() => setChartMode(mode)}
                            type="button"
                          >
                            <ModeIcon aria-hidden="true" size={14} />
                            {t(labelKey)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {analyticsSummary.count > 0 ? (
                  <div className="mt-5 grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,0.95fr)]">
                    <HistoryActivityChart
                      days={displayedChartDays}
                      mode={chartMode}
                    />
                    <aside
                      aria-label={t('history.periodSummaryTitle')}
                      className="min-w-0 rounded-2xl border border-[#cdeee7] bg-[#f1fbf8] p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d8f0ea] pb-3.5">
                        <div className="flex items-center gap-2">
                          <BarChart3
                            aria-hidden="true"
                            className="shrink-0 text-teal-700"
                            size={18}
                          />
                          <h3 className="text-base font-bold text-slate-950">
                            {t('history.periodSummaryTitle')}
                          </h3>
                        </div>
                        <span className="rounded-full bg-[#bceee0] px-3 py-1 text-xs font-semibold text-teal-950">
                          {chartDays === 'all'
                            ? t('history.allDates')
                            : t('history.periodBadgeDays', {
                                count: Number(chartDays)
                              })}
                        </span>
                      </div>

                      <dl className="divide-y divide-[#d8f0ea] text-sm">
                        <div className="flex items-center justify-between gap-3 py-3.5">
                          <dt className="flex items-center gap-2.5 text-slate-700">
                            <Layers
                              aria-hidden="true"
                              className="shrink-0 text-slate-500"
                              size={16}
                            />
                            <span>{t('progress.sessions')}</span>
                          </dt>
                          <dd className="font-bold tabular-nums text-slate-950">
                            {numbers.format(analyticsSummary.count)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 py-3.5">
                          <dt className="flex items-center gap-2.5 text-slate-700">
                            <Clock3
                              aria-hidden="true"
                              className="shrink-0 text-slate-500"
                              size={16}
                            />
                            <span>{t('progress.time')}</span>
                          </dt>
                          <dd className="font-bold tabular-nums text-slate-950">
                            {formatAnalyticsDuration(
                              analyticsSummary.totalSeconds
                            )}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 pt-3.5">
                          <dt className="flex items-center gap-2.5 text-slate-700">
                            <Timer
                              aria-hidden="true"
                              className="shrink-0 text-slate-500"
                              size={16}
                            />
                            <span>{t('history.periodAverage')}</span>
                          </dt>
                          <dd className="font-bold tabular-nums text-slate-950">
                            {analyticsSummary.averageSeconds === null
                              ? t('analytics.unavailable')
                              : formatAnalyticsDuration(
                                  analyticsSummary.averageSeconds
                                )}
                          </dd>
                        </div>
                      </dl>
                    </aside>
                  </div>
                ) : (
                  <p className="py-6 text-slate-600">{t('analytics.empty')}</p>
                )}
              </section>
            </>
          )}

          {viewMode !== 'analytics' && (
            <section
              className="kg-card mt-5 overflow-hidden"
              aria-labelledby="history-results-title"
            >
              <div className="flex flex-col gap-3.5 border-b border-slate-200/80 p-4 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#dff8f1] text-teal-700">
                    <FileText aria-hidden="true" size={18} />
                  </span>
                  <h2
                    className="text-xl font-bold text-slate-950"
                    id="history-results-title"
                  >
                    {t('history.records')}
                  </h2>
                  <p
                    className="text-xs font-medium text-slate-500"
                    role="status"
                  >
                    {t('history.results', { count: filtered.length })}
                  </p>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                  <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-initial">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      aria-describedby="history-search-help"
                      aria-label={t('history.search')}
                      className="min-h-10 w-full min-w-0 rounded-full border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white"
                      onChange={(event) => {
                        setSearch(event.target.value)
                        setPage(1)
                      }}
                      placeholder={t('history.searchPlaceholder')}
                      value={search}
                    />
                  </div>

                  <div className="relative inline-flex min-w-0 items-center">
                    <Calendar
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 text-slate-500"
                      size={15}
                    />
                    <select
                      aria-label={t('history.range')}
                      className="min-h-10 max-w-full rounded-full border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700"
                      onChange={(event) =>
                        setFilter('range', event.target.value)
                      }
                      value={range}
                    >
                      {RANGES.map((value) => (
                        <option key={value} value={value}>
                          {value === 'all'
                            ? t('history.allDates')
                            : t('history.lastDays', { count: Number(value) })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span
                    aria-hidden="true"
                    className="hidden h-6 w-px bg-slate-200 sm:block"
                  />

                  <div className="relative inline-flex min-w-0 items-center">
                    <ListFilter
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 text-slate-500"
                      size={15}
                    />
                    <select
                      aria-label={t('history.status')}
                      className="min-h-10 max-w-full rounded-full border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700"
                      onChange={(event) =>
                        setFilter('status', event.target.value)
                      }
                      value={status}
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
                  </div>

                  {(search || range !== 'all' || status !== 'all') && (
                    <button
                      className="kg-button-secondary min-h-10 rounded-full px-4 py-1.5 text-xs"
                      onClick={() => {
                        setSearch('')
                        setParams((current) => {
                          const next = new URLSearchParams(current)
                          for (const key of ['range', 'status', 'page'])
                            next.delete(key)
                          return next
                        })
                      }}
                      type="button"
                    >
                      {t('history.clearFilters')}
                    </button>
                  )}
                </div>

                <p className="sr-only" id="history-search-help">
                  {t('history.searchHelp')}
                </p>
              </div>

              {filtered.length > 0 ? (
                <ol className="divide-y divide-slate-200/80">
                  {visible.map((session) => {
                    const alertCount = session.posture_summary?.alert_count ?? 0
                    const breakCount = session.posture_summary?.break_count ?? 0
                    return (
                      <li key={session.id}>
                        <Link
                          className="group flex min-w-0 flex-wrap items-center justify-between gap-3 px-4 py-3.5 no-underline transition hover:bg-[var(--color-kg-soft)] sm:px-6"
                          to={`/app/monitor/summary/${session.id}`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#dff8f1] text-teal-700">
                              <Monitor aria-hidden="true" size={18} />
                            </span>
                            <span className="sr-only">
                              {t('history.sessionName')}{' '}
                              {t('history.identifier', { id: session.id })}
                            </span>
                            <time
                              className="text-sm font-bold tabular-nums text-slate-900 sm:text-[0.95rem]"
                              dateTime={session.started_at}
                            >
                              {formatDate(session.started_at, language)}
                            </time>
                          </div>

                          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2 sm:justify-around sm:gap-3">
                            <span
                              className={
                                session.status === 'completed'
                                  ? 'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-700'
                                  : session.status === 'active'
                                    ? 'inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900'
                                    : 'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900'
                              }
                            >
                              <CheckCircle2
                                aria-hidden="true"
                                className="shrink-0 text-slate-600"
                                size={14}
                              />
                              <span>{t(`history.${session.status}`)}</span>
                            </span>

                            <span
                              aria-hidden="true"
                              className="hidden h-5 w-px bg-slate-200 md:block"
                            />

                            <span className="inline-flex items-center gap-1.5 text-xs font-medium tabular-nums text-slate-700 sm:text-sm">
                              <Clock3
                                aria-hidden="true"
                                className="shrink-0 text-slate-500"
                                size={15}
                              />
                              {t('history.savedTime', {
                                duration: formatDuration(
                                  session.metrics.duration_seconds
                                )
                              })}
                            </span>

                            <span
                              aria-hidden="true"
                              className="hidden h-5 w-px bg-slate-200 md:block"
                            />

                            <span
                              className={
                                alertCount > 0
                                  ? 'inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900'
                                  : 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-900'
                              }
                            >
                              {alertCount > 0 ? (
                                <TriangleAlert
                                  aria-hidden="true"
                                  className="shrink-0 text-amber-600"
                                  size={14}
                                />
                              ) : (
                                <ShieldCheck
                                  aria-hidden="true"
                                  className="shrink-0 text-emerald-600"
                                  size={14}
                                />
                              )}
                              {t('history.alertBadge', { count: alertCount })}
                            </span>

                            <span
                              aria-hidden="true"
                              className="hidden h-5 w-px bg-slate-200 md:block"
                            />

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-900">
                              <ShieldCheck
                                aria-hidden="true"
                                className="shrink-0 text-emerald-600"
                                size={14}
                              />
                              {t('history.breakBadge', { count: breakCount })}
                            </span>
                          </div>

                          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition group-hover:border-teal-300 group-hover:text-teal-700">
                            <ChevronRight aria-hidden="true" size={16} />
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <div className="p-6 text-center sm:p-8">
                  <p className="text-slate-600">
                    {t(
                      query.data?.length ? 'history.noResults' : 'history.empty'
                    )}
                  </p>
                  {!query.data?.length && (
                    <Link className="kg-button-primary mt-4" to="/app/monitor">
                      {t('dashboard.start')}
                    </Link>
                  )}
                </div>
              )}

              {pages > 1 && (
                <nav
                  aria-label={t('history.pagination')}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 sm:px-6"
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
                  <p className="text-sm text-slate-600" role="status">
                    {t('history.pageStatus', { page, total: pages })}
                  </p>
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
          )}
        </>
      )}

      <details className="mt-5 rounded-xl border border-[var(--color-kg-border)] bg-white p-4 text-sm text-slate-600">
        <summary className="min-h-11 cursor-pointer content-center font-semibold text-slate-900">
          {t('history.references')}
        </summary>
        <p className="mt-2 leading-6">{t('history.scope')}</p>
        <p className="mt-2 leading-6">{t('history.referencesNote')}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <a
              className="text-teal-800 underline"
              href="https://www.w3.org/TR/WCAG22/"
              rel="noreferrer"
              referrerPolicy="no-referrer"
            >
              {t('history.wcagReference')}
            </a>
          </li>
          <li>
            <a
              className="text-teal-800 underline"
              href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat"
              rel="noreferrer"
              referrerPolicy="no-referrer"
            >
              {t('history.dateReference')}
            </a>
          </li>
        </ul>
      </details>
    </div>
  )
}

function HistoryKpiCard({
  icon: Icon,
  label,
  value,
  badge
}: {
  icon: LucideIcon
  label: string
  value: string
  badge?: string
}) {
  return (
    <article className="kg-card relative overflow-hidden p-4 sm:p-5">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full"
        preserveAspectRatio="none"
        viewBox="0 0 320 64"
      >
        <path
          d="M140 64C178 36 218 22 262 34C286 40 304 34 320 18V64H140Z"
          fill="#dff8f1"
          fillOpacity="0.65"
        />
        <path
          d="M180 64C215 44 252 32 292 42C304 45 314 40 320 32V64H180Z"
          fill="#c9eeea"
          fillOpacity="0.55"
        />
      </svg>
      <div className="relative flex items-center gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#259c91,#64dec0)] text-white shadow-sm">
          <Icon aria-hidden="true" size={22} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--color-kg-muted)] sm:text-sm">
            {label}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-2xl font-extrabold leading-none tracking-[-0.03em] tabular-nums text-[var(--color-kg-ink)] sm:text-[1.7rem]">
              {value}
            </p>
            {badge && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <ChevronUp aria-hidden="true" size={13} />
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function HistoryActivityChart({
  days,
  mode
}: {
  days: AnalyticsDay[]
  mode: ChartMode
}) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()
  const gradientId = useId()
  const locale = i18n.resolvedLanguage === 'th' ? 'th-TH' : 'en-GB'
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
  const shortDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short'
  })
  const numbers = new Intl.NumberFormat(locale)

  const maxRawSeconds = Math.max(...days.map((day) => day.seconds), 0)
  const maximumSeconds = Math.max(60, Math.ceil(maxRawSeconds / 60) * 60)
  const maxRawCount = Math.max(...days.map((day) => day.count), 0)
  const maximumCount = Math.max(6, Math.ceil(maxRawCount / 2) * 2)

  const chartLeft = 52
  const chartRight = 568
  const chartTop = 34
  const chartBottom = 198
  const chartWidth = chartRight - chartLeft
  const chartHeight = chartBottom - chartTop
  const slot = chartWidth / Math.max(1, days.length)

  const points = days.map((day, index) => {
    const x = chartLeft + index * slot + slot / 2
    const y = chartBottom - (day.count / maximumCount) * chartHeight
    return { x, y, day }
  })

  const linePath = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    return `${acc} L ${point.x} ${point.y}`
  }, '')

  const durationTicks = [
    0,
    Math.round(maximumSeconds * 0.25),
    Math.round(maximumSeconds * 0.5),
    Math.round(maximumSeconds * 0.75),
    maximumSeconds
  ]
  const countTicks = Array.from({ length: 7 }, (_, idx) =>
    Math.round((maximumCount / 6) * idx)
  )

  return (
    <figure className="min-w-0">
      <div
        aria-label={t('analytics.chartScroll')}
        className="max-w-full overflow-x-auto"
        role="region"
        tabIndex={0}
      >
        <svg
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          className="h-60 w-full min-w-[20rem]"
          role="img"
          viewBox="0 0 620 232"
        >
          <title id={titleId}>{t('analytics.chart')}</title>
          <desc id={descriptionId}>{t('analytics.chartDescription')}</desc>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2bb39e" />
              <stop offset="100%" stopColor="#6be2c5" />
            </linearGradient>
          </defs>

          <text className="fill-slate-500 text-[11px]" x="12" y="16">
            {t('history.chartDurationAxis')}
          </text>
          <text
            className="fill-slate-500 text-[11px]"
            textAnchor="end"
            x="608"
            y="16"
          >
            {t('history.chartSessionsAxis')}
          </text>

          {durationTicks.map((value) => {
            const y = chartBottom - (value / maximumSeconds) * chartHeight
            return (
              <g key={`dur-${value}`}>
                <line
                  stroke={value === 0 ? '#cbd5e1' : '#e2e8f0'}
                  strokeDasharray={value === 0 ? undefined : '4 4'}
                  x1={chartLeft}
                  x2={chartRight}
                  y1={y}
                  y2={y}
                />
                <text
                  className="fill-slate-600 text-[11px]"
                  textAnchor="end"
                  x={chartLeft - 8}
                  y={y + 4}
                >
                  {numbers.format(value)}
                </text>
              </g>
            )
          })}

          {countTicks.map((value, idx) => {
            const y = chartBottom - (idx / 6) * chartHeight
            return (
              <text
                className="fill-slate-600 text-[11px]"
                key={`cnt-${idx}`}
                textAnchor="start"
                x={chartRight + 8}
                y={y + 4}
              >
                {numbers.format(value)}
              </text>
            )
          })}

          {mode !== 'line' &&
            days.map((day, index) => {
              const height = (day.seconds / maximumSeconds) * chartHeight
              const barWidth = Math.min(96, slot * 0.56)
              const x = chartLeft + index * slot + (slot - barWidth) / 2
              const y = chartBottom - height
              return (
                <g key={day.date}>
                  <rect
                    fill={`url(#${gradientId})`}
                    height={height}
                    rx={8}
                    width={barWidth}
                    x={x}
                    y={y}
                  >
                    <title>
                      {dateFormat.format(day.date)}:{' '}
                      {t('analytics.secondsValue', { count: day.seconds })}
                    </title>
                  </rect>
                </g>
              )
            })}

          {mode !== 'bar' && points.length > 0 && (
            <g>
              <path
                d={linePath}
                fill="none"
                stroke="#0d7a73"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              {points.length === 1 &&
                points.map(({ x, y, day }) => (
                  <circle
                    cx={x}
                    cy={y}
                    fill="#ffffff"
                    key={`pt-${day.date}`}
                    r="5.5"
                    stroke="#0d7a73"
                    strokeWidth="2.5"
                  >
                    <title>
                      {dateFormat.format(day.date)}:{' '}
                      {t('history.recentSessionsBadge', { count: day.count })}
                    </title>
                  </circle>
                ))}
            </g>
          )}

          {days.map((day, index) => {
            const showLabel =
              index % Math.max(1, Math.ceil(days.length / 5)) === 0 ||
              index === days.length - 1
            if (!showLabel) return null
            return (
              <text
                className="fill-slate-700 text-xs font-medium"
                key={`lbl-${day.date}`}
                textAnchor="middle"
                x={chartLeft + index * slot + slot / 2}
                y="220"
              >
                {shortDate.format(day.date)}
              </text>
            )
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600">
        {mode !== 'line' && (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3 w-5 rounded-xs bg-[linear-gradient(135deg,#2bb39e,#6be2c5)]"
            />
            {t('history.legendDuration')}
          </span>
        )}
        {mode !== 'bar' && (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="relative inline-flex h-3 w-6 items-center justify-center"
            >
              <span className="h-0.5 w-full bg-[#0d7a73]" />
            </span>
            {t('history.legendSessions')}
          </span>
        )}
      </div>

      <figcaption className="sr-only">
        {t('analytics.chartDescription')}
      </figcaption>

      <details className="mt-3">
        <summary className="min-h-10 cursor-pointer py-2 text-xs font-semibold text-teal-800">
          {t('analytics.table')}
        </summary>
        <div
          aria-label={t('analytics.table')}
          className="overflow-x-auto"
          role="region"
          tabIndex={0}
        >
          <table className="w-full min-w-[20rem] table-fixed text-left text-sm">
            <caption className="pb-2 text-left text-xs text-slate-600">
              {t('analytics.chart')}
            </caption>
            <thead>
              <tr className="border-b border-slate-300">
                <th className="w-1/2 py-2.5 pr-2" scope="col">
                  {t('analytics.date')}
                </th>
                <th className="py-2.5 pr-2" scope="col">
                  {t('progress.sessions')}
                </th>
                <th className="py-2.5" scope="col">
                  {t('analytics.seconds')}
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr className="border-b border-slate-100" key={day.date}>
                  <th className="py-2.5 pr-2 font-normal" scope="row">
                    {dateFormat.format(day.date)}
                  </th>
                  <td className="py-2.5 pr-2 tabular-nums">
                    {numbers.format(day.count)}
                  </td>
                  <td className="py-2.5 tabular-nums">
                    {numbers.format(day.seconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
