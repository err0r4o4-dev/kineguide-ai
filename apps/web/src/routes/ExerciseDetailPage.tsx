import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Camera, CircleAlert, Cpu, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { getExercise } from '@/services/product'

export function ExerciseDetailPage() {
  const { slug = '' } = useParams()
  const { t, i18n } = useTranslation()
  const query = useQuery({
    queryKey: ['exercise', slug],
    queryFn: ({ signal }) => getExercise(slug, signal)
  })
  if (query.isLoading) return <QueryLoading />
  if (query.isError) return <QueryError retry={() => void query.refetch()} />
  const exercise = query.data
  return (
    <div>
      <Link
        className="inline-flex items-center gap-2 text-teal-700"
        to="/app/exercises"
      >
        <ArrowLeft aria-hidden="true" />
        {t('common.back')}
      </Link>
      <section className="kg-card mx-auto mt-7 max-w-4xl overflow-hidden">
        <div className="grid min-h-64 place-items-center bg-indigo-50 text-teal-700">
          <Camera aria-hidden="true" size={72} />
        </div>
        <div className="p-6 sm:p-9">
          <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
            {t('exercises.review')}
          </span>
          <h1 className="mt-4 text-3xl font-bold">
            {i18n.resolvedLanguage === 'th'
              ? exercise?.title_th
              : exercise?.title_en}
          </h1>
          <p className="mt-4 text-slate-600">{t('common.pendingReview')}</p>
        </div>
      </section>
      <section className="mx-auto mt-6 grid max-w-4xl gap-5 md:grid-cols-2">
        <article className="kg-card p-6">
          <Cpu aria-hidden="true" className="text-teal-700" />
          <h2 className="mt-3 text-xl font-bold">{t('exercises.what')}</h2>
          <p className="mt-3 leading-7 text-slate-600">
            {t('exercises.whatBody')}
          </p>
        </article>
        <article className="kg-card p-6">
          <CircleAlert aria-hidden="true" className="text-amber-700" />
          <h2 className="mt-3 text-xl font-bold">
            {t('exercises.notIncluded')}
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            {t('exercises.notIncludedBody')}
          </p>
        </article>
      </section>
      <div className="sticky bottom-4 mx-auto mt-8 flex max-w-4xl flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <Link
          className="kg-button-primary w-full"
          to={`/app/exercises/${slug}/setup`}
        >
          <Camera aria-hidden="true" />
          {t('exercises.start')}
        </Link>
        <p className="flex items-center gap-2 text-xs text-red-700">
          <ShieldCheck aria-hidden="true" size={14} />
          {t('common.noDiagnosis')}
        </p>
      </div>
    </div>
  )
}
