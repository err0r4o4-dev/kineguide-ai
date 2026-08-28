import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, type UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { PageHeader } from '@/components/PageHeader'
import { QueryError } from '@/components/QueryState'
import { SafetyNotice } from '@/components/SafetyNotice'
import {
  getLatestAssessment,
  saveAssessment,
  type AssessmentInput
} from '@/services/product'

const concernAreas = [
  'lower_back',
  'knee',
  'shoulder',
  'general_mobility',
  'prefer_not_to_say'
] as const
const durationBands = [
  'lt_week',
  'one_to_four_weeks',
  'gt_four_weeks',
  'unsure'
] as const
const dailyImpacts = ['none', 'some', 'much', 'prefer_not_to_say'] as const
const goals = ['understand', 'camera_demo', 'track_activity'] as const

const assessmentSchema = z.object({
  concern_area: z.enum(concernAreas),
  duration_band: z.enum(durationBands),
  daily_impact: z.enum(dailyImpacts),
  goal: z.enum(goals)
})

export function AssessmentPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const latest = useQuery({
    queryKey: ['assessment', 'latest'],
    queryFn: ({ signal }) => getLatestAssessment(signal)
  })
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<AssessmentInput>({
    resolver: zodResolver(assessmentSchema)
  })
  const saving = useMutation({
    mutationFn: saveAssessment,
    onSuccess: (assessment) => {
      queryClient.setQueryData(['assessment', 'latest'], assessment)
      reset(assessment)
    }
  })

  useEffect(() => {
    if (latest.data) reset(latest.data)
  }, [latest.data, reset])

  return (
    <div className="pb-6">
      <PageHeader
        subtitle={t('assessment.subtitle')}
        title={t('assessment.title')}
      />
      <SafetyNotice>{t('assessment.boundary')}</SafetyNotice>

      {latest.isPending && (
        <div className="kg-card mt-6 p-6 text-sm text-slate-600" role="status">
          {t('assessment.loading')}
        </div>
      )}
      {latest.isError && (
        <div className="mt-6">
          <QueryError retry={() => void latest.refetch()} />
        </div>
      )}
      {!latest.isPending && !latest.isError && (
        <form
          className="kg-card mt-6 max-w-4xl p-5 sm:p-7"
          onSubmit={handleSubmit((values) => saving.mutate(values))}
        >
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
              <ClipboardList aria-hidden="true" size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {t('assessment.formTitle')}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {t('assessment.formBody')}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-7 md:grid-cols-2">
            <RadioQuestion
              error={Boolean(errors.concern_area)}
              field="concern_area"
              legend={t('assessment.concernArea')}
              options={concernAreas}
              register={register}
            />
            <RadioQuestion
              error={Boolean(errors.duration_band)}
              field="duration_band"
              legend={t('assessment.duration')}
              options={durationBands}
              register={register}
            />
            <RadioQuestion
              error={Boolean(errors.daily_impact)}
              field="daily_impact"
              legend={t('assessment.dailyImpact')}
              options={dailyImpacts}
              register={register}
            />
            <RadioQuestion
              error={Boolean(errors.goal)}
              field="goal"
              legend={t('assessment.goal')}
              options={goals}
              register={register}
            />
          </div>

          {saving.isError && (
            <p
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              {t('assessment.saveFailed')}
            </p>
          )}
          {saving.isSuccess && (
            <p
              className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-900"
              role="status"
            >
              {t('assessment.saved')}
            </p>
          )}

          <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              {t('assessment.retention')}
            </p>
            <button
              className="kg-button-primary shrink-0"
              disabled={saving.isPending}
              type="submit"
            >
              <Save aria-hidden="true" size={18} />
              {t(saving.isPending ? 'assessment.saving' : 'assessment.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function RadioQuestion({
  error,
  field,
  legend,
  options,
  register
}: {
  error: boolean
  field: keyof AssessmentInput
  legend: string
  options: readonly string[]
  register: UseFormRegister<AssessmentInput>
}) {
  const { t } = useTranslation()
  const errorID = `${field}-error`
  return (
    <fieldset aria-describedby={error ? errorID : undefined}>
      <legend className="font-bold text-slate-950">{legend}</legend>
      <div className="mt-3 grid gap-2">
        {options.map((option) => (
          <label
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/50 has-[:checked]:border-teal-700 has-[:checked]:bg-teal-50 has-[:checked]:font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-700"
            key={option}
          >
            <input
              className="size-5 accent-teal-700"
              type="radio"
              value={option}
              {...register(field)}
            />
            {t(`assessment.options.${option}`)}
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-700" id={errorID}>
          {t('assessment.required')}
        </p>
      )}
    </fieldset>
  )
}
