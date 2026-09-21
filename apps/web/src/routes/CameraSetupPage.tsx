import { useMutation } from '@tanstack/react-query'
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Loader2,
  MonitorOff,
  UserRoundX
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { useCamera } from '@/features/camera/useCamera'
import { createSession } from '@/services/product'

export function CameraSetupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const camera = useCamera()
  const [permissionStep, setPermissionStep] = useState(true)

  const startSession = useMutation({
    mutationFn: async () => {
      return createSession({ camera_used: true })
    },
    onSuccess: (session) => {
      navigate(`/app/sessions/${session.id}/live`)
    }
  })

  if (permissionStep) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title={t('monitor.setupTitle')}
          subtitle={t('monitor.setupSubtitle')}
        />
        <div className="kg-card mt-8 flex flex-col items-center justify-center p-8 text-center sm:p-12">
          <Camera aria-hidden="true" className="text-teal-700" size={56} />
          <h2 className="mt-6 text-xl font-bold text-slate-900">
            {t('consent.cameraTitle')}
          </h2>
          <p className="mt-4 max-w-md text-slate-600 leading-relaxed">
            {t('consent.cameraBody')}
          </p>
          <div className="mt-8 flex gap-4">
            <button
              className="kg-button-primary"
              onClick={() => {
                setPermissionStep(false)
                void camera.start()
              }}
              type="button"
            >
              {t('monitor.start')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl pb-4">
      <PageHeader
        title={t('monitor.setupTitle')}
        subtitle={t('monitor.setupSubtitle')}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_minmax(18rem,0.4fr)]">
        <section className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950">
            {camera.state === 'ready' && (
              <video
                autoPlay
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                ref={camera.videoRef}
              />
            )}
            {camera.state === 'requesting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/80">
                <Loader2
                  aria-hidden="true"
                  className="animate-spin"
                  size={32}
                />
                <p>{t('monitor.waiting')}</p>
              </div>
            )}
            {camera.state === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/80">
                <MonitorOff aria-hidden="true" size={32} />
                <p>{t('monitor.denied')}</p>
              </div>
            )}
            {camera.state === 'unsupported' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/80">
                <CircleAlert aria-hidden="true" size={32} />
                <p>{t('monitor.unsupported')}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 sm:px-5">
            <p className="text-sm font-medium text-slate-700">
              {t('monitor.secure')}
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
              <CheckCircle2 aria-hidden="true" size={18} />
              {t('common.onDevice')}
            </span>
          </div>
        </section>

        <section className="flex flex-col">
          <div className="kg-card flex-1 p-5">
            <h2 className="font-bold text-slate-950">
              {t('monitor.readiness')}
            </h2>
            <ul className="mt-5 space-y-4">
              <StatusItem
                label={t('monitor.permission')}
                state={
                  camera.state === 'ready'
                    ? 'good'
                    : camera.state === 'denied'
                      ? 'error'
                      : 'pending'
                }
                value={
                  camera.state === 'ready' ? t('monitor.granted') : undefined
                }
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
          </div>

          <div className="mt-5">
            <p className="mb-4 text-sm text-slate-600 text-center">
              {t('monitor.instructions')}
            </p>
            {startSession.isError && (
              <p
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900"
                role="alert"
              >
                {t('monitor.startSessionFailed')}
              </p>
            )}
            <button
              className="kg-button-primary w-full"
              disabled={camera.state !== 'ready' || startSession.isPending}
              onClick={() => startSession.mutate()}
              type="button"
            >
              {startSession.isPending && (
                <Loader2
                  aria-hidden="true"
                  className="animate-spin"
                  size={18}
                />
              )}
              {t('monitor.continue')}
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </div>
        </section>
      </div>

      <SafetyNotice className="mt-8">{t('common.noDiagnosis')}</SafetyNotice>
    </div>
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
          size={18}
        />
      ) : state === 'error' ? (
        <UserRoundX
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-red-600"
          size={18}
        />
      ) : (
        <div className="mt-1.5 size-2 shrink-0 rounded-full bg-slate-300" />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${state === 'error' ? 'text-red-900' : 'text-slate-700'}`}
        >
          {label}
        </p>
        {value && <p className="mt-0.5 text-xs text-slate-500">{value}</p>}
      </div>
    </li>
  )
}
