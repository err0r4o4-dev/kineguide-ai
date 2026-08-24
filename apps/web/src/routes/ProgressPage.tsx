import { useQuery } from '@tanstack/react-query'
import { CalendarCheck2, Clock3, Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { formatDuration } from '@/lib/format'
import { getDashboard } from '@/services/product'

export function ProgressPage() {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => getDashboard(signal)
  })
  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">
          {t('progress.title')}
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          {t('progress.subtitle')}
        </p>
      </header>
      {query.isLoading && <QueryLoading />}
      {query.isError && (
        <div className="mt-6">
          <QueryError retry={() => void query.refetch()} />
        </div>
      )}
      {query.data && (
        <>
          <section className="mt-7 grid gap-4 sm:grid-cols-3">
            <ProgressStat
              icon={CalendarCheck2}
              label={t('progress.sessions')}
              value={String(query.data.completed_sessions)}
            />
            <ProgressStat
              icon={Clock3}
              label={t('progress.time')}
              value={formatDuration(query.data.total_seconds)}
            />
            <ProgressStat
              icon={Flame}
              label={t('progress.streak')}
              value={String(query.data.current_streak)}
            />
          </section>
          <section className="kg-card mt-6 p-6">
            <h2 className="text-2xl font-bold">{t('progress.chart')}</h2>
            <div
              className="mt-7 flex h-64 items-end gap-3 border-b border-l border-slate-200 p-4"
              role="img"
              aria-label={t('progress.subtitle')}
            >
              {query.data.recent_sessions
                .slice(0, 12)
                .reverse()
                .map((session) => (
                  <div
                    className="group relative flex h-full flex-1 items-end"
                    key={session.id}
                  >
                    <div
                      className="w-full rounded-t-lg bg-teal-600"
                      style={{
                        height: `${Math.max(5, Math.min(100, session.elapsed_seconds / 6))}%`
                      }}
                      title={formatDuration(session.elapsed_seconds)}
                    />
                  </div>
                ))}
              {query.data.recent_sessions.length === 0 && (
                <p className="m-auto text-slate-500">{t('history.empty')}</p>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              {t('dashboard.manual')}
            </p>
          </section>
        </>
      )}
    </div>
  )
}
function ProgressStat({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Clock3
  label: string
  value: string
}) {
  return (
    <article className="kg-card p-6">
      <Icon aria-hidden="true" className="text-teal-700" />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </article>
  )
}
