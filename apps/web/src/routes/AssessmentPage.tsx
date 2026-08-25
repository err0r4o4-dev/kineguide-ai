import {
  Bot,
  Check,
  ChevronLeft,
  Pencil,
  Send,
  ShieldAlert
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { saveAssessment } from '@/services/product'

type Values = {
  concern_area: string
  duration_band: string
  daily_impact: string
  goal: string
}

type Question = {
  field: keyof Values
  title: string
  options: string[]
  prefix: string
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
  const conversationRef = useRef<HTMLDivElement>(null)
  const questions: Question[] = [
    {
      field: 'concern_area',
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
      field: 'duration_band',
      title: t('assessment.duration'),
      options: ['lt_week', 'one_to_four_weeks', 'gt_four_weeks', 'unsure'],
      prefix: 'assessment.durations'
    },
    {
      field: 'daily_impact',
      title: t('assessment.impact'),
      options: ['none', 'some', 'much', 'prefer_not_to_say'],
      prefix: 'assessment.impacts'
    },
    {
      field: 'goal',
      title: t('assessment.goal'),
      options: ['understand', 'camera_demo', 'track_activity'],
      prefix: 'assessment.goals'
    }
  ]
  const reviewing = step === questions.length
  const current = questions[step]
  const progress = reviewing ? 100 : ((step + 1) / questions.length) * 100

  useEffect(() => {
    const conversation = conversationRef.current
    if (conversation) conversation.scrollTop = conversation.scrollHeight
  }, [step])

  const answerLabel = (question: Question) =>
    t(`${question.prefix}.${values[question.field]}`)

  const finish = async () => {
    setSaving(true)
    setError('')
    try {
      await saveAssessment(values as Parameters<typeof saveAssessment>[0])
      navigate('/app/plan', { replace: true, state: { assessmentSaved: true } })
    } catch {
      setError(t('assessment.failed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="text-center">
        <p className="font-semibold text-teal-700">KineGuide AI</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
          {t('assessment.title')}
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-slate-600">
          {t('assessment.subtitle')}
        </p>
      </header>

      <div className="mx-auto mt-7 max-w-3xl">
        <div
          aria-label={
            reviewing
              ? t('assessment.reviewProgress')
              : t('assessment.progress', {
                  current: step + 1,
                  total: questions.length
                })
          }
          aria-valuemax={questions.length}
          aria-valuemin={1}
          aria-valuenow={reviewing ? questions.length : step + 1}
          className="h-2 overflow-hidden rounded-full bg-teal-100"
          role="progressbar"
        >
          <div
            className="h-full bg-teal-700 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>{t('assessment.start')}</span>
          <span>{t('assessment.summary')}</span>
        </div>
      </div>

      {!reviewing ? (
        <section
          aria-label={t('assessment.conversation')}
          className="mx-auto mt-8 max-w-3xl border-y border-slate-200 py-8"
        >
          <div
            className="max-h-[30rem] space-y-5 overflow-y-auto px-1 pb-2"
            ref={conversationRef}
          >
            {questions.slice(0, step).map((question) => (
              <div className="space-y-3" key={question.field}>
                <AssistantMessage text={question.title} />
                <UserMessage text={answerLabel(question)} />
              </div>
            ))}
            <AssistantMessage
              text={
                step === 0
                  ? `${t('assessment.welcome')} ${current.title}`
                  : current.title
              }
              current
            />
          </div>

          <fieldset className="ml-0 mt-7 grid gap-3 sm:ml-12 sm:grid-cols-2">
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

          <div className="mt-7 flex flex-wrap justify-between gap-3 sm:ml-12">
            <button
              className="kg-button-secondary"
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              type="button"
            >
              <ChevronLeft aria-hidden="true" />
              {t('common.back')}
            </button>
            <button
              className="kg-button-primary"
              disabled={!values[current.field]}
              onClick={() => setStep((value) => value + 1)}
              type="button"
            >
              <Send aria-hidden="true" size={18} />
              {step === questions.length - 1
                ? t('assessment.reviewAnswers')
                : t('assessment.sendAnswer')}
            </button>
          </div>
        </section>
      ) : (
        <section className="kg-card mx-auto mt-8 max-w-3xl p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-700 text-white">
              <Check aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl font-bold">
                {t('assessment.reviewTitle')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t('assessment.reviewBody')}
              </p>
            </div>
          </div>
          <dl className="mt-7 divide-y divide-slate-200">
            {questions.map((question, index) => (
              <div
                className="grid gap-2 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
                key={question.field}
              >
                <dt className="text-sm text-slate-500">{question.title}</dt>
                <dd className="font-semibold text-slate-900">
                  {answerLabel(question)}
                </dd>
                <dd>
                  <button
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                    onClick={() => setStep(index)}
                    type="button"
                  >
                    <Pencil aria-hidden="true" size={17} />
                    {t('assessment.edit')}
                  </button>
                </dd>
              </div>
            ))}
          </dl>
          {error && (
            <p className="kg-alert-danger mt-5" role="alert">
              {error}
            </p>
          )}
          <div className="mt-7 flex flex-wrap justify-between gap-3">
            <button
              className="kg-button-secondary"
              onClick={() => setStep(questions.length - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" />
              {t('common.back')}
            </button>
            <button
              className="kg-button-primary"
              disabled={saving}
              onClick={() => void finish()}
              type="button"
            >
              {saving ? t('common.loading') : t('assessment.saveAndViewPlan')}
            </button>
          </div>
        </section>
      )}

      <p className="mx-auto mt-6 flex max-w-3xl items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={19} />
        {t('assessment.safety')}
      </p>
    </div>
  )
}

function AssistantMessage({
  text,
  current = false
}: {
  text: string
  current?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-700 text-white">
        <Bot aria-hidden="true" size={18} />
      </span>
      <p
        aria-live={current ? 'polite' : undefined}
        className="max-w-xl rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-5 py-4 leading-7 shadow-sm"
      >
        {text}
      </p>
    </div>
  )
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-lg rounded-2xl rounded-tr-sm bg-teal-700 px-5 py-3 font-medium text-white">
        {text}
      </p>
    </div>
  )
}
