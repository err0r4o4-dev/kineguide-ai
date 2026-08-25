import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  CalendarCheck2,
  Clock3,
  Flame,
  MessageCircle,
  Play,
  ShieldCheck
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { useAuth } from '@/features/auth/AuthContext'
import { formatDate, formatDuration } from '@/lib/format'
import { getDashboard } from '@/services/product'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const location = useLocation()
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => getDashboard(signal)
  })
  return (
    <div>
      <header>
        <div>
          <p className="text-sm text-slate-500">
            {new Intl.DateTimeFormat(
              i18n.resolvedLanguage === 'th' ? 'th-TH' : 'en-GB',
              { dateStyle: 'full' }
            ).format(new Date())}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
            {t('dashboard.hello', { name: auth.user?.display_name })}
          </h1>
          <p className="mt-2 text-slate-600">{t('dashboard.ready')}</p>
        </div>
      </header>
      <section className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-teal-700 text-white">
            <MessageCircle aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-950">
                {t('dashboard.aiTitle')}
              </h2>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-800">
                {t('dashboard.aiStructured')}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              {t('dashboard.aiBody')}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {t('dashboard.aiBoundary')}
            </p>
          </div>
        </div>
        <Link className="kg-button-secondary shrink-0" to="/app/assessment">
          {t('dashboard.aiStart')}
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>
      {location.state?.assessmentSaved && (
        <p className="kg-alert-success mt-5" role="status">
          {t('assessment.saved')}
        </p>
      )}
      {query.isLoading && <QueryLoading />}
      {query.isError && (
        <div className="mt-6">
          <QueryError retry={() => void query.refetch()} />
        </div>
      )}
      {query.data && (
        <>
          <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_320px]">
            <article className="kg-card overflow-hidden p-6 sm:p-8">
              <p className="font-semibold text-teal-700">
                ★ {t('dashboard.recommended')}
              </p>
              <div className="mt-4 grid gap-6 md:grid-cols-[160px_1fr] md:items-center">
                <div className="grid aspect-square place-items-center rounded-2xl bg-indigo-50 text-teal-700">
                  <Play aria-hidden="true" size={52} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {i18n.resolvedLanguage === 'th'
                      ? 'สาธิตการลุกนั่งจากเก้าอี้'
                      : 'Sit-to-stand movement demo'}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {t('common.pendingReview')}
                  </p>
                  <Link className="kg-button-primary mt-5" to="/app/exercises">
                    {t('dashboard.start')}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
              <Stat
                icon={CalendarCheck2}
                label={t('dashboard.sessions')}
                value={String(query.data.completed_sessions)}
              />
              <Stat
                icon={Flame}
                label={t('dashboard.streak')}
                value={String(query.data.current_streak)}
              />
              <Stat
                icon={Clock3}
                label={t('dashboard.time')}
                value={formatDuration(query.data.total_seconds)}
              />
              <Stat
                icon={ShieldCheck}
                label={t('common.privacy')}
                value={t('common.onDevice')}
                small
              />
            </div>
          </section>
          <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
            <article className="kg-card min-h-72 p-6">
              <h2 className="text-2xl font-bold">{t('dashboard.weekly')}</h2>
              <div
                className="mt-8 flex h-40 items-end gap-3"
                aria-label={t('dashboard.manual')}
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
                        className="w-full rounded-t-lg bg-teal-600"
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
              <p className="mt-4 text-xs text-slate-500">
                {t('dashboard.manual')}
              </p>
            </article>
            <article className="kg-card p-6">
              <h2 className="text-2xl font-bold">{t('dashboard.recent')}</h2>
              <div className="mt-5 space-y-4">
                {query.data.recent_sessions.slice(0, 3).map((session) => (
                  <div className="rounded-xl bg-slate-50 p-4" key={session.id}>
                    <p className="font-semibold">{session.exercise_slug}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(
                        session.started_at,
                        i18n.resolvedLanguage ?? 'th'
                      )}{' '}
                      · {formatDuration(session.elapsed_seconds)}
                    </p>
                  </div>
                ))}
                {query.data.recent_sessions.length === 0 && (
                  <p className="text-slate-500">{t('dashboard.noRecent')}</p>
                )}
              </div>
              <Link
                className="kg-button-secondary mt-5 w-full"
                to="/app/history"
              >
                {t('nav.history')}
              </Link>
            </article>
          </section>
        </>
      )}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  small = false
}: {
  icon: typeof Clock3
  label: string
  value: string
  small?: boolean
}) {
  return (
    <article className="kg-card p-5">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{label}</span>
        <Icon aria-hidden="true" className="text-teal-700" size={19} />
      </div>
      <p
        className={`mt-3 font-bold text-slate-950 ${small ? 'text-xl' : 'text-3xl'}`}
      >
        {value}
      </p>
    </article>
  )
}
