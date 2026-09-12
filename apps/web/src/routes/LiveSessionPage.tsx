import { useQuery } from '@tanstack/react-query'
import {
  Camera,
  CircleMinus,
  Eye,
  MonitorOff,
  Pause,
  Play,
  ShieldCheck,
  Square
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { SafetyNotice } from '@/components/SafetyNotice'
import { useCamera } from '@/features/camera/useCamera'
import { CameraPoseLayer } from '@/features/pose/CameraPoseLayer'
import { createMediaPipePoseAdapter } from '@/features/pose/poseAdapter'
import {
  usePoseTracking,
  type PoseTrackingStatus
} from '@/features/pose/usePoseTracking'
import { formatDuration } from '@/lib/format'
import {
  getSession,
  updateSession
} from '@/services/product'

export function LiveSessionPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const camera = useCamera()
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null)

  const session = useQuery({
    queryKey: ['session', id],
    queryFn: ({ signal }) => getSession(id, signal)
  })

  // Hardcoded 'static_posture' placeholder for now since we don't have exercise slugs
  const pose = usePoseTracking(
    camera.videoRef,
    cameraCanvasRef,
    camera.state === 'ready',
    'static_posture',
    createMediaPipePoseAdapter
  )

  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)

  // Start camera automatically
  useEffect(() => {
    if (camera.state === 'idle') {
      void camera.start()
    }
  }, [camera])

  // Timer
  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [paused])

  const finishSession = async () => {
    try {
      await updateSession(id, {
        status: 'completed',
        metrics: {
          duration_seconds: seconds,
          sitting_seconds: seconds * 0.8, // placeholder
          standing_seconds: seconds * 0.2, // placeholder
          good_alignment_seconds: seconds * 0.7, // placeholder
          needs_adjustment_seconds: seconds * 0.3, // placeholder
          alert_count: 2, // placeholder
          break_count: 1, // placeholder
          longest_sitting_seconds: seconds > 60 ? 60 : seconds // placeholder
        }
      })
      navigate(`/app/monitor/summary/${id}`)
    } catch {
      alert(t('session.saveFailed'))
    }
  }

  if (session.isLoading) return <QueryLoading />
  if (session.isError) return <QueryError retry={() => void session.refetch()} />

  return (
    <div className="mx-auto max-w-[82rem] pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {t('session.live')}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-emerald-700">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            {t('common.active')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 font-semibold tabular-nums text-slate-700 shadow-sm">
            {formatDuration(seconds)}
          </div>
          <button
            className="kg-button-secondary"
            onClick={() => setPaused(!paused)}
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
              <video
                autoPlay
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                ref={camera.videoRef}
              />
            )}
            <canvas
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              ref={cameraCanvasRef}
            />
            {camera.state === 'ready' && pose.status === 'ready' && pose.result && (
              <CameraPoseLayer
                canvas={cameraCanvasRef.current}
                result={pose.result}
                video={camera.videoRef.current}
              />
            )}
            <CameraStateOverlay camera={camera.state} pose={pose.status} />
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-teal-50/50 p-4 text-sm text-teal-900">
            <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
            <p>{t('session.posePrivacy')}</p>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="kg-card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
              <h2 className="font-bold text-slate-900">{t('session.currentActivity')}</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <Eye aria-hidden="true" size={24} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-500">{t('session.postureState')}</p>
                  <p className="text-xl font-bold text-slate-900">
                    {/* Placeholder state */}
                    {t('session.activitySitting')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="kg-card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
              <h2 className="font-bold text-slate-900">{t('session.postureState')}</h2>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                <span className="font-semibold text-emerald-900">{t('session.stateGood')}</span>
                <CheckCircle2 aria-hidden="true" className="text-emerald-600" size={20} />
              </div>

              <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                <p className="text-sm font-medium text-slate-700">{t('session.headAlignment')}</p>
                <p className="text-sm font-medium text-slate-700">{t('session.shoulderAlignment')}</p>
                <p className="text-sm font-medium text-slate-700">{t('session.torsoAlignment')}</p>
              </div>
            </div>
          </div>

          <div className="kg-card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
              <h2 className="font-bold text-slate-900">{t('session.baselineComparison')}</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500">
                {t('calibration.placeholderNote')}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <SafetyNotice className="mt-8">{t('common.noDiagnosis')}</SafetyNotice>
    </div>
  )
}

function CameraStateOverlay({
  camera,
  pose
}: {
  camera: ReturnType<typeof useCamera>['state']
  pose: PoseTrackingStatus
}) {
  const { t } = useTranslation()

  if (camera === 'denied') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 p-6 text-center text-white backdrop-blur-sm">
        <MonitorOff aria-hidden="true" size={32} />
        <p className="font-medium">{t('camera.denied')}</p>
      </div>
    )
  }

  if (camera === 'waiting' || pose === 'initializing') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/50 text-white backdrop-blur-sm">
        <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="font-medium text-white/90">
          {camera === 'waiting' ? t('camera.waiting') : t('session.poseLoading')}
        </p>
      </div>
    )
  }

  if (pose === 'error') {
    return (
      <div className="absolute inset-x-0 top-0 flex items-center justify-center bg-red-950/80 p-3 text-red-50 backdrop-blur-md">
        <CircleMinus aria-hidden="true" className="mr-2" size={18} />
        <p className="text-sm font-medium">{t('session.poseError')}</p>
      </div>
    )
  }

  return null
}
