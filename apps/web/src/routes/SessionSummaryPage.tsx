import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Activity,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { formatDuration } from '@/lib/format'
import { getSession } from '@/services/product'

export function SessionSummaryPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const query = useQuery({
    queryKey: ['session', id],
    queryFn: ({ signal }) => getSession(id, signal)
  })

  if (query.isLoading) return <QueryLoading />
  if (query.isError) return <QueryError retry={() => void query.refetch()} />

  return (
    <div className="mx-auto max-w-4xl pb-4">
      <Link
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-800"
        to="/app/history"
      >
        <ArrowLeft aria-hidden="true" size={18} />
        {t('nav.history')}
      </Link>

      <section className="kg-card mt-5 p-6 sm:p-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-800">
              <CheckCircle2 aria-hidden="true" size={29} />
            </span>
            <div>
              <p className="text-sm font-semibold text-teal-700">
                {t('session.summary')}
              </p>
              <h1 className="mt-1 text-3xl font-bold leading-tight tracking-[-0.025em]">
                {t('dashboard.todayName')}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {t('dashboard.manual')}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
            {query.data?.status === 'completed'
              ? t('history.completed')
              : t('history.stopped')}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <Clock3 aria-hidden="true" className="text-teal-700" size={24} />
            <p className="mt-3 text-sm text-slate-500">{t('session.elapsed')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatDuration(query.data?.metrics.duration_seconds ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <Activity aria-hidden="true" className="text-teal-700" size={24} />
            <p className="mt-3 text-sm text-slate-500">{t('session.activitySitting')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatDuration(query.data?.metrics.sitting_seconds ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-emerald-50/50 p-5">
            <CheckCircle2 aria-hidden="true" className="text-emerald-700" size={24} />
            <p className="mt-3 text-sm text-slate-500">{t('session.stateGood')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">
              {formatDuration(query.data?.metrics.good_alignment_seconds ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-amber-50/50 p-5">
            <AlertCircle aria-hidden="true" className="text-amber-700" size={24} />
            <p className="mt-3 text-sm text-slate-500">{t('session.alertCount')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-900">
              {query.data?.metrics.alert_count ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">{t('session.longestSitting')}</p>
            <p className="font-bold tabular-nums">{formatDuration(query.data?.metrics.longest_sitting_seconds ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">{t('session.breakCount')}</p>
            <p className="font-bold tabular-nums">{query.data?.metrics.break_count ?? 0}</p>
          </div>
        </div>

        <p className="mt-6 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={18}
          />
          {t('dashboard.manual')}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
          <CalendarDays aria-hidden="true" className="text-slate-400" size={20} />
          <p className="text-sm font-medium text-slate-600">
            {query.data?.started_at
              ? new Intl.DateTimeFormat(
                  i18n.resolvedLanguage === 'th' ? 'th-TH' : 'en-GB',
                  { dateStyle: 'medium', timeStyle: 'short' }
                ).format(new Date(query.data.started_at))
              : '-'}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="kg-button-primary" to="/app/monitor">
            {t('dashboard.start')}
          </Link>
          <Link className="kg-button-secondary" to="/app/history">
            {t('nav.history')}
          </Link>
        </div>
      </section>
    </div>
  )
}
