import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Target,
  UserRound
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { z } from 'zod'

import { LanguageButton } from '@/components/LanguageButton'
import { QueryError } from '@/components/QueryState'
import {
  getHealthProfile,
  saveHealthProfile,
  type HealthProfileInput
} from '@/services/product'

const schema = z
  .object({
    birth_date: z
      .string()
      .min(1)
      .refine((value) => {
        const date = new Date(`${value}T00:00:00`)
        return !Number.isNaN(date.getTime()) && date <= new Date()
      }),
    sex: z.enum(['female', 'male', 'unspecified']),
    height_cm: z.number().positive().max(300),
    weight_kg: z.number().positive().max(500),
    track_weight: z.boolean(),
    care_areas: z
      .array(
        z.enum([
          'lower_back',
          'knee',
          'shoulder',
          'general_mobility',
          'prefer_not_to_say'
        ])
      )
      .min(1),
    recent_injury: z.boolean(),
    clinician_managed: z.boolean(),
    assistive_device: z.enum(['none', 'cane', 'walker', 'wheelchair', 'other']),
    warning_signs: z
      .array(
        z.enum([
          'chest_pain',
          'shortness_of_breath',
          'dizziness_or_fainting',
          'weakness_or_severe_fatigue',
          'severe_pain',
          'none'
        ])
      )
      .min(1),
    goals: z
      .array(
        z.enum([
          'strength',
          'balance_fall_prevention',
          'flexibility',
          'daily_activity',
          'progress'
        ])
      )
      .min(1),
    activity_level: z.enum(['low', 'moderate', 'regular']),
    preferred_time: z.enum(['morning', 'afternoon', 'evening']),
    equipment: z
      .array(z.enum(['chair', 'mat', 'resistance_band', 'none']))
      .min(1),
    camera_preference: z.enum(['front', 'rear']),
    activity_notifications: z.boolean(),
    notes: z.string().max(300),
    profile_storage_consent: z.boolean(),
    information_acknowledged: z.boolean()
  })
  .refine(
    (data) =>
      !data.warning_signs.includes('none') || data.warning_signs.length === 1,
    { path: ['warning_signs'] }
  )
  .refine(
    (data) => !data.equipment.includes('none') || data.equipment.length === 1,
    { path: ['equipment'] }
  )
  .refine((data) => data.profile_storage_consent, {
    path: ['profile_storage_consent']
  })
  .refine((data) => data.information_acknowledged, {
    path: ['information_acknowledged']
  })

type FormValues = z.infer<typeof schema>

const stepFields: Record<1 | 2 | 3, (keyof FormValues)[]> = {
  1: ['birth_date', 'sex', 'height_cm', 'weight_kg'],
  2: [
    'care_areas',
    'recent_injury',
    'clinician_managed',
    'assistive_device',
    'warning_signs'
  ],
  3: [
    'goals',
    'activity_level',
    'preferred_time',
    'equipment',
    'camera_preference'
  ]
}

const careAreas = [
  'lower_back',
  'knee',
  'shoulder',
  'general_mobility',
  'prefer_not_to_say'
] as const
const warningSigns = [
  'chest_pain',
  'shortness_of_breath',
  'dizziness_or_fainting',
  'weakness_or_severe_fatigue',
  'severe_pain',
  'none'
] as const
const goals = [
  'strength',
  'balance_fall_prevention',
  'flexibility',
  'daily_activity',
  'progress'
] as const
const equipment = ['chair', 'mat', 'resistance_band', 'none'] as const

function ageFromBirthDate(value: string) {
  if (!value) return null
  const birth = new Date(`${value}T00:00:00`)
  if (Number.isNaN(birth.getTime()) || birth > new Date()) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age -= 1
  }
  return age
}

function ChoiceError({ show, text }: { show: boolean; text: string }) {
  return show ? (
    <p className="mt-2 text-sm font-medium text-red-700" role="alert">
      {text}
    </p>
  ) : null
}

export function HealthProfileOnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [saveError, setSaveError] = useState('')
  const profile = useQuery({
    queryKey: ['health-profile'],
    queryFn: ({ signal }) => getHealthProfile(signal)
  })
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      track_weight: false,
      care_areas: [],
      warning_signs: [],
      goals: [],
      equipment: [],
      activity_notifications: false,
      notes: '',
      profile_storage_consent: false,
      information_acknowledged: false
    }
  })

  useEffect(() => {
    if (!profile.data) return
    reset({
      ...profile.data,
      profile_storage_consent: false,
      information_acknowledged: false
    })
  }, [profile.data, reset])

  const values = watch()
  const age = useMemo(
    () => ageFromBirthDate(values.birth_date),
    [values.birth_date]
  )
  const bmi =
    values.height_cm > 0 && values.weight_kg > 0
      ? values.weight_kg / (values.height_cm / 100) ** 2
      : null

  const toggleValue = <T extends string>(
    field: 'care_areas' | 'warning_signs' | 'goals' | 'equipment',
    current: T[],
    value: T,
    exclusive?: T
  ) => {
    let next: T[]
    if (current.includes(value)) {
      next = current.filter((item) => item !== value)
    } else if (exclusive && value === exclusive) {
      next = [value]
    } else {
      next = [...current.filter((item) => item !== exclusive), value]
    }
    setValue(field, next as never, { shouldDirty: true, shouldValidate: true })
  }

  const next = async () => {
    if (step === 4) return
    const valid = await trigger(stepFields[step])
    if (valid) setStep((step + 1) as 2 | 3 | 4)
  }

  const submit = async (data: FormValues) => {
    setSaveError('')
    const input: HealthProfileInput = {
      birth_date: data.birth_date,
      sex: data.sex,
      height_cm: data.height_cm,
      weight_kg: data.weight_kg,
      track_weight: data.track_weight,
      care_areas: data.care_areas,
      recent_injury: data.recent_injury,
      clinician_managed: data.clinician_managed,
      assistive_device: data.assistive_device,
      warning_signs: data.warning_signs,
      goals: data.goals,
      activity_level: data.activity_level,
      preferred_time: data.preferred_time,
      equipment: data.equipment,
      camera_preference: data.camera_preference,
      activity_notifications: data.activity_notifications,
      notes: data.notes,
      profile_storage_consent: true
    }
    try {
      const saved = await saveHealthProfile(input)
      queryClient.setQueryData(['health-profile'], saved)
      const destination =
        typeof location.state === 'object' &&
        location.state &&
        'from' in location.state &&
        typeof location.state.from === 'string'
          ? location.state.from
          : '/app'
      navigate(destination === '/onboarding' ? '/app' : destination, {
        replace: true
      })
    } catch {
      setSaveError(t('healthProfile.saveFailed'))
    }
  }

  if (profile.isPending) {
    return <main className="min-h-screen bg-kg-canvas" aria-busy="true" />
  }

  if (profile.isError) {
    return (
      <main className="grid min-h-screen place-items-center bg-kg-canvas px-4">
        <QueryError retry={() => void profile.refetch()} />
      </main>
    )
  }

  const steps = [
    t('healthProfile.steps.basics'),
    t('healthProfile.steps.safety'),
    t('healthProfile.steps.goals'),
    t('healthProfile.steps.review')
  ]

  return (
    <main className="min-h-screen bg-kg-canvas px-3 py-4 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col items-start justify-between gap-4 px-1 min-[480px]:flex-row sm:px-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              {t('healthProfile.title')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {t('healthProfile.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 self-end min-[480px]:self-auto">
            <LanguageButton />
          </div>
        </header>

        <nav aria-label={t('healthProfile.progress')} className="mt-7 sm:mt-9">
          <ol className="grid grid-cols-4">
            {steps.map((label, index) => {
              const number = index + 1
              const complete = number < step
              const current = number === step
              return (
                <li
                  className="relative flex min-w-0 flex-col items-center"
                  key={label}
                >
                  {index > 0 && (
                    <span
                      className={`absolute right-1/2 top-5 h-px w-full ${number <= step ? 'bg-teal-600' : 'bg-slate-300'}`}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 grid size-10 place-items-center rounded-full border text-sm font-bold ${
                      current
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : complete
                          ? 'border-teal-600 bg-white text-teal-700'
                          : 'border-slate-300 bg-white text-slate-500'
                    }`}
                    aria-current={current ? 'step' : undefined}
                  >
                    {complete ? <Check aria-hidden="true" size={20} /> : number}
                  </span>
                  <span
                    className={`mt-2 hidden text-center text-sm font-semibold sm:block ${current ? 'text-teal-700' : 'text-slate-600'}`}
                  >
                    {label}
                  </span>
                </li>
              )
            })}
          </ol>
          <p className="mt-2 text-center text-sm font-semibold text-teal-700 sm:hidden">
            {step}. {steps[step - 1]}
          </p>
        </nav>

        <form
          className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-8 sm:rounded-3xl"
          onSubmit={handleSubmit(submit)}
        >
          <div className="p-4 sm:p-7 lg:p-9">
            {step === 1 && (
              <section aria-labelledby="profile-step-title">
                <StepHeading
                  icon={CalendarDays}
                  title={t('healthProfile.basics.title')}
                  body={t('healthProfile.basics.body')}
                />
                <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="grid gap-5">
                    <label className="grid gap-2 font-semibold">
                      {t('healthProfile.basics.birthDate')}
                      <input
                        className="kg-input"
                        max={new Date().toISOString().slice(0, 10)}
                        type="date"
                        {...register('birth_date')}
                      />
                      <ChoiceError
                        show={Boolean(errors.birth_date)}
                        text={t('healthProfile.validation.required')}
                      />
                    </label>
                    <fieldset>
                      <legend className="font-semibold">
                        {t('healthProfile.basics.sex')}
                      </legend>
                      <p className="mt-1 text-sm text-slate-500">
                        {t('healthProfile.optional')}
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {(['female', 'male', 'unspecified'] as const).map(
                          (value) => (
                            <RadioCard
                              checked={values.sex === value}
                              key={value}
                              label={t(`healthProfile.options.${value}`)}
                              name="sex"
                              onChange={() =>
                                setValue('sex', value, { shouldValidate: true })
                              }
                            />
                          )
                        )}
                      </div>
                      <ChoiceError
                        show={Boolean(errors.sex)}
                        text={t('healthProfile.validation.required')}
                      />
                    </fieldset>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <NumberField
                        error={Boolean(errors.height_cm)}
                        label={t('healthProfile.basics.height')}
                        unit={t('healthProfile.units.cm')}
                        register={register('height_cm', {
                          valueAsNumber: true
                        })}
                      />
                      <NumberField
                        error={Boolean(errors.weight_kg)}
                        label={t('healthProfile.basics.weight')}
                        unit={t('healthProfile.units.kg')}
                        register={register('weight_kg', {
                          valueAsNumber: true
                        })}
                      />
                    </div>
                    <label className="kg-check">
                      <input type="checkbox" {...register('track_weight')} />
                      <span>
                        <strong>{t('healthProfile.basics.trackWeight')}</strong>
                        <small>
                          {t('healthProfile.basics.trackWeightBody')}
                        </small>
                      </span>
                    </label>
                  </div>
                  <aside
                    className="rounded-2xl border border-slate-200 p-5"
                    aria-label={t('healthProfile.basics.preview')}
                  >
                    <h3 className="font-bold">
                      {t('healthProfile.basics.preview')}
                    </h3>
                    <PreviewStat
                      icon={UserRound}
                      label={t('healthProfile.basics.age')}
                      value={
                        age === null
                          ? '—'
                          : t('healthProfile.units.yearsValue', { value: age })
                      }
                    />
                    <div className="my-5 border-t border-slate-200" />
                    <PreviewStat
                      icon={Gauge}
                      label="BMI"
                      value={
                        bmi === null || !Number.isFinite(bmi)
                          ? '—'
                          : bmi.toFixed(1)
                      }
                    />
                    <p className="mt-6 text-xs leading-5 text-slate-500">
                      {t('healthProfile.basics.previewNotice')}
                    </p>
                  </aside>
                </div>
              </section>
            )}

            {step === 2 && (
              <section aria-labelledby="profile-step-title">
                <StepHeading
                  icon={ShieldCheck}
                  title={t('healthProfile.safety.title')}
                  body={t('healthProfile.safety.body')}
                />
                <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_22rem]">
                  <div className="grid gap-6">
                    <CheckboxGroup
                      error={Boolean(errors.care_areas)}
                      label={t('healthProfile.safety.careAreas')}
                      options={careAreas}
                      selected={values.care_areas ?? []}
                      onToggle={(value) =>
                        toggleValue(
                          'care_areas',
                          values.care_areas ?? [],
                          value
                        )
                      }
                      t={t}
                    />
                    <BooleanGroup
                      label={t('healthProfile.safety.recentInjury')}
                      value={values.recent_injury}
                      error={Boolean(errors.recent_injury)}
                      onChange={(value) =>
                        setValue('recent_injury', value, {
                          shouldValidate: true
                        })
                      }
                      t={t}
                    />
                    <BooleanGroup
                      label={t('healthProfile.safety.clinicianManaged')}
                      value={values.clinician_managed}
                      error={Boolean(errors.clinician_managed)}
                      onChange={(value) =>
                        setValue('clinician_managed', value, {
                          shouldValidate: true
                        })
                      }
                      t={t}
                    />
                    <label className="grid gap-2 font-semibold">
                      {t('healthProfile.safety.assistiveDevice')}
                      <select
                        className="kg-input"
                        defaultValue=""
                        {...register('assistive_device')}
                      >
                        <option disabled value="">
                          {t('healthProfile.select')}
                        </option>
                        {(
                          [
                            'none',
                            'cane',
                            'walker',
                            'wheelchair',
                            'other'
                          ] as const
                        ).map((value) => (
                          <option key={value} value={value}>
                            {t(`healthProfile.options.${value}`)}
                          </option>
                        ))}
                      </select>
                      <ChoiceError
                        show={Boolean(errors.assistive_device)}
                        text={t('healthProfile.validation.required')}
                      />
                    </label>
                  </div>
                  <aside className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
                    <h3 className="flex items-center gap-2 font-bold text-rose-800">
                      <ShieldCheck aria-hidden="true" size={20} />
                      {t('healthProfile.safety.warningTitle')}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {t('healthProfile.safety.warningBody')}
                    </p>
                    <div className="mt-4 grid gap-2">
                      {warningSigns.map((value) => (
                        <CheckCard
                          checked={(values.warning_signs ?? []).includes(value)}
                          key={value}
                          label={t(`healthProfile.options.${value}`)}
                          onChange={() =>
                            toggleValue(
                              'warning_signs',
                              values.warning_signs ?? [],
                              value,
                              'none'
                            )
                          }
                        />
                      ))}
                    </div>
                    <ChoiceError
                      show={Boolean(errors.warning_signs)}
                      text={t('healthProfile.validation.required')}
                    />
                    <p className="mt-4 text-xs leading-5 text-rose-800">
                      {t('healthProfile.safety.notEvaluated')}
                    </p>
                  </aside>
                </div>
              </section>
            )}

            {step === 3 && (
              <section aria-labelledby="profile-step-title">
                <StepHeading
                  icon={Target}
                  title={t('healthProfile.goals.title')}
                  body={t('healthProfile.goals.body')}
                />
                <div className="mt-7 grid gap-6">
                  <CheckboxGroup
                    error={Boolean(errors.goals)}
                    label={t('healthProfile.goals.yourGoals')}
                    options={goals}
                    selected={values.goals ?? []}
                    onToggle={(value) =>
                      toggleValue('goals', values.goals ?? [], value)
                    }
                    t={t}
                    columns="lg:grid-cols-5"
                  />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <RadioGroup
                      label={t('healthProfile.goals.activityLevel')}
                      values={['low', 'moderate', 'regular']}
                      selected={values.activity_level}
                      error={Boolean(errors.activity_level)}
                      onChange={(value) =>
                        setValue(
                          'activity_level',
                          value as FormValues['activity_level'],
                          { shouldValidate: true }
                        )
                      }
                      t={t}
                    />
                    <RadioGroup
                      label={t('healthProfile.goals.preferredTime')}
                      values={['morning', 'afternoon', 'evening']}
                      selected={values.preferred_time}
                      error={Boolean(errors.preferred_time)}
                      onChange={(value) =>
                        setValue(
                          'preferred_time',
                          value as FormValues['preferred_time'],
                          { shouldValidate: true }
                        )
                      }
                      t={t}
                    />
                  </div>
                  <CheckboxGroup
                    error={Boolean(errors.equipment)}
                    label={t('healthProfile.goals.equipment')}
                    options={equipment}
                    selected={values.equipment ?? []}
                    onToggle={(value) =>
                      toggleValue(
                        'equipment',
                        values.equipment ?? [],
                        value,
                        'none'
                      )
                    }
                    t={t}
                    columns="sm:grid-cols-4"
                  />
                  <RadioGroup
                    label={t('healthProfile.goals.camera')}
                    values={['front', 'rear']}
                    selected={values.camera_preference}
                    error={Boolean(errors.camera_preference)}
                    onChange={(value) =>
                      setValue(
                        'camera_preference',
                        value as FormValues['camera_preference'],
                        { shouldValidate: true }
                      )
                    }
                    t={t}
                  />
                  <label className="grid gap-2 font-semibold">
                    {t('healthProfile.goals.notes')}{' '}
                    <span className="text-sm font-normal text-slate-500">
                      {t('healthProfile.optional')}
                    </span>
                    <textarea
                      className="kg-input min-h-24 resize-y"
                      maxLength={300}
                      placeholder={t('healthProfile.goals.notesPlaceholder')}
                      {...register('notes')}
                    />
                    <span className="text-right text-xs font-normal text-slate-500">
                      {(values.notes ?? '').length} / 300
                    </span>
                  </label>
                </div>
              </section>
            )}

            {step === 4 && (
              <section aria-labelledby="profile-step-title">
                <StepHeading
                  icon={Check}
                  title={t('healthProfile.review.title')}
                  body={t('healthProfile.review.body')}
                />
                <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.85fr)]">
                  <div className="grid gap-4">
                    <SummaryCard
                      icon={CalendarDays}
                      title={t('healthProfile.steps.basics')}
                      lines={[
                        `${t('healthProfile.basics.birthDate')}: ${values.birth_date || '—'}`,
                        `${t('healthProfile.basics.height')}: ${values.height_cm || '—'} ${t('healthProfile.units.cm')}`,
                        `${t('healthProfile.basics.weight')}: ${values.weight_kg || '—'} ${t('healthProfile.units.kg')}`
                      ]}
                      edit={() => setStep(1)}
                      t={t}
                    />
                    <SummaryCard
                      icon={ShieldCheck}
                      title={t('healthProfile.steps.safety')}
                      lines={[
                        `${t('healthProfile.safety.careAreas')}: ${(values.care_areas ?? []).map((value) => t(`healthProfile.options.${value}`)).join(', ')}`,
                        `${t('healthProfile.safety.assistiveDevice')}: ${values.assistive_device ? t(`healthProfile.options.${values.assistive_device}`) : '—'}`
                      ]}
                      edit={() => setStep(2)}
                      t={t}
                    />
                    <SummaryCard
                      icon={Target}
                      title={t('healthProfile.steps.goals')}
                      lines={[
                        `${t('healthProfile.goals.yourGoals')}: ${(values.goals ?? []).map((value) => t(`healthProfile.options.${value}`)).join(', ')}`,
                        `${t('healthProfile.goals.equipment')}: ${(values.equipment ?? []).map((value) => t(`healthProfile.options.${value}`)).join(', ')}`
                      ]}
                      edit={() => setStep(3)}
                      t={t}
                    />
                  </div>
                  <aside className="overflow-hidden rounded-2xl border border-teal-200">
                    <h3 className="flex items-center gap-2 bg-teal-700 px-5 py-4 font-bold text-white">
                      <LockKeyhole aria-hidden="true" size={20} />
                      {t('healthProfile.review.consentTitle')}
                    </h3>
                    <div className="grid gap-5 p-5">
                      <label className="kg-check">
                        <input
                          type="checkbox"
                          {...register('profile_storage_consent')}
                        />
                        <span>
                          <strong>
                            {t('healthProfile.review.storageConsent')}
                          </strong>
                          <small>{t('healthProfile.review.retention')}</small>
                        </span>
                      </label>
                      <label className="kg-check">
                        <input
                          type="checkbox"
                          {...register('information_acknowledged')}
                        />
                        <span>
                          <strong>
                            {t('healthProfile.review.noDiagnosisConsent')}
                          </strong>
                          <small>
                            {t('healthProfile.review.noPersonalization')}
                          </small>
                        </span>
                      </label>
                      <ChoiceError
                        show={Boolean(
                          errors.profile_storage_consent ||
                          errors.information_acknowledged
                        )}
                        text={t('healthProfile.validation.consent')}
                      />
                      <div className="border-t border-slate-200 pt-5">
                        <label className="kg-check">
                          <input
                            type="checkbox"
                            {...register('activity_notifications')}
                          />
                          <span>
                            <strong>
                              {t('healthProfile.review.notifications')}
                            </strong>
                            <small>
                              {t('healthProfile.review.notificationsBody')}
                            </small>
                          </span>
                        </label>
                      </div>
                    </div>
                  </aside>
                </div>
                {saveError && (
                  <p className="kg-alert-danger mt-5" role="alert">
                    {saveError}
                  </p>
                )}
              </section>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:justify-end sm:px-7 sm:py-5">
            {step === 1 ? (
              <button
                className="kg-button-secondary"
                onClick={() => navigate('/')}
                type="button"
              >
                {t('common.cancel')}
              </button>
            ) : (
              <button
                className="kg-button-secondary"
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={18} />
                {t('common.back')}
              </button>
            )}
            {step < 4 ? (
              <button
                className="kg-button-primary"
                onClick={() => void next()}
                type="button"
              >
                {step === 3
                  ? t('healthProfile.reviewData')
                  : t('common.continue')}
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            ) : (
              <button
                className="kg-button-primary"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? t('common.loading')
                  : t('healthProfile.saveProfile')}
              </button>
            )}
          </footer>
        </form>
        <p className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-teal-50/70 px-4 py-3 text-center text-xs text-slate-600">
          <LockKeyhole aria-hidden="true" className="text-teal-700" size={16} />
          {t('healthProfile.privateFooter')}
        </p>
      </div>
    </main>
  )
}

type Translate = ReturnType<typeof useTranslation>['t']

function StepHeading({
  icon: Icon,
  title,
  body
}: {
  icon: typeof Activity
  title: string
  body: string
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
        <Icon aria-hidden="true" size={21} />
      </span>
      <div>
        <h2 className="text-xl font-bold sm:text-2xl" id="profile-step-title">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
      </div>
    </div>
  )
}

function RadioCard({
  checked,
  label,
  name,
  onChange
}: {
  checked: boolean
  label: string
  name: string
  onChange(): void
}) {
  return (
    <label className={`kg-choice ${checked ? 'kg-choice-selected' : ''}`}>
      <input checked={checked} name={name} onChange={onChange} type="radio" />
      <span className="font-semibold">{label}</span>
    </label>
  )
}

function CheckCard({
  checked,
  label,
  onChange
}: {
  checked: boolean
  label: string
  onChange(): void
}) {
  return (
    <label
      className={`kg-choice min-h-12 px-3 py-2 ${checked ? 'kg-choice-selected' : ''}`}
    >
      <input checked={checked} onChange={onChange} type="checkbox" />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  )
}

function CheckboxGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
  error,
  t,
  columns = 'sm:grid-cols-2'
}: {
  label: string
  options: readonly T[]
  selected: T[]
  onToggle(value: T): void
  error: boolean
  t: Translate
  columns?: string
}) {
  return (
    <fieldset>
      <legend className="font-semibold">{label}</legend>
      <div className={`mt-3 grid gap-2 ${columns}`}>
        {options.map((value) => (
          <CheckCard
            checked={selected.includes(value)}
            key={value}
            label={t(`healthProfile.options.${value}`)}
            onChange={() => onToggle(value)}
          />
        ))}
      </div>
      <ChoiceError show={error} text={t('healthProfile.validation.required')} />
    </fieldset>
  )
}

function BooleanGroup({
  label,
  value,
  onChange,
  error,
  t
}: {
  label: string
  value: boolean | undefined
  onChange(value: boolean): void
  error: boolean
  t: Translate
}) {
  return (
    <fieldset>
      <legend className="font-semibold">{label}</legend>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <RadioCard
          checked={value === false}
          label={t('common.no')}
          name={label}
          onChange={() => onChange(false)}
        />
        <RadioCard
          checked={value === true}
          label={t('common.yes')}
          name={label}
          onChange={() => onChange(true)}
        />
      </div>
      <ChoiceError show={error} text={t('healthProfile.validation.required')} />
    </fieldset>
  )
}

function RadioGroup({
  label,
  values,
  selected,
  onChange,
  error,
  t
}: {
  label: string
  values: readonly string[]
  selected?: string
  onChange(value: string): void
  error: boolean
  t: Translate
}) {
  return (
    <fieldset>
      <legend className="font-semibold">{label}</legend>
      <div
        className={`mt-3 grid gap-2 ${values.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}
      >
        {values.map((value) => (
          <RadioCard
            checked={selected === value}
            key={value}
            label={t(`healthProfile.options.${value}`)}
            name={label}
            onChange={() => onChange(value)}
          />
        ))}
      </div>
      <ChoiceError show={error} text={t('healthProfile.validation.required')} />
    </fieldset>
  )
}

function NumberField({
  label,
  unit,
  error,
  register
}: {
  label: string
  unit: string
  error: boolean
  register: ReturnType<ReturnType<typeof useForm<FormValues>>['register']>
}) {
  const { t } = useTranslation()
  return (
    <label className="grid gap-2 font-semibold">
      {label}
      <span className="flex">
        <input
          className="kg-input rounded-r-none"
          inputMode="decimal"
          min="0.1"
          step="0.1"
          type="number"
          {...register}
        />
        <span className="grid min-w-14 place-items-center rounded-r-xl border border-l-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-600">
          {unit}
        </span>
      </span>
      <ChoiceError show={error} text={t('healthProfile.validation.required')} />
    </label>
  )
}

function PreviewStat({
  icon: Icon,
  label,
  value
}: {
  icon: typeof UserRound
  label: string
  value: string
}) {
  return (
    <div className="mt-5 flex items-center gap-4">
      <span className="grid size-14 place-items-center rounded-full bg-teal-50 text-teal-700">
        <Icon aria-hidden="true" size={28} />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  title,
  lines,
  edit,
  t
}: {
  icon: typeof Dumbbell
  title: string
  lines: string[]
  edit(): void
  t: Translate
}) {
  return (
    <article className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-bold">
          <Icon aria-hidden="true" className="text-teal-700" size={20} />
          {title}
        </h3>
        <button
          className="min-h-11 rounded-lg px-3 text-sm font-semibold text-teal-700 hover:bg-teal-50"
          onClick={edit}
          type="button"
        >
          {t('healthProfile.review.edit')}
        </button>
      </div>
      <ul className="mt-3 grid gap-1 text-sm leading-6 text-slate-600">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </article>
  )
}
