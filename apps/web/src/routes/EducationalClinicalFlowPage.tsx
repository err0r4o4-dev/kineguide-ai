import { useMutation, useQuery } from '@tanstack/react-query'
import { CircleAlert, FlaskConical, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import {
  evaluateEducationalScreening,
  getEducationalClinicalCatalog,
  type EducationalScreeningResult
} from '@/services/product'

export function EducationalClinicalFlowPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'en' ? 'en' : 'th'
  const [selectedOption, setSelectedOption] = useState('')
  const [result, setResult] = useState<EducationalScreeningResult | null>(null)
  const catalog = useQuery({
    queryKey: ['educational-clinical-flow', locale],
    queryFn: ({ signal }) => getEducationalClinicalCatalog(locale, signal)
  })
  const evaluate = useMutation({
    mutationFn: () =>
      evaluateEducationalScreening({
        locale,
        answers: [
          {
            questionId: 'demo-screening-placeholder-v1',
            optionId: selectedOption
          }
        ]
      }),
    onSuccess: setResult
  })
  const question = catalog.data?.screeningQuestions[0]

  if (catalog.isLoading) return <QueryLoading />
  if (catalog.isError)
    return <QueryError retry={() => void catalog.refetch()} />

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <p className="flex items-center gap-2 text-sm font-semibold text-teal-800">
          <FlaskConical aria-hidden="true" size={18} />
          {t('clinicalFlow.eyebrow')}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-[-0.025em] text-kg-ink sm:text-4xl">
          {t('clinicalFlow.title')}
        </h1>
      </header>

      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <div className="flex items-start gap-3">
          <ShieldCheck aria-hidden="true" className="mt-1 shrink-0" size={21} />
          <div>
            <span className="inline-flex rounded-md bg-amber-100 px-2 py-1 text-xs font-bold">
              {t('clinicalFlow.pendingBadge')}
            </span>
            <p className="mt-3 text-sm leading-7 sm:text-base">
              {t('clinicalFlow.disclaimer')}
            </p>
          </div>
        </div>
      </section>

      {question && !result && (
        <form
          className="kg-card mt-6 p-5 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault()
            if (selectedOption) evaluate.mutate()
          }}
        >
          <fieldset>
            <legend className="text-xl font-bold text-kg-ink">
              {question.prompt}
            </legend>
            <p className="mt-2 text-sm leading-6 text-kg-muted">
              {t('clinicalFlow.mockNotice')}
            </p>
            <div className="mt-5 space-y-3">
              {question.options.map((option) => (
                <label
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-kg-border p-4 focus-within:ring-4 focus-within:ring-teal-100"
                  key={option.id}
                >
                  <input
                    checked={selectedOption === option.id}
                    name="demo-screening"
                    onChange={() => setSelectedOption(option.id)}
                    type="radio"
                    value={option.id}
                  />
                  <span className="font-medium text-kg-ink">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {evaluate.isError && (
            <p className="kg-alert-danger mt-4" role="alert">
              {t('clinicalFlow.evaluateFailed')}
            </p>
          )}
          <button
            className="kg-button-primary mt-5"
            disabled={!selectedOption || evaluate.isPending}
            type="submit"
          >
            {evaluate.isPending
              ? t('common.loading')
              : t('clinicalFlow.evaluate')}
          </button>
        </form>
      )}

      {result?.outcome === 'stopped_demo_placeholder' && (
        <section
          aria-label={t('clinicalFlow.stoppedTitle')}
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950"
          role="alert"
        >
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CircleAlert aria-hidden="true" />
            {t('clinicalFlow.stoppedTitle')}
          </h2>
          <p className="mt-3 leading-7">{result.message}</p>
          <button
            className="kg-button-secondary mt-5"
            onClick={() => {
              setResult(null)
              setSelectedOption('')
            }}
            type="button"
          >
            {t('clinicalFlow.restart')}
          </button>
        </section>
      )}

      {result?.outcome === 'demo_exercises_available' && (
        <section className="mt-7" aria-labelledby="demo-exercises-title">
          <h2 className="text-2xl font-bold" id="demo-exercises-title">
            {t('clinicalFlow.demoExercises')}
          </h2>
          <p className="mt-2 leading-7 text-kg-muted">{result.message}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {result.exercises.map((exercise) => (
              <article className="kg-card p-5" key={exercise.id}>
                <span className="text-xs font-bold text-amber-800">
                  {t('clinicalFlow.pendingBadge')}
                </span>
                <h3 className="mt-3 text-lg font-bold">{exercise.title}</h3>
                <p className="mt-2 text-sm leading-6 text-kg-muted">
                  {t('clinicalFlow.demoMovement')}
                </p>
                <Link
                  className="kg-button-secondary mt-5"
                  to={`/app/activities/${exercise.slug}`}
                >
                  {t('exercises.details')}
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
