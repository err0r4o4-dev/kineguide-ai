import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock3, Hash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { formatDuration } from '@/lib/format'
import { getSession } from '@/services/product'

export function SessionSummaryPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['session', id],
    queryFn: ({ signal }) => getSession(id, signal)
  })
  if (query.isLoading) return <QueryLoading />
  if (query.isError) return <QueryError retry={() => void query.refetch()} />
  return (
    <div className="mx-auto max-w-3xl">
      <section className="kg-card p-7 text-center sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 aria-hidden="true" size={34} />
        </span>
        <h1 className="mt-5 text-3xl font-bold">{t('session.summary')}</h1>
        <p className="mt-2 text-slate-600">{t('session.completed')}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-6">
            <Clock3 aria-hidden="true" className="mx-auto text-teal-700" />
            <p className="mt-3 text-sm text-slate-500">
              {t('session.elapsed')}
            </p>
            <p className="mt-1 text-3xl font-bold">
              {formatDuration(query.data?.elapsed_seconds ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-6">
            <Hash aria-hidden="true" className="mx-auto text-teal-700" />
            <p className="mt-3 text-sm text-slate-500">{t('session.reps')}</p>
            <p className="mt-1 text-3xl font-bold">
              {query.data?.manual_repetitions}
            </p>
          </div>
        </div>
        <p className="mt-7 text-sm text-slate-500">{t('dashboard.manual')}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="kg-button-primary" to="/app">
            {t('session.backHome')}
          </Link>
          <Link className="kg-button-secondary" to="/app/history">
            {t('session.viewHistory')}
          </Link>
        </div>
      </section>
    </div>
  )
}
