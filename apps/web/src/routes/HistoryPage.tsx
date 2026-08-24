import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock3, Hash } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { formatDate, formatDuration } from '@/lib/format'
import { getSessions } from '@/services/product'

export function HistoryPage() {
  const { t, i18n } = useTranslation()
  const query = useQuery({
    queryKey: ['sessions'],
    queryFn: ({ signal }) => getSessions(signal)
  })
  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">{t('history.title')}</h1>
        <p className="mt-2 text-slate-600">{t('history.subtitle')}</p>
      </header>
      {query.isLoading && <QueryLoading />}
      {query.isError && (
        <div className="mt-6">
          <QueryError retry={() => void query.refetch()} />
        </div>
      )}
      {query.data && (
        <section className="mt-7 space-y-4">
          {query.data.map((session) => (
            <article
              className="kg-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
              key={session.id}
            >
              <div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${session.status === 'completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}
                >
                  {session.status === 'completed'
                    ? t('history.completed')
                    : t('history.stopped')}
                </span>
                <h2 className="mt-3 font-bold">{session.exercise_slug}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays aria-hidden="true" size={16} />
                  {formatDate(
                    session.started_at,
                    i18n.resolvedLanguage ?? 'th'
                  )}
                </p>
              </div>
              <div className="flex gap-5 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Clock3 aria-hidden="true" />
                  {formatDuration(session.elapsed_seconds)}
                </span>
                <span className="flex items-center gap-2">
                  <Hash aria-hidden="true" />
                  {session.manual_repetitions}
                </span>
              </div>
            </article>
          ))}
          {query.data.length === 0 && (
            <p className="kg-card p-8 text-center text-slate-500">
              {t('history.empty')}
            </p>
          )}
        </section>
      )}
    </div>
  )
}
