import { useMutation } from '@tanstack/react-query'
import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  Loader2,
  MonitorOff,
  PersonStanding,
  ScanLine,
  Shirt,
  Smartphone,
  UserRoundX
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { SafetyNotice } from '@/components/SafetyNotice'
import { useCamera } from '@/features/camera/useCamera'
import { createSession } from '@/services/product'

export function CameraSetupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const camera = useCamera()
  const [permissionStep, setPermissionStep] = useState(true)
  const [seatedSetupConfirmed, setSeatedSetupConfirmed] = useState(false)

  const startSession = useMutation({
    mutationFn: async () => {
      return createSession({ camera_used: true })
    },
    onSuccess: (session) => {
      navigate(`/app/sessions/${session.id}/live`)
    }
  })

  const startCameraCheck = () => {
    if (!seatedSetupConfirmed) return
    setPermissionStep(false)
    void camera.start()
  }

  return (
    <div className="w-full pb-4" data-testid="camera-setup-content">
      <CameraSetupHeader currentStep={permissionStep ? 1 : 2} />

      {permissionStep ? (
        <section
          aria-labelledby="camera-processing-title"
          className="mt-7 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_22px_60px_rgb(15_118_110_/_0.10)] backdrop-blur-sm sm:mt-9 xl:grid xl:min-h-[33rem] xl:grid-cols-[minmax(0,1.05fr)_minmax(23rem,0.95fr)]"
        >
          <CameraSetupIllustration />
          <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-12">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-100 sm:size-24">
              <Camera aria-hidden="true" size={42} strokeWidth={1.8} />
            </span>
            <div className="mt-5 text-center">
              <h2
                className="text-2xl font-bold tracking-[-0.025em] text-slate-950 sm:text-[1.75rem]"
                id="camera-processing-title"
              >
                {t('monitor.processingTitle')}
              </h2>
              <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
                {t('monitor.processingBody')}
              </p>
            </div>

            <div className="mt-7 flex w-full items-start gap-3 rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/70 p-4 text-left sm:p-5">
              <input
                aria-describedby="seated-mode-description"
                checked={seatedSetupConfirmed}
                className="mt-0.5 size-5 shrink-0 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                id="seated-mode-confirmation"
                onChange={(event) =>
                  setSeatedSetupConfirmed(event.target.checked)
                }
                type="checkbox"
              />
              <div>
                <label
                  className="cursor-pointer text-sm font-bold leading-6 text-slate-900 sm:text-base"
                  htmlFor="seated-mode-confirmation"
                >
                  {t('monitor.seatedConfirmation')}
                </label>
                <p
                  className="mt-1 text-sm leading-6 text-slate-600"
                  id="seated-mode-description"
                >
                  {t('monitor.seatedConfirmationBody')}
                </p>
              </div>
            </div>

            <button
              className="ui-transition pressable mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-teal-700 bg-gradient-to-r from-teal-600 to-teal-700 px-5 font-bold text-white shadow-[0_14px_30px_rgb(15_118_110_/_0.22)] hover:from-teal-700 hover:to-teal-800"
              disabled={!seatedSetupConfirmed}
              onClick={startCameraCheck}
              type="button"
            >
              <Camera aria-hidden="true" size={21} />
              {t('monitor.start')}
              <ArrowRight aria-hidden="true" className="ml-auto" size={21} />
            </button>
          </div>
        </section>
      ) : (
        <CameraReadinessPanel
          camera={camera}
          isPending={startSession.isPending}
          isError={startSession.isError}
          onContinue={() => startSession.mutate()}
        />
      )}

      <SetupTips />
      <SafetyNotice className="mt-7">{t('common.noDiagnosis')}</SafetyNotice>
    </div>
  )
}

function CameraSetupHeader({ currentStep }: { currentStep: 1 | 2 }) {
  const { t } = useTranslation()
  const steps = [
    t('monitor.stepSetup'),
    t('monitor.stepCheck'),
    t('monitor.stepStart')
  ]

  return (
    <header className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(30rem,0.72fr)] xl:items-center">
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
          {t('monitor.eyebrow')}
        </p>
        <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-[2.6rem] lg:text-[3rem]">
          {t('monitor.setupTitle')}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          {t('monitor.setupSubtitle')}
        </p>
      </div>

      <nav aria-label={t('monitor.stepsLabel')}>
        <ol className="flex items-start">
          {steps.map((label, index) => {
            const number = index + 1
            const isCurrent = number === currentStep
            const isComplete = number < currentStep

            return (
              <li
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={t('monitor.stepItemLabel', { number, label })}
                className="relative flex min-w-0 flex-1 flex-col items-center text-center after:absolute after:left-[calc(50%+1.25rem)] after:right-[calc(-50%+1.25rem)] after:top-4 after:border-t after:border-dashed after:border-slate-300 after:content-[''] last:after:hidden"
                key={label}
              >
                <span
                  className={`relative z-10 grid size-8 place-items-center rounded-full text-sm font-bold ring-4 ring-kg-canvas ${isCurrent ? 'bg-teal-700 text-white shadow-[0_5px_14px_rgb(15_118_110_/_0.25)]' : isComplete ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'}`}
                >
                  {isComplete ? <Check aria-hidden="true" size={17} /> : number}
                </span>
                <span
                  className={`mt-2 text-xs leading-5 sm:text-sm ${isCurrent ? 'font-bold text-teal-800' : 'font-medium text-slate-500'}`}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      </nav>
    </header>
  )
}

function CameraSetupIllustration() {
  const { t } = useTranslation()
  const frameChecks = [
    t('monitor.frameHead'),
    t('monitor.frameUpperBody'),
    t('monitor.frameLowerBody')
  ]

  return (
    <div
      aria-hidden="true"
      className="relative isolate flex min-h-[25rem] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_14%_18%,rgb(204_251_241_/_0.95),transparent_35%),linear-gradient(145deg,#f8fffe_0%,#e8f5f2_48%,#f8fafc_100%)] px-5 py-9 sm:min-h-[30rem] sm:px-8 xl:min-h-full"
    >
      <div className="absolute -left-20 -top-24 size-64 rounded-full bg-white/55" />
      <div className="absolute -bottom-36 -right-20 size-80 rounded-full border border-white/70 bg-teal-100/45" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/50 to-transparent" />

      <div className="relative flex w-full max-w-xl items-center justify-center">
        <div className="relative mb-12 h-[19rem] w-[10.5rem] rounded-[2rem] border-[0.55rem] border-slate-800 bg-slate-900 shadow-[0_26px_55px_rgb(15_23_42_/_0.24)] sm:h-[22rem] sm:w-[12rem]">
          <span className="absolute left-1/2 top-1.5 h-4 w-16 -translate-x-1/2 rounded-full bg-slate-800" />
          <div className="absolute inset-[0.35rem] overflow-hidden rounded-[1.35rem] bg-gradient-to-b from-white via-teal-50 to-cyan-50">
            <div className="absolute inset-0 bg-[linear-gradient(rgb(15_118_110_/_0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(15_118_110_/_0.06)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            <ScanLine
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400/90"
              size={138}
              strokeWidth={1.4}
            />
            <PersonStanding
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-700/55"
              size={110}
              strokeWidth={1.45}
            />
          </div>
          <span className="absolute -bottom-16 left-1/2 h-16 w-2.5 -translate-x-1/2 rounded-full bg-slate-700" />
          <span className="absolute -bottom-[4.35rem] left-1/2 h-2.5 w-24 -translate-x-1/2 rounded-full bg-slate-700" />
          <span className="absolute -bottom-[5rem] left-[44%] h-2.5 w-20 origin-right -rotate-[22deg] rounded-full bg-slate-700" />
          <span className="absolute -bottom-[5rem] right-[44%] h-2.5 w-20 origin-left rotate-[22deg] rounded-full bg-slate-700" />
        </div>

        <div className="absolute right-0 top-4 hidden w-44 space-y-6 min-[520px]:block sm:right-3 sm:top-8">
          {frameChecks.map((label) => (
            <div
              className="flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_8px_24px_rgb(15_23_42_/_0.08)] backdrop-blur"
              key={label}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-teal-600 text-white">
                <Check aria-hidden="true" size={15} strokeWidth={3} />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CameraReadinessPanel({
  camera,
  isPending,
  isError,
  onContinue
}: {
  camera: ReturnType<typeof useCamera>
  isPending: boolean
  isError: boolean
  onContinue: () => void
}) {
  const { t } = useTranslation()

  return (
    <section
      aria-labelledby="camera-readiness-title"
      className="mt-7 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_22px_60px_rgb(15_118_110_/_0.10)] backdrop-blur-sm sm:mt-9 xl:grid xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.55fr)]"
    >
      <div className="bg-gradient-to-br from-teal-50 to-slate-50 p-4 sm:p-6">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.4rem] border border-white/80 bg-slate-950 shadow-inner">
          {camera.state === 'ready' && (
            <video
              autoPlay
              className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
              muted
              playsInline
              ref={camera.videoRef}
            />
          )}
          {camera.state === 'requesting' && (
            <CameraState icon={Loader2} label={t('monitor.waiting')} spin />
          )}
          {camera.state === 'denied' && (
            <CameraState icon={MonitorOff} label={t('monitor.denied')} />
          )}
          {camera.state === 'unsupported' && (
            <CameraState icon={CircleAlert} label={t('monitor.unsupported')} />
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-white/85 px-4 py-3 sm:px-5">
          <p className="text-sm font-semibold text-slate-700">
            {t('monitor.secure')}
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
            <CheckCircle2 aria-hidden="true" size={18} />
            {t('common.onDevice')}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-5 sm:p-7 lg:p-8">
        <span className="grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <ScanLine aria-hidden="true" size={28} />
        </span>
        <h2
          className="mt-5 text-2xl font-bold tracking-[-0.025em] text-slate-950"
          id="camera-readiness-title"
        >
          {t('monitor.readiness')}
        </h2>
        <ul className="mt-6 space-y-5">
          <StatusItem
            label={t('monitor.permission')}
            state={
              camera.state === 'ready'
                ? 'good'
                : camera.state === 'denied'
                  ? 'error'
                  : 'pending'
            }
            value={camera.state === 'ready' ? t('monitor.granted') : undefined}
          />
          <StatusItem
            label={t('monitor.visibility')}
            state="pending"
            value={t('monitor.notChecked')}
          />
          <StatusItem
            label={t('monitor.model')}
            state="pending"
            value={t('monitor.modelPending')}
          />
        </ul>

        <div className="mt-auto pt-7">
          <p className="mb-4 text-sm leading-6 text-slate-600">
            {t('monitor.instructions')}
          </p>
          {isError && (
            <p
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900"
              role="alert"
            >
              {t('monitor.startSessionFailed')}
            </p>
          )}
          <button
            className="ui-transition pressable inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-teal-700 bg-gradient-to-r from-teal-600 to-teal-700 px-5 font-bold text-white shadow-[0_14px_30px_rgb(15_118_110_/_0.22)] hover:from-teal-700 hover:to-teal-800"
            disabled={camera.state !== 'ready' || isPending}
            onClick={onContinue}
            type="button"
          >
            {isPending && (
              <Loader2 aria-hidden="true" className="animate-spin" size={18} />
            )}
            {t('monitor.continue')}
            <ArrowRight aria-hidden="true" className="ml-auto" size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}

function CameraState({
  icon: Icon,
  label,
  spin = false
}: {
  icon: LucideIcon
  label: string
  spin?: boolean
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5 text-center text-white/85">
      <Icon
        aria-hidden="true"
        className={spin ? 'animate-spin' : ''}
        size={36}
      />
      <p className="font-semibold">{label}</p>
    </div>
  )
}

function SetupTips() {
  const { t } = useTranslation()
  const tips = [
    {
      icon: Lightbulb,
      title: t('monitor.tipLightTitle'),
      body: t('monitor.tipLightBody'),
      tone: 'border-emerald-100 bg-emerald-50/70 text-emerald-700'
    },
    {
      icon: Smartphone,
      title: t('monitor.tipDeviceTitle'),
      body: t('monitor.tipDeviceBody'),
      tone: 'border-sky-100 bg-sky-50/70 text-sky-700'
    },
    {
      icon: ScanLine,
      title: t('monitor.tipFrameTitle'),
      body: t('monitor.tipFrameBody'),
      tone: 'border-violet-100 bg-violet-50/70 text-violet-700'
    },
    {
      icon: Shirt,
      title: t('monitor.tipClothingTitle'),
      body: t('monitor.tipClothingBody'),
      tone: 'border-orange-100 bg-orange-50/70 text-orange-700'
    }
  ]

  return (
    <section aria-labelledby="setup-tips-title" className="mt-5 sm:mt-6">
      <h2 className="sr-only" id="setup-tips-title">
        {t('monitor.setupTipsLabel')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tips.map(({ icon: Icon, title, body, tone }) => (
          <article
            className="rounded-[1.4rem] border border-white/80 bg-white/80 p-5 shadow-[0_10px_30px_rgb(15_23_42_/_0.05)] backdrop-blur-sm sm:p-6"
            key={title}
          >
            <span
              className={`grid size-12 place-items-center rounded-2xl border ${tone}`}
            >
              <Icon aria-hidden="true" size={25} />
            </span>
            <h3 className="mt-4 text-base font-bold leading-6 text-slate-950 sm:text-lg">
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function StatusItem({
  label,
  state,
  value
}: {
  label: string
  state: 'good' | 'error' | 'pending'
  value?: string
}) {
  return (
    <li className="flex items-start gap-3">
      {state === 'good' ? (
        <CheckCircle2
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-emerald-600"
          size={20}
        />
      ) : state === 'error' ? (
        <UserRoundX
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-red-600"
          size={20}
        />
      ) : (
        <div className="mt-1.5 size-2.5 shrink-0 rounded-full bg-slate-300" />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${state === 'error' ? 'text-red-900' : 'text-slate-700'}`}
        >
          {label}
        </p>
        {value && <p className="mt-0.5 text-xs text-slate-500">{value}</p>}
      </div>
    </li>
  )
}
