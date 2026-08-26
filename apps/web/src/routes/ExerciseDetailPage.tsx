import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Camera,
  CircleAlert,
  ClipboardCheck,
  Info,
  Play,
  ShieldCheck
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { SafetyNotice } from '@/components/SafetyNotice'
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
  if (!query.data) return null
  const title =
    i18n.resolvedLanguage === 'th' ? query.data.title_th : query.data.title_en

  return (
    <div>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600"
            to="/app/plan"
          >
            <ArrowLeft aria-hidden="true" size={18} />
            {t('common.back')}
          </Link>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
            {t('plan.viewExercise')}
          </h1>
          <p className="mt-2 text-lg text-slate-600">{title}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="kg-button-secondary" to="/app/plan">
            {t('nav.plan')}
          </Link>
          <Link
            className="kg-button-primary"
            to={`/app/exercises/${slug}/setup`}
          >
            <Camera aria-hidden="true" size={18} />
            {t('exercises.start')}
          </Link>
        </div>
      </header>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(330px,0.78fr)_minmax(0,1fr)]">
        <div>
          <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-teal-800">
            <div className="text-center">
              <Camera aria-hidden="true" className="mx-auto" size={54} />
              <p className="mt-3 px-6 text-sm font-semibold">
                {t('camera.secure')}
              </p>
            </div>
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-2xl bg-white/95 text-teal-800 shadow-lg shadow-slate-900/10">
                <Play aria-hidden="true" fill="currentColor" size={25} />
              </span>
            </span>
          </div>
          <article className="kg-card mt-4 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-teal-800">
              <Info aria-hidden="true" size={17} />
              {t('exercises.what')}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">{t('nav.plan')}</p>
                <p className="mt-1 font-bold text-slate-900">
                  {t(
                    query.data.category === 'lower_body'
                      ? 'exercises.lower'
                      : 'exercises.upper'
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">
                  {t('exercises.review')}
                </p>
                <p className="mt-1 font-bold text-teal-800">
                  {t('common.pendingReview')}
                </p>
              </div>
            </div>
          </article>
        </div>
        <div className="kg-card p-6 sm:p-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-950">
              {t('exercises.what')}
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              {t('exercises.whatBody')}
            </p>
          </section>
          <section className="mt-7 border-t border-slate-200 pt-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
              <ClipboardCheck aria-hidden="true" className="text-teal-700" />
              {t('plan.cautionTitle')}
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              {t('exercises.notIncludedBody')}
            </p>
          </section>
          <section className="mt-7 border-t border-slate-200 pt-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
              <CircleAlert aria-hidden="true" className="text-amber-700" />
              {t('common.safety')}
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              {t('common.pendingReview')}
            </p>
          </section>
        </div>
      </section>
      <SafetyNotice>
        <span className="flex items-start gap-2">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={18}
          />
          {t('common.noDiagnosis')}
        </span>
      </SafetyNotice>
    </div>
  )
}
