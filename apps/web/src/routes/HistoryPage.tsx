import { useQuery } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Monitor,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { formatDate, formatDuration } from '@/lib/format'
import { getSessions } from '@/services/product'

const PAGE_SIZE = 10
const RANGES = ['all', '7', '30', '90'] as const
const STATUSES = ['all', 'active', 'completed', 'stopped'] as const

export function HistoryPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
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

  const start = new Date(Date.now())
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
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1,
    pages
  )
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <PageHeader
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        actions={
          <button
            className="kg-button-secondary"
            disabled={query.isFetching || query.fetchStatus === 'paused'}
            onClick={() => void query.refetch()}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={18} />
            {t(query.isFetching ? 'history.refreshing' : 'history.refresh')}
          </button>
        }
      />
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {t('history.scope')}
      </p>
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
        <QueryError retry={() => void query.refetch()} />
      ) : (
        <>
          {query.isError && (
            <p className="mt-4 text-sm text-amber-900" role="status">
              {t('history.refreshFailed')}
            </p>
          )}
          <section
            className="kg-card mt-6 overflow-hidden"
            aria-labelledby="history-results-title"
          >
            <div className="space-y-4 border-b border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-bold" id="history-results-title">
                {t('history.records')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <label className="min-w-0 text-sm font-medium text-slate-700">
                  {t('history.search')}
                  <input
                    className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3"
                    aria-describedby="history-search-help"
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(1)
                    }}
                    value={search}
                  />
                </label>
                <label className="min-w-0 text-sm font-medium text-slate-700">
                  {t('history.range')}
                  <select
                    className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                    value={range}
                    onChange={(event) => setFilter('range', event.target.value)}
                  >
                    {RANGES.map((value) => (
                      <option key={value} value={value}>
                        {value === 'all'
                          ? t('history.allDates')
                          : t('history.lastDays', { count: Number(value) })}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-0 text-sm font-medium text-slate-700">
                  {t('history.status')}
                  <select
                    className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                    value={status}
                    onChange={(event) =>
                      setFilter('status', event.target.value)
                    }
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
              <p className="text-sm text-slate-600" id="history-search-help">
                {t('history.searchHelp')}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600" role="status">
                  {t('history.results', { count: filtered.length })}
                </p>
                {(search || range !== 'all' || status !== 'all') && (
                  <button
                    className="kg-button-secondary"
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
            </div>
            {filtered.length > 0 ? (
              <ol className="divide-y divide-slate-200">
                {visible.map((session) => (
                  <li key={session.id}>
                    <Link
                      className="flex min-w-0 items-start gap-3 p-4 no-underline hover:bg-[var(--color-kg-soft)] sm:px-6"
                      to={`/app/monitor/summary/${session.id}`}
                    >
                      <Monitor
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-teal-700"
                        size={20}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-900">
                          {t('history.sessionName')}
                        </span>
                        <time
                          className="mt-1 block text-sm text-slate-600"
                          dateTime={session.started_at}
                        >
                          {formatDate(session.started_at, language)}
                        </time>
                        <span className="mt-1 block break-all text-xs text-slate-500">
                          {t('history.identifier', { id: session.id })}
                        </span>
                        <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-700">
                          <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium">
                            {t(`history.${session.status}`)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 aria-hidden="true" size={16} />
                            {t('history.savedTime', {
                              duration: formatDuration(
                                session.metrics.duration_seconds
                              )
                            })}
                          </span>
                        </span>
                      </div>
                      <ChevronRight
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-slate-500"
                        size={18}
                      />
                    </Link>
                  </li>
                ))}
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
        </>
      )}
      <details className="mt-6 rounded-xl border border-[var(--color-kg-border)] bg-white p-4 text-sm text-slate-600">
        <summary className="min-h-11 cursor-pointer content-center font-semibold text-slate-900">
          {t('history.references')}
        </summary>
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
