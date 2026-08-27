import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Flame,
  MessageCircle,
  Play
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { SafetyNotice } from '@/components/SafetyNotice'
import { formatDate, formatDuration } from '@/lib/format'
import { getDashboard, type ExerciseSession } from '@/services/product'

const ranges = [7, 30, 90] as const
const dayInMilliseconds = 86_400_000
const illustrationPath = '/dashboard-sit-to-stand.png'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const [range, setRange] = useState<(typeof ranges)[number]>(7)
  const [today] = useState(() => new Date())
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => getDashboard(signal)
  })
  const language = i18n.resolvedLanguage === 'th' ? 'th' : 'en'
  const visibleSessions = useMemo(
    () =>
      (query.data?.recent_sessions ?? []).filter(
        (session) =>
          new Date(session.started_at).getTime() >=
          today.getTime() - range * dayInMilliseconds
      ),
    [query.data?.recent_sessions, range, today]
  )

  return (
    <div className="pb-4">
      {query.isLoading && <QueryLoading />}
      {query.isError && <QueryError retry={() => void query.refetch()} />}

      {query.data && (
        <>
          <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.95fr)]">
            <TodayActivity />

            <div className="grid gap-4">
              <AiAssistantCard />
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

          <section className="mt-4 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(19rem,1fr)]">
            <WeeklyActivity
              language={language}
              onRangeChange={setRange}
              range={range}
              sessions={visibleSessions}
              today={today}
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
    <article className="kg-card flex min-h-full flex-col overflow-hidden p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100">
          <CalendarCheck2 aria-hidden="true" size={18} />
        </span>
        <h1 className="text-lg font-bold text-slate-950 sm:text-xl">
          {t('dashboard.today')}
        </h1>
      </div>

      <div className="mt-4 grid flex-1 gap-6 md:grid-cols-[minmax(0,1.12fr)_minmax(13rem,0.88fr)] md:items-center">
        <div className="grid min-h-52 place-items-center overflow-hidden rounded-2xl bg-[#f3f9f8] sm:min-h-64">
          <img
            alt={t('dashboard.todayIllustrationAlt')}
            className="h-full max-h-72 w-full object-contain"
            decoding="async"
            height="1024"
            loading="eager"
            src={illustrationPath}
            width="1536"
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-2xl font-bold leading-tight text-slate-950">
            {t('dashboard.todayName')}
          </h3>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {t('dashboard.todayProgress')}
          </p>
          <div
            aria-label={t('dashboard.todayProgress')}
            aria-valuemax={7}
            aria-valuemin={0}
            aria-valuenow={1}
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
          >
            <span className="block h-full w-[14%] rounded-full bg-teal-700" />
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            {t('common.pendingReview')}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="kg-button-primary" to="/app/camera">
              <Play aria-hidden="true" size={17} />
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

function AiAssistantCard() {
  const { t } = useTranslation()

  return (
    <article className="kg-card p-5 sm:p-6">
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-700 text-white shadow-sm">
          <MessageCircle aria-hidden="true" size={21} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-950 sm:text-lg">
            {t('dashboard.aiTitle')}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {t('dashboard.aiBody')}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {t('dashboard.aiBoundary')}
          </p>
          <Link
            className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl font-bold text-teal-800 no-underline hover:text-teal-950"
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
    <div className="grid min-w-0 place-items-center px-2 py-4 text-center sm:px-4">
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

function WeeklyActivity({
  language,
  onRangeChange,
  range,
  sessions,
  today
}: {
  language: 'th' | 'en'
  onRangeChange: (range: (typeof ranges)[number]) => void
  range: (typeof ranges)[number]
  sessions: ExerciseSession[]
  today: Date
}) {
  const { t } = useTranslation()
  const points = useMemo(
    () => buildChartPoints(sessions, range, today),
    [range, sessions, today]
  )
  const maximum = Math.max(...points.map(({ seconds }) => seconds), 1)

  return (
    <article className="kg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 aria-hidden="true" className="text-teal-700" size={21} />
          <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
            {t('dashboard.weekly')}
          </h2>
        </div>
        <div
          aria-label={t('dashboard.range')}
          className="grid grid-cols-3 gap-2"
          role="group"
        >
          {ranges.map((value) => (
            <button
              aria-pressed={range === value}
              className={`min-h-11 rounded-lg border px-3 text-sm font-semibold transition-colors ${range === value ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50'}`}
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
          className="relative mt-6 h-56"
          role="img"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-2 bottom-12 flex flex-col justify-between"
          >
            {[60, 40, 20, 0].map((value) => (
              <span className="flex items-center gap-2" key={value}>
                <span className="w-6 text-right text-[0.65rem] tabular-nums text-slate-400">
                  {value}
                </span>
                <span className="h-px flex-1 border-t border-dashed border-slate-200" />
              </span>
            ))}
          </div>
          <div className="absolute inset-x-8 top-2 bottom-0 flex items-end gap-2 sm:gap-4">
            {points.map((point) => {
              const minutes = Math.round(point.seconds / 60)
              const height =
                point.seconds === 0
                  ? '0%'
                  : `${Math.max(12, (point.seconds / maximum) * 84)}%`

              return (
                <div
                  className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"
                  key={point.startedAt.toISOString()}
                >
                  <div className="flex min-h-40 flex-1 flex-col justify-end">
                    {point.seconds > 0 && (
                      <span className="mb-1 text-[0.7rem] font-semibold tabular-nums text-slate-700">
                        {minutes}
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      className="mx-auto w-full max-w-8 rounded-t bg-teal-700"
                      style={{ height }}
                    />
                  </div>
                  <span className="mt-2 truncate text-[0.7rem] font-medium text-slate-600">
                    {new Intl.DateTimeFormat(
                      language === 'th' ? 'th-TH' : 'en-GB',
                      { weekday: 'narrow' }
                    ).format(point.startedAt)}
                  </span>
                  <span className="truncate text-[0.65rem] text-slate-400">
                    {new Intl.DateTimeFormat(
                      language === 'th' ? 'th-TH' : 'en-GB',
                      { day: 'numeric', month: 'short' }
                    ).format(point.startedAt)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="grid min-h-56 place-items-center text-center text-sm text-slate-500">
          {t('dashboard.noRecent')}
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {t('dashboard.manual')}
      </p>
    </article>
  )
}

function buildChartPoints(
  sessions: ExerciseSession[],
  range: (typeof ranges)[number],
  today: Date
) {
  const end = new Date(today)
  end.setHours(24, 0, 0, 0)
  const start = new Date(end.getTime() - range * dayInMilliseconds)
  const bucketDuration = (range * dayInMilliseconds) / 7
  const points = Array.from({ length: 7 }, (_, index) => ({
    seconds: 0,
    startedAt: new Date(start.getTime() + index * bucketDuration)
  }))

  sessions.forEach((session) => {
    const startedAt = new Date(session.started_at).getTime()
    const bucket = Math.min(
      6,
      Math.floor((startedAt - start.getTime()) / bucketDuration)
    )
    if (bucket >= 0) points[bucket].seconds += session.elapsed_seconds
  })

  return points
}

function RecentActivity({ sessions }: { sessions: ExerciseSession[] }) {
  const { t, i18n } = useTranslation()

  return (
    <article className="kg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
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
      <div className="mt-2 divide-y divide-slate-100">
        {sessions.slice(0, 4).map((session) => (
          <Link
            className="flex min-h-[4.75rem] items-center gap-3 rounded-xl px-1 py-3 no-underline hover:bg-slate-50 sm:px-2"
            key={session.id}
            to={`/app/sessions/${session.id}/summary`}
          >
            <span className="size-11 shrink-0 overflow-hidden rounded-full bg-teal-50 ring-1 ring-inset ring-teal-100">
              <img
                alt=""
                className="h-full w-full object-cover"
                decoding="async"
                loading="lazy"
                src={illustrationPath}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-slate-900">
                {session.exercise_slug === 'sit-to-stand-demo'
                  ? t('dashboard.todayName')
                  : session.exercise_slug}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {formatDate(session.started_at, i18n.resolvedLanguage ?? 'th')}
              </span>
            </span>
            <span className="text-xs tabular-nums text-slate-500 sm:text-sm">
              {formatDuration(session.elapsed_seconds)}
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
    </article>
  )
}
