import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  MessageCircle,
  Monitor
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { SafetyNotice } from '@/components/SafetyNotice'
import { useAuth } from '@/features/auth/AuthContext'
import { formatDate, formatDuration } from '@/lib/format'
import {
  getDashboard,
  type PostureSession
} from '@/services/product'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const [today] = useState(() => new Date())
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => getDashboard(signal)
  })
  const language = i18n.resolvedLanguage === 'th' ? 'th' : 'en'
  const date = new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'long'
  }).format(today)

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow={t('dashboard.updated', { date })}
        subtitle={t('dashboard.ready')}
        title={t('dashboard.hello', { name: auth.user?.display_name })}
      />

      {query.isLoading && <QueryLoading />}
      {query.isError && (
        <div className="mt-6">
          <QueryError retry={() => void query.refetch()} />
        </div>
      )}

      {query.data && (
        <>
          <section className="mt-7 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.8fr)]">
            <ActivityStartCard />
            <div className="flex flex-col gap-4">
              <AIChatCard />
              <div
                aria-label={t('dashboard.activitySummary')}
                className="kg-card grid min-h-24 grid-cols-3 divide-x divide-slate-200 overflow-hidden"
                role="group"
              >
                <DashboardStat
                  icon={CheckCircle2}
                  label={t('dashboard.completed')}
                  value={String(query.data.completed_sessions)}
                />
                <DashboardStat
                  icon={Flame}
                  label={t('dashboard.streak')}
                  value={String(query.data.current_streak)}
                />
                <DashboardStat
                  icon={Clock3}
                  label={t('dashboard.time')}
                  value={formatDuration(query.data.total_seconds)}
                />
              </div>
            </div>
          </section>

          <section className="mt-4">
            <RecentActivity sessions={query.data.recent_sessions} />
          </section>

          <SafetyNotice>{t('common.noDiagnosis')}</SafetyNotice>
        </>
      )}
    </div>
  )
}

function ActivityStartCard() {
  const { t } = useTranslation()

  return (
    <article className="kg-card flex flex-col gap-6 overflow-hidden p-6 sm:p-8 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <span className="grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100">
          <Monitor aria-hidden="true" size={24} />
        </span>
        <h2 className="mt-5 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
          {t('dashboard.exploreTitle')}
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          {t('dashboard.exploreBody')}
        </p>
        <Link className="kg-button-primary mt-6 min-h-12 w-full sm:w-auto" to="/app/monitor">
          <Activity aria-hidden="true" size={20} />
          {t('dashboard.start')}
        </Link>
      </div>
    </article>
  )
}

function DashboardStat({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="grid min-w-0 place-items-center px-2 py-6 text-center sm:px-4">
      <p className="text-[0.7rem] font-medium leading-5 text-slate-500 sm:text-xs">
        {label}
      </p>
      <div className="mt-1 flex min-w-0 items-center justify-center gap-1.5">
        <Icon aria-hidden="true" className="shrink-0 text-teal-700" size={19} />
        <p className="whitespace-nowrap text-lg font-bold tabular-nums text-slate-950 sm:text-2xl">
          {value}
        </p>
      </div>
    </div>
  )
}

function RecentActivity({ sessions }: { sessions: PostureSession[] }) {
  const { t, i18n } = useTranslation()

  return (
    <article className="kg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
          {t('dashboard.recent')}
        </h2>
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-teal-800 no-underline hover:bg-teal-50"
          to="/app/history"
        >
          {t('dashboard.viewAll')}
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <div className="mt-2 divide-y divide-slate-100">
        {sessions.slice(0, 4).map((session) => (
          <Link
            className="flex min-h-[4.75rem] items-center gap-3 rounded-xl px-1 py-3 no-underline hover:bg-slate-50 sm:px-2"
            key={session.id}
            to={`/app/monitor/summary/${session.id}`}
          >
            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
              <Monitor aria-hidden="true" size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-slate-900">
                {t('dashboard.todayName')}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {formatDate(session.started_at, i18n.resolvedLanguage ?? 'th')}
              </span>
            </span>
            <span className="text-xs tabular-nums text-slate-500 sm:text-sm">
              {formatDuration(session.metrics.duration_seconds)}
            </span>
            <ArrowRight
              aria-hidden="true"
              className="shrink-0 text-slate-400"
              size={16}
            />
          </Link>
        ))}
        {sessions.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">
            {t('dashboard.noRecent')}
          </p>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {t('dashboard.manual')}
      </p>
    </article>
  )
}

function AIChatCard() {
  const { t } = useTranslation()

  return (
    <article className="kg-card flex flex-1 flex-col justify-center border-teal-200 bg-teal-50/60 p-5 sm:p-6">
      <div className="flex gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white shadow-sm">
          <MessageCircle aria-hidden="true" size={23} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-950">
            {t('dashboard.aiTitle')}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {t('dashboard.aiBody')}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {t('dashboard.aiBoundary')}
          </p>
          <Link
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl font-bold text-teal-800 no-underline hover:text-teal-950"
            to="/app/chat"
          >
            {t('dashboard.aiStart')}
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </div>
    </article>
  )
}
