import { Bot, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { saveAssessment } from '@/services/product'

type Values = {
  concern_area: string
  duration_band: string
  daily_impact: string
  goal: string
}

export function AssessmentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Values>({
    concern_area: '',
    duration_band: '',
    daily_impact: '',
    goal: ''
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const questions = [
    {
      field: 'concern_area' as const,
      title: t('assessment.area'),
      options: [
        'lower_back',
        'knee',
        'shoulder',
        'general_mobility',
        'prefer_not_to_say'
      ],
      prefix: 'assessment.areas'
    },
    {
      field: 'duration_band' as const,
      title: t('assessment.duration'),
      options: ['lt_week', 'one_to_four_weeks', 'gt_four_weeks', 'unsure'],
      prefix: 'assessment.durations'
    },
    {
      field: 'daily_impact' as const,
      title: t('assessment.impact'),
      options: ['none', 'some', 'much', 'prefer_not_to_say'],
      prefix: 'assessment.impacts'
    },
    {
      field: 'goal' as const,
      title: t('assessment.goal'),
      options: ['understand', 'camera_demo', 'track_activity'],
      prefix: 'assessment.goals'
    }
  ]
  const current = questions[step]
  const finish = async () => {
    setSaving(true)
    setError('')
    try {
      await saveAssessment(values as Parameters<typeof saveAssessment>[0])
      navigate('/app', { replace: true, state: { assessmentSaved: true } })
    } catch {
      setError(t('assessment.failed'))
    } finally {
      setSaving(false)
    }
  }
  return (
    <div>
      <header>
        <p className="font-semibold text-teal-700">KineGuide AI</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
          {t('assessment.title')}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          {t('assessment.subtitle')}
        </p>
      </header>
      <div
        aria-label={t('assessment.progress', {
          current: step + 1,
          total: questions.length
        })}
        className="mt-6 h-2 overflow-hidden rounded-full bg-indigo-100"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={questions.length}
        aria-valuenow={step + 1}
      >
        <div
          className="h-full bg-blue-600 transition-[width]"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {t('assessment.progress', {
          current: step + 1,
          total: questions.length
        })}
      </p>
      <section className="kg-card mx-auto mt-8 max-w-3xl p-6 sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-teal-700 text-white">
            <Bot aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold">{current.title}</h2>
        </div>
        <fieldset className="mt-7 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">{current.title}</legend>
          {current.options.map((option) => (
            <label
              className={`kg-choice ${values[current.field] === option ? 'kg-choice-selected' : ''}`}
              key={option}
            >
              <input
                checked={values[current.field] === option}
                name={current.field}
                onChange={() =>
                  setValues((old) => ({ ...old, [current.field]: option }))
                }
                type="radio"
              />
              <span>{t(`${current.prefix}.${option}`)}</span>
            </label>
          ))}
        </fieldset>
        {error && (
          <p className="kg-alert-danger mt-5" role="alert">
            {error}
          </p>
        )}
        <div className="mt-8 flex justify-between gap-3">
          <button
            className="kg-button-secondary"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" />
            {t('common.back')}
          </button>
          {step < questions.length - 1 ? (
            <button
              className="kg-button-primary"
              disabled={!values[current.field]}
              onClick={() => setStep((value) => value + 1)}
              type="button"
            >
              {t('common.continue')}
              <ChevronRight aria-hidden="true" />
            </button>
          ) : (
            <button
              className="kg-button-primary"
              disabled={!values[current.field] || saving}
              onClick={() => void finish()}
              type="button"
            >
              {saving ? t('common.loading') : t('assessment.submit')}
            </button>
          )}
        </div>
      </section>
      <p className="mx-auto mt-6 flex max-w-3xl items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={19} />
        {t('assessment.safety')}
      </p>
    </div>
  )
}
