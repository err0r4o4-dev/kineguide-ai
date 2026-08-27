import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  CalendarDays,
  Camera,
  CircleAlert,
  ClipboardCheck,
  Info,
  Play,
  ShieldCheck
} from 'lucide-react'
import { type KeyboardEvent, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { getActivityPlan, type Exercise } from '@/services/product'

export function PlanPage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const query = useQuery({
    queryKey: ['activity-plan'],
    queryFn: ({ signal }) => getActivityPlan(signal)
  })
  const requestedDay = Number(searchParams.get('day') ?? '1')
  const selectedDay =
    Number.isInteger(requestedDay) && requestedDay >= 1 && requestedDay <= 7
      ? requestedDay
      : 1
  const day = query.data?.days.find((item) => item.day === selectedDay)
  const firstExercise = day?.exercises[0]

  const selectDay = (nextDay: number, focus = false) => {
    setSearchParams({ day: String(nextDay) }, { replace: true })
    if (focus)
      window.requestAnimationFrame(() => tabRefs.current[nextDay - 1]?.focus())
  }
  const handleTabKey = (event: KeyboardEvent, dayNumber: number) => {
    let nextDay = dayNumber
    if (event.key === 'ArrowRight')
      nextDay = dayNumber === 7 ? 1 : dayNumber + 1
    if (event.key === 'ArrowLeft') nextDay = dayNumber === 1 ? 7 : dayNumber - 1
    if (event.key === 'Home') nextDay = 1
    if (event.key === 'End') nextDay = 7
    if (nextDay !== dayNumber) {
      event.preventDefault()
      selectDay(nextDay, true)
    }
  }

  if (query.isLoading) return <QueryLoading />
  if (query.isError) return <QueryError retry={() => void query.refetch()} />

  return (
    <div>
      <div
        className="mb-8 inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1"
        role="tablist"
        aria-label={t('nav.plan')}
      >
        <Link
          aria-current="page"
          className="rounded-lg bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800 no-underline"
          to="/app/plan"
        >
          {t('plan.title')}
        </Link>
        <Link
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-slate-50"
          to="/app/exercises"
        >
          {t('exercises.title')}
        </Link>
      </div>
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100">
              <CalendarDays aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
                {t('plan.title')}
              </h1>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                <CircleAlert aria-hidden="true" size={15} />
                {t('plan.pendingReview')}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            {t('plan.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a className="kg-button-secondary" href="#plan-details">
            <Info aria-hidden="true" />
            {t('plan.details')}
          </a>
          {firstExercise && (
            <Link
              className="kg-button-primary"
              to={`/app/exercises/${firstExercise.slug}/setup`}
            >
              <Play aria-hidden="true" />
              {t('plan.start')}
            </Link>
          )}
        </div>
      </header>

      <section
        className="mt-8 grid gap-5 xl:grid-cols-[1fr_350px]"
        id="plan-details"
      >
        <article className="kg-card p-6 sm:p-7">
          <div className="flex items-start gap-3">
            <ClipboardCheck
              aria-hidden="true"
              className="mt-1 shrink-0 text-teal-700"
            />
            <div>
              <h2 className="text-2xl font-bold">{t('plan.goalTitle')}</h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                {t('plan.goalBody')}
              </p>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-500">{t('plan.duration')}</dt>
              <dd className="mt-1 font-semibold">{t('plan.durationValue')}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t('plan.basis')}</dt>
              <dd className="mt-1 font-semibold">{t('plan.basisValue')}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t('common.safety')}</dt>
              <dd className="mt-1 font-semibold text-amber-800">
                {t('plan.notPersonalized')}
              </dd>
            </div>
          </dl>
        </article>
        <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-7">
          <h2 className="flex items-center gap-2 text-xl font-bold text-amber-950">
            <CircleAlert aria-hidden="true" />
            {t('plan.cautionTitle')}
          </h2>
          <ul className="mt-4 space-y-4 text-sm leading-6 text-amber-950">
            <li className="flex gap-3">
              <span aria-hidden="true">○</span>
              {t('plan.cautionOne')}
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true">○</span>
              {t('plan.cautionTwo')}
            </li>
          </ul>
        </aside>
      </section>

      <div
        aria-label={t('plan.title')}
        className="mt-8 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"
        role="tablist"
      >
        {query.data?.days.map((item) => (
          <button
            aria-controls={`day-panel-${item.day}`}
            aria-selected={selectedDay === item.day}
            className={`min-h-11 shrink-0 rounded-lg px-4 text-sm font-semibold ${selectedDay === item.day ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`}
            id={`day-tab-${item.day}`}
            key={item.day}
            onClick={() => selectDay(item.day)}
            onKeyDown={(event) => handleTabKey(event, item.day)}
            ref={(node) => {
              tabRefs.current[item.day - 1] = node
            }}
            role="tab"
            tabIndex={selectedDay === item.day ? 0 : -1}
            type="button"
          >
            {t('plan.day', { day: item.day })}
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`day-tab-${selectedDay}`}
        className="pt-8"
        id={`day-panel-${selectedDay}`}
        role="tabpanel"
      >
        <h2 className="text-2xl font-bold">
          {t('plan.activitiesForDay', { day: selectedDay })}
        </h2>
        {day && day.exercises.length > 0 ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {day.exercises.map((exercise) => (
              <ExerciseCard
                exercise={exercise}
                key={exercise.slug}
                language={i18n.resolvedLanguage}
              />
            ))}
          </div>
        ) : (
          <p className="kg-card mt-5 p-6 text-slate-600">{t('plan.empty')}</p>
        )}
      </section>
    </div>
  )
}

function ExerciseCard({
  exercise,
  language
}: {
  exercise: Exercise
  language?: string
}) {
  const { t } = useTranslation()
  const title = language === 'th' ? exercise.title_th : exercise.title_en
  return (
    <article className="kg-card flex min-h-full flex-col overflow-hidden">
      <div className="grid aspect-[16/8] place-items-center border-b border-slate-200 bg-slate-50 text-teal-700">
        <div className="text-center">
          <Camera aria-hidden="true" className="mx-auto" size={42} />
          <p className="mt-2 text-sm font-semibold">{t('plan.camera')}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          {t(
            exercise.category === 'lower_body'
              ? 'exercises.lower'
              : 'exercises.upper'
          )}
        </p>
        <h3 className="mt-2 text-lg font-bold">{title}</h3>
        <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
          <ShieldCheck aria-hidden="true" className="mt-1 shrink-0" size={17} />
          {t('common.pendingReview')}
        </p>
        <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2">
          <Link
            className="kg-button-secondary px-3 text-sm"
            to={`/app/exercises/${exercise.slug}`}
          >
            {t('plan.viewExercise')}
          </Link>
          <Link
            className="kg-button-primary px-3 text-sm"
            to={`/app/exercises/${exercise.slug}/setup`}
          >
            {t('plan.startExercise')}
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </div>
    </article>
  )
}
