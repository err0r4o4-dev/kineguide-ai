import { useQuery } from '@tanstack/react-query'
import { Camera, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { getExercises } from '@/services/product'

export function CameraPracticePage() {
  const { t, i18n } = useTranslation()
  const query = useQuery({
    queryKey: ['exercises'],
    queryFn: ({ signal }) => getExercises(signal),
    staleTime: 60_000
  })

  if (query.isLoading) return <QueryLoading />
  if (query.isError) return <QueryError retry={() => void query.refetch()} />

  return (
    <div>
      <PageHeader
        title={t('camera.practiceTitle')}
        subtitle={t('camera.practiceSubtitle')}
      />
      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-950">
          {t('camera.chooseActivity')}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data?.map((exercise) => (
            <Link
              className="kg-card group flex min-h-40 items-center gap-4 p-5 no-underline transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg motion-reduce:hover:translate-y-0"
              key={exercise.slug}
              to={`/app/exercises/${exercise.slug}/setup`}
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100">
                <Camera aria-hidden="true" size={25} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wide text-teal-700">
                  {t(
                    exercise.category === 'lower_body'
                      ? 'exercises.lower'
                      : 'exercises.upper'
                  )}
                </span>
                <span className="mt-1 block text-lg font-bold text-slate-950">
                  {i18n.resolvedLanguage === 'th'
                    ? exercise.title_th
                    : exercise.title_en}
                </span>
                <span className="mt-2 block text-sm text-slate-600">
                  {t('camera.secure')}
                </span>
              </span>
              <ChevronRight aria-hidden="true" className="text-teal-700" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
