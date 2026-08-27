import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Flame,
  MessageCircle,
  Play,
  Video
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { SafetyNotice } from '@/components/SafetyNotice'
import { useAuth } from '@/features/auth/AuthContext'
import { formatDate, formatDuration } from '@/lib/format'
import { getDashboard, type ExerciseSession } from '@/services/product'

const ranges = [7, 30, 90] as const

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const [range, setRange] = useState<(typeof ranges)[number]>(7)
  const [today] = useState(() => new Date())
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => getDashboard(signal)
  })
  const language = i18n.resolvedLanguage === 'th' ? 'th' : 'en'
  const date = new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'long'
  }).format(today)
  const visibleSessions = useMemo(
    () =>
      (query.data?.recent_sessions ?? []).filter(
        (session) =>
          new Date(session.started_at).getTime() >=
          today.getTime() - range * 86_400_000
      ),
    [query.data?.recent_sessions, range, today]
  )

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
          <section className="mt-7 grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,1fr)]">
            <TodayActivity />

            <div className="grid gap-5">
              <article className="rounded-[1.25rem] border border-teal-200 bg-teal-50/60 p-5 sm:p-6">
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

              <div
                aria-label={t('dashboard.activitySummary')}
                className="kg-card grid grid-cols-3 divide-x divide-slate-200 overflow-hidden"
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

          <section className="mt-5 grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(22rem,1fr)]">
            <WeeklyActivity
              language={language}
              onRangeChange={setRange}
              range={range}
              sessions={visibleSessions}
            />
            <RecentActivity sessions={query.data.recent_sessions} />
          </section>

          <SafetyNotice>{t('common.noDiagnosis')}</SafetyNotice>
        </>
      )}
    </div>
  )
}

function TodayActivity() {
  const { t } = useTranslation()

  return (
    <article className="kg-card overflow-hidden p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100">
          <CalendarCheck2 aria-hidden="true" size={20} />
        </span>
        <h2 className="text-xl font-bold text-slate-950">
          {t('dashboard.today')}
        </h2>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[minmax(11rem,0.85fr)_minmax(0,1fr)] md:items-center">
        <div className="grid min-h-52 place-items-center rounded-2xl border border-teal-100 bg-teal-50/70 px-5 text-center text-teal-800">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-white shadow-sm ring-1 ring-inset ring-teal-100">
              <Video aria-hidden="true" size={31} />
            </span>
            <p className="mt-4 font-bold">{t('camera.secure')}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {t('camera.instructions')}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold leading-tight text-slate-950">
            {t('dashboard.todayName')}
          </h3>
          <p className="mt-2 font-semibold text-slate-700">
            {t('dashboard.todayProgress')}
          </p>
          <div
            aria-label={t('dashboard.todayProgress')}
            aria-valuemax={7}
            aria-valuemin={0}
            aria-valuenow={1}
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
          >
            <span className="block h-full w-[14%] rounded-full bg-teal-700" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {t('common.pendingReview')}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="kg-button-primary" to="/app/camera">
              <Play aria-hidden="true" size={18} />
              {t('plan.start')}
            </Link>
            <Link className="kg-button-secondary" to="/app/exercises">
              {t('dashboard.viewDetails')}
            </Link>
          </div>
        </div>
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
    <div className="grid min-w-0 place-items-center px-2 py-5 text-center sm:px-4">
      <Icon aria-hidden="true" className="text-teal-700" size={24} />
      <p className="mt-2 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
        {label}
      </p>
      <p className="mt-1 break-all text-xl font-bold tabular-nums text-slate-950 sm:text-2xl">
        {value}
      </p>
    </div>
  )
}

function WeeklyActivity({
  language,
  onRangeChange,
  range,
  sessions
}: {
  language: 'th' | 'en'
  onRangeChange: (range: (typeof ranges)[number]) => void
  range: (typeof ranges)[number]
  sessions: ExerciseSession[]
}) {
  const { t } = useTranslation()
  const maximum = Math.max(
    ...sessions.map(({ elapsed_seconds }) => elapsed_seconds),
    1
  )

  return (
    <article className="kg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100">
            <BarChart3 aria-hidden="true" size={20} />
          </span>
          <h2 className="text-xl font-bold text-slate-950">
            {t('dashboard.weekly')}
          </h2>
        </div>
        <div
          aria-label={t('dashboard.range')}
          className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200"
          role="group"
        >
          {ranges.map((value) => (
            <button
              aria-pressed={range === value}
              className={`min-h-10 border-r border-slate-200 px-3 text-sm font-semibold last:border-r-0 ${range === value ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              key={value}
              onClick={() => onRangeChange(value)}
              type="button"
            >
              {t('dashboard.rangeDays', { count: value })}
            </button>
          ))}
        </div>
      </div>

      {sessions.length > 0 ? (
        <div
          aria-label={t('dashboard.chartSummary', {
            count: sessions.length,
            range
          })}
          className="mt-7 flex h-52 items-end gap-3 border-b border-slate-200 px-1"
          role="img"
        >
          {sessions
            .slice(0, 7)
            .reverse()
            .map((session) => (
              <div
                className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"
                key={session.id}
              >
                <span className="text-xs font-semibold tabular-nums text-slate-700">
                  {Math.max(1, Math.round(session.elapsed_seconds / 60))}
                </span>
                <span
                  aria-hidden="true"
                  className="mx-auto mt-1 w-full max-w-8 rounded-t-md bg-teal-700"
                  style={{
                    height: `${Math.max(12, (session.elapsed_seconds / maximum) * 78)}%`
                  }}
                />
                <span className="mt-2 truncate text-xs text-slate-500">
                  {new Intl.DateTimeFormat(
                    language === 'th' ? 'th-TH' : 'en-GB',
                    { weekday: 'short', day: 'numeric' }
                  ).format(new Date(session.started_at))}
                </span>
              </div>
            ))}
        </div>
      ) : (
        <div className="grid min-h-52 place-items-center text-center text-sm text-slate-500">
          {t('dashboard.noRecent')}
        </div>
      )}
      <p className="mt-4 text-xs leading-5 text-slate-500">
        {t('dashboard.manual')}
      </p>
    </article>
  )
}

function RecentActivity({ sessions }: { sessions: ExerciseSession[] }) {
  const { t, i18n } = useTranslation()

  return (
    <article className="kg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950">
          {t('dashboard.recent')}
        </h2>
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-teal-800 no-underline hover:bg-teal-50"
          to="/app/progress"
        >
          {t('dashboard.viewAll')}
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <div className="mt-3 divide-y divide-slate-100">
        {sessions.slice(0, 4).map((session) => (
          <Link
            className="flex min-h-16 items-center gap-3 rounded-xl px-1 py-3 no-underline hover:bg-slate-50 sm:px-2"
            key={session.id}
            to={`/app/sessions/${session.id}/summary`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100">
              <CheckCircle2 aria-hidden="true" size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-slate-900">
                {session.exercise_slug}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 sm:text-sm">
                {formatDate(session.started_at, i18n.resolvedLanguage ?? 'th')}
              </span>
            </span>
            <span className="hidden text-sm tabular-nums text-slate-500 sm:block">
              {formatDuration(session.elapsed_seconds)}
            </span>
            <ArrowRight
              aria-hidden="true"
              className="shrink-0 text-slate-400"
              size={17}
            />
          </Link>
        ))}
        {sessions.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">
            {t('dashboard.noRecent')}
          </p>
        )}
      </div>
    </article>
  )
}
