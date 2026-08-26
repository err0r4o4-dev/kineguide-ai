import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Flame,
  MessageCircle,
  Play,
  Video
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { SafetyNotice } from '@/components/SafetyNotice'
import { StatCard } from '@/components/StatCard'
import { useAuth } from '@/features/auth/AuthContext'
import { formatDate, formatDuration } from '@/lib/format'
import { getDashboard } from '@/services/product'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => getDashboard(signal)
  })

  return (
    <div>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat(
          i18n.resolvedLanguage === 'th' ? 'th-TH' : 'en-GB',
          { dateStyle: 'full' }
        ).format(new Date())}
        title={t('dashboard.hello', { name: auth.user?.display_name })}
        subtitle={t('dashboard.ready')}
      />
      {query.isLoading && <QueryLoading />}
      {query.isError && (
        <div className="mt-6">
          <QueryError retry={() => void query.refetch()} />
        </div>
      )}
      {query.data && (
        <>
          <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
            <article className="kg-card overflow-hidden p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-800">
                  <CalendarCheck2 aria-hidden="true" size={21} />
                </span>
                <h2 className="text-xl font-bold text-slate-950">
                  {t('dashboard.today')}
                </h2>
              </div>
              <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(170px,0.8fr)_minmax(0,1fr)] sm:items-center">
                <div className="grid aspect-square max-h-60 place-items-center rounded-2xl bg-teal-50 text-teal-800">
                  <div className="text-center">
                    <Video aria-hidden="true" className="mx-auto" size={48} />
                    <p className="mt-3 px-5 text-sm font-semibold">
                      {t('camera.secure')}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-950">
                    {t('dashboard.todayName')}
                  </h3>
                  <p className="mt-2 font-semibold text-slate-700">
                    {t('dashboard.todayProgress')}
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
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
            <div className="space-y-5">
              <article className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
                <div className="flex gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-700 text-white">
                    <MessageCircle aria-hidden="true" size={21} />
                  </span>
                  <div>
                    <h2 className="font-bold text-slate-950">
                      {t('dashboard.aiTitle')}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {t('dashboard.aiBody')}
                    </p>
                    <Link
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-800"
                      to="/app/chat"
                    >
                      {t('dashboard.aiStart')}
                      <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  </div>
                </div>
              </article>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <StatCard
                  icon={CheckCircle2}
                  label={t('dashboard.completed')}
                  value={String(query.data.completed_sessions)}
                />
                <StatCard
                  icon={Flame}
                  label={t('dashboard.streak')}
                  value={String(query.data.current_streak)}
                />
                <StatCard
                  icon={Clock3}
                  label={t('dashboard.time')}
                  value={formatDuration(query.data.total_seconds)}
                />
              </div>
            </div>
          </section>
          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <article className="kg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-950">
                  {t('dashboard.recent')}
                </h2>
                <Link
                  className="text-sm font-semibold text-teal-800"
                  to="/app/progress"
                >
                  {t('nav.progress')}
                </Link>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {query.data.recent_sessions.slice(0, 4).map((session) => (
                  <Link
                    className="flex items-center gap-3 py-4 no-underline hover:bg-slate-50"
                    key={session.id}
                    to={`/app/sessions/${session.id}/summary`}
                  >
                    <span className="grid size-9 place-items-center rounded-full bg-teal-50 text-teal-800">
                      <CheckCircle2 aria-hidden="true" size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-900">
                        {session.exercise_slug}
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {formatDate(
                          session.started_at,
                          i18n.resolvedLanguage ?? 'th'
                        )}
                      </span>
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatDuration(session.elapsed_seconds)}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="text-slate-400"
                      size={17}
                    />
                  </Link>
                ))}
                {query.data.recent_sessions.length === 0 && (
                  <p className="py-8 text-center text-slate-500">
                    {t('dashboard.noRecent')}
                  </p>
                )}
              </div>
            </article>
            <article className="kg-card p-5 sm:p-6">
              <h2 className="text-xl font-bold text-slate-950">
                {t('dashboard.weekly')}
              </h2>
              <div
                className="mt-7 flex h-40 items-end gap-3"
                aria-label={t('dashboard.manual')}
                role="img"
              >
                {query.data.recent_sessions
                  .slice(0, 7)
                  .reverse()
                  .map((session) => (
                    <div
                      className="flex flex-1 flex-col items-center gap-2"
                      key={session.id}
                    >
                      <div
                        className="w-full rounded-t-lg bg-teal-700"
                        style={{
                          height: `${Math.max(12, Math.min(100, session.elapsed_seconds / 6))}%`
                        }}
                      />
                      <span className="text-xs text-slate-500">
                        {new Date(session.started_at).getDate()}
                      </span>
                    </div>
                  ))}
                {query.data.recent_sessions.length === 0 && (
                  <p className="m-auto text-slate-500">
                    {t('dashboard.noRecent')}
                  </p>
                )}
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                {t('dashboard.manual')}
              </p>
            </article>
          </section>
          <SafetyNotice>{t('common.noDiagnosis')}</SafetyNotice>
        </>
      )}
    </div>
  )
}
