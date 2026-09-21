import { useQuery } from '@tanstack/react-query'
import {
  Camera,
  CircleAlert,
  Eye,
  Loader2,
  MonitorOff,
  Pause,
  Play,
  ShieldCheck,
  Square
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { SafetyNotice } from '@/components/SafetyNotice'
import { useCamera, type CameraState } from '@/features/camera/useCamera'
import { CameraPoseLayer } from '@/features/pose/CameraPoseLayer'
import { createMediaPipePoseAdapter } from '@/features/pose/poseAdapter'
import {
  usePoseTracking,
  type PoseTrackingStatus
} from '@/features/pose/usePoseTracking'
import { formatDuration } from '@/lib/format'
import { getSession, updateSession } from '@/services/product'

type TechnicalTone = 'neutral' | 'ready' | 'caution' | 'error'

interface TechnicalStatus {
  messageKey: string
  tone: TechnicalTone
}

export function LiveSessionPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const camera = useCamera()
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null)
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)

  const session = useQuery({
    queryKey: ['session', id],
    queryFn: ({ signal }) => getSession(id, signal),
    enabled: id.length > 0
  })

  const pose = usePoseTracking(
    camera.videoRef,
    cameraCanvasRef,
    camera.state === 'ready' && !paused,
    'seated-posture-demo',
    createMediaPipePoseAdapter
  )

  useEffect(() => {
    if (paused || id.length === 0) return
    const interval = setInterval(
      () => setSeconds((current) => current + 1),
      1000
    )
    return () => clearInterval(interval)
  }, [id, paused])

  const finishSession = async () => {
    try {
      await updateSession(id, {
        status: 'completed',
        metrics: { duration_seconds: seconds }
      })
      navigate(`/app/sessions/${id}/summary`)
    } catch {
      alert(t('session.saveFailed'))
    }
  }

  if (!id) {
    return (
      <div className="mx-auto max-w-2xl">
        <section className="kg-card p-6 sm:p-8">
          <CircleAlert
            aria-hidden="true"
            className="text-amber-700"
            size={32}
          />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">
            {t('session.missingSessionTitle')}
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            {t('session.missingSessionBody')}
          </p>
          <Link className="kg-button-primary mt-6" to="/app/monitor">
            {t('session.returnToSetup')}
          </Link>
        </section>
      </div>
    )
  }

  if (session.isLoading) return <QueryLoading />
  if (session.isError)
    return <QueryError retry={() => void session.refetch()} />

  const technicalStatus = getTechnicalStatus(camera.state, pose.status, paused)

  return (
    <div className="mx-auto max-w-[82rem] pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {t('session.live')}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-teal-800">
            <span className="size-2.5 rounded-full bg-teal-600" />
            {t('session.technicalOnly')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 font-semibold tabular-nums text-slate-700 shadow-sm">
            {formatDuration(seconds)}
          </div>
          <button
            className="kg-button-secondary"
            onClick={() => setPaused((current) => !current)}
            type="button"
          >
            {paused ? (
              <Play aria-hidden="true" size={18} />
            ) : (
              <Pause aria-hidden="true" size={18} />
            )}
            {paused ? t('session.resume') : t('session.pause')}
          </button>
          <button
            className="kg-button-primary"
            onClick={() => void finishSession()}
            type="button"
          >
            <Square aria-hidden="true" size={18} />
            {t('session.finish')}
          </button>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 shadow-sm">
            {camera.state === 'ready' && (
              <CameraPoseLayer
                canvasRef={cameraCanvasRef}
                label={t('session.poseVisualLabel')}
                snapshot={pose}
                videoRef={camera.videoRef}
              />
            )}
            <CameraStateOverlay
              camera={camera.state}
              onStartCamera={() => void camera.start()}
              paused={paused}
              pose={pose.status}
            />
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-teal-50/50 p-4 text-sm text-teal-900">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={20}
            />
            <p>{t('session.posePrivacy')}</p>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <section
            className="kg-card overflow-hidden"
            aria-labelledby="session-mode-title"
          >
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
              <h2 className="font-bold text-slate-900" id="session-mode-title">
                {t('session.currentActivity')}
              </h2>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <Eye aria-hidden="true" size={24} />
                </span>
                <div>
                  <p className="font-bold text-slate-900">
                    {t('session.technicalSession')}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {t('session.technicalSessionBody')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            className="kg-card overflow-hidden"
            aria-labelledby="technical-status-title"
          >
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
              <h2
                className="font-bold text-slate-900"
                id="technical-status-title"
              >
                {t('session.technicalStatus')}
              </h2>
            </div>
            <div className="p-5">
              <p
                aria-live="polite"
                className={`rounded-xl border px-4 py-3 text-sm font-semibold ${toneClasses[technicalStatus.tone]}`}
                role="status"
              >
                {t(technicalStatus.messageKey)}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t('session.technicalStatusBody')}
              </p>
            </div>
          </section>

          <section
            className="kg-card overflow-hidden"
            aria-labelledby="baseline-title"
          >
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
              <h2 className="font-bold text-slate-900" id="baseline-title">
                {t('session.baselineTitle')}
              </h2>
            </div>
            <div className="p-5">
              <p className="font-semibold text-slate-800">
                {t('session.baselineUnavailable')}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t('session.baselineUnavailableBody')}
              </p>
            </div>
          </section>
        </aside>
      </div>

      <SafetyNotice className="mt-8">{t('common.noDiagnosis')}</SafetyNotice>
    </div>
  )
}

const toneClasses: Record<TechnicalTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-800',
  ready: 'border-teal-200 bg-teal-50 text-teal-900',
  caution: 'border-amber-200 bg-amber-50 text-amber-950',
  error: 'border-red-200 bg-red-50 text-red-950'
}

function getTechnicalStatus(
  camera: CameraState,
  pose: PoseTrackingStatus,
  paused: boolean
): TechnicalStatus {
  if (paused) return { messageKey: 'session.posePaused', tone: 'neutral' }
  if (camera === 'idle')
    return { messageKey: 'session.poseIdle', tone: 'neutral' }
  if (camera === 'requesting') {
    return { messageKey: 'session.cameraRequesting', tone: 'neutral' }
  }
  if (camera === 'denied') {
    return { messageKey: 'session.cameraDenied', tone: 'caution' }
  }
  if (camera === 'unsupported') {
    return { messageKey: 'session.cameraUnsupported', tone: 'caution' }
  }
  if (camera === 'error') {
    return { messageKey: 'session.cameraError', tone: 'error' }
  }

  const poseStatuses: Record<PoseTrackingStatus, TechnicalStatus> = {
    idle: { messageKey: 'session.poseIdle', tone: 'neutral' },
    loading_model: { messageKey: 'session.poseLoading', tone: 'neutral' },
    ready: { messageKey: 'session.poseReady', tone: 'ready' },
    adjust_camera: { messageKey: 'session.poseAdjust', tone: 'caution' },
    no_pose: { messageKey: 'session.poseMissing', tone: 'caution' },
    multiple_poses: { messageKey: 'session.poseMultiple', tone: 'caution' },
    unsupported_activity: {
      messageKey: 'session.poseUnsupported',
      tone: 'caution'
    },
    unavailable: { messageKey: 'session.poseUnavailable', tone: 'caution' },
    error: { messageKey: 'session.poseError', tone: 'error' }
  }

  return poseStatuses[pose]
}

function CameraStateOverlay({
  camera,
  onStartCamera,
  paused,
  pose
}: {
  camera: CameraState
  onStartCamera: () => void
  paused: boolean
  pose: PoseTrackingStatus
}) {
  const { t } = useTranslation()

  if (paused) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 p-6 text-center text-white backdrop-blur-sm">
        <p className="font-medium">{t('session.posePaused')}</p>
      </div>
    )
  }

  if (camera === 'idle') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-center text-white">
        <Camera aria-hidden="true" size={36} />
        <p className="max-w-sm text-sm leading-6 text-white/80">
          {t('session.startCameraBody')}
        </p>
        <button
          className="kg-button-primary"
          onClick={onStartCamera}
          type="button"
        >
          {t('session.startCamera')}
        </button>
      </div>
    )
  }

  if (camera === 'requesting' || pose === 'loading_model') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/70 text-white backdrop-blur-sm">
        <Loader2 aria-hidden="true" className="animate-spin" size={32} />
        <p className="font-medium text-white/90">
          {camera === 'requesting'
            ? t('session.cameraRequesting')
            : t('session.poseLoading')}
        </p>
      </div>
    )
  }

  if (camera === 'denied' || camera === 'unsupported' || camera === 'error') {
    const message =
      camera === 'denied'
        ? t('session.cameraDenied')
        : camera === 'unsupported'
          ? t('session.cameraUnsupported')
          : t('session.cameraError')
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/85 p-6 text-center text-white backdrop-blur-sm">
        <MonitorOff aria-hidden="true" size={32} />
        <p className="font-medium">{message}</p>
      </div>
    )
  }

  return null
}
