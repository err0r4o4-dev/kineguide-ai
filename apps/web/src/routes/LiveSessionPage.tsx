import { useQuery } from '@tanstack/react-query'
import {
  Camera,
  CircleMinus,
  CirclePlus,
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
import { ActivityDemonstration } from '@/features/activities/ActivityDemonstration'
import { useCamera } from '@/features/camera/useCamera'
import { CameraPoseLayer } from '@/features/pose/CameraPoseLayer'
import { createMediaPipePoseAdapter } from '@/features/pose/poseAdapter'
import {
  usePoseTracking,
  type PoseTrackingStatus
} from '@/features/pose/usePoseTracking'
import { formatDuration } from '@/lib/format'
import {
  getActivity,
  getSession,
  sessionActivitySlug,
  sessionManualCycles,
  updateSession
} from '@/services/product'

export function LiveSessionPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const camera = useCamera()
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null)
  const session = useQuery({
    queryKey: ['session', id],
    queryFn: ({ signal }) => getSession(id, signal)
  })
  const activitySlug = session.data ? sessionActivitySlug(session.data) : ''
  const activity = useQuery({
    queryKey: ['activity', activitySlug],
    queryFn: ({ signal }) => getActivity(activitySlug, signal),
    enabled: activitySlug !== ''
  })
  const pose = usePoseTracking(
    camera.videoRef,
    cameraCanvasRef,
    camera.state === 'ready',
    activitySlug,
    createMediaPipePoseAdapter
  )
  const [seconds, setSeconds] = useState(0)
  const [manualCycles, setManualCycles] = useState(0)
  const [running, setRunning] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    if (session.data && !initialized.current) {
      initialized.current = true
      setSeconds(session.data.elapsed_seconds)
      setManualCycles(sessionManualCycles(session.data))
    }
  }, [session.data])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000
    )
    return () => window.clearInterval(timer)
  }, [running])

  const finish = async (status: 'completed' | 'stopped') => {
    setSaving(true)
    setRunning(false)
    setError('')
    try {
      await updateSession(id, {
        status,
        manual_cycles: manualCycles,
        elapsed_seconds: seconds
      })
      camera.stop()
      navigate(`/app/sessions/${id}/summary`, { replace: true })
    } catch {
      setError(t('session.saveFailed'))
      setRunning(true)
      setSaving(false)
    }
  }

  if (session.isLoading || activity.isLoading) return <QueryLoading />
  if (session.isError || activity.isError) {
    return (
      <QueryError
        retry={() => {
          void session.refetch()
          void activity.refetch()
        }}
      />
    )
  }
  if (!session.data || !activity.data) return null

  const title =
    i18n.resolvedLanguage === 'th'
      ? activity.data.title_th
      : activity.data.title_en
  const usesManualCycles = activity.data.measurement_mode === 'manual_cycles'

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-700">{title}</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-950">
            {t('session.live')}
          </h1>
        </div>
        <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-lg font-semibold tabular-nums">
          {formatDuration(seconds)}
        </span>
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <article className="kg-card overflow-hidden">
            <h2 className="sr-only">{t('activities.demonstration')}</h2>
            <ActivityDemonstration slug={activitySlug} />
          </article>

          <article className="kg-card overflow-hidden bg-black">
            <div className="relative aspect-video">
              {session.data.camera_used ? (
                <>
                  <CameraPoseLayer
                    canvasRef={cameraCanvasRef}
                    label={t('camera.visibility')}
                    snapshot={pose}
                    videoRef={camera.videoRef}
                  />
                  {camera.state === 'ready' && (
                    <p
                      aria-live="polite"
                      className={`absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm ${poseStatusClass(pose.status)}`}
                    >
                      {t(poseStatusKey(pose.status))}
                    </p>
                  )}
                  {camera.state !== 'ready' && (
                    <div className="absolute inset-0 grid place-items-center text-white">
                      <button
                        className="kg-button-primary"
                        onClick={() => void camera.start()}
                        type="button"
                      >
                        <Camera aria-hidden="true" />
                        {t('session.startCamera')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 grid place-items-center px-6 text-center text-white">
                  <div>
                    <MonitorOff
                      aria-hidden="true"
                      className="mx-auto"
                      size={48}
                    />
                    <p className="mt-4 max-w-md text-slate-200">
                      {t('session.demoOnlyMode')}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-3 rounded-2xl bg-white/95 p-2 shadow-lg">
                <button
                  aria-label={
                    running ? t('session.pause') : t('session.resume')
                  }
                  className="kg-icon-button"
                  onClick={() => setRunning((value) => !value)}
                  type="button"
                >
                  {running ? (
                    <Pause aria-hidden="true" />
                  ) : (
                    <Play aria-hidden="true" />
                  )}
                </button>
                <button
                  className="inline-flex min-h-11 items-center rounded-xl bg-red-700 px-5 py-2 font-semibold text-white hover:bg-red-800"
                  disabled={saving}
                  onClick={() => void finish('stopped')}
                  type="button"
                >
                  <Square aria-hidden="true" size={15} />
                  {t('session.stop')}
                </button>
              </div>
            </div>
          </article>
        </div>

        <aside className="space-y-5">
          <article className="kg-card p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Eye aria-hidden="true" className="text-teal-700" />
              {t('session.observationTitle')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t('session.analysisPending')}
            </p>
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              {t('session.phaseUnavailable')}
            </p>
          </article>

          {usesManualCycles && (
            <article className="kg-card p-6 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t('session.cycles')}
              </p>
              <p
                aria-live="polite"
                className="mt-2 text-4xl font-bold tabular-nums text-teal-800"
              >
                {manualCycles}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  className="kg-button-secondary"
                  disabled={manualCycles === 0}
                  onClick={() =>
                    setManualCycles((value) => Math.max(0, value - 1))
                  }
                  type="button"
                >
                  <CircleMinus aria-hidden="true" />
                  {t('session.undo')}
                </button>
                <button
                  className="kg-button-primary"
                  onClick={() => setManualCycles((value) => value + 1)}
                  type="button"
                >
                  <CirclePlus aria-hidden="true" />
                  {t('session.addCycle')}
                </button>
              </div>
            </article>
          )}

          {error && (
            <p className="kg-alert-danger" role="alert">
              {error}
            </p>
          )}
          <button
            className="kg-button-primary w-full"
            disabled={saving}
            onClick={() => void finish('completed')}
            type="button"
          >
            {saving ? t('common.loading') : t('session.finish')}
          </button>
        </aside>
      </section>

      <SafetyNotice>
        <span className="flex items-start gap-2">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={18}
          />
          {t('session.posePrivacy')}
        </span>
      </SafetyNotice>
    </div>
  )
}

function poseStatusKey(status: PoseTrackingStatus) {
  const keys: Record<PoseTrackingStatus, string> = {
    idle: 'session.poseIdle',
    loading_model: 'session.poseLoading',
    ready: 'session.poseReady',
    adjust_camera: 'session.poseAdjust',
    no_pose: 'session.poseMissing',
    multiple_poses: 'session.poseMultiple',
    unsupported_activity: 'session.poseUnsupportedActivity',
    unavailable: 'session.poseUnavailable',
    error: 'session.poseError'
  }
  return keys[status]
}

function poseStatusClass(status: PoseTrackingStatus) {
  if (status === 'ready')
    return 'border-emerald-200 bg-emerald-50/95 text-emerald-900'
  if (status === 'adjust_camera' || status === 'multiple_poses') {
    return 'border-amber-200 bg-amber-50/95 text-amber-950'
  }
  if (status === 'error' || status === 'unavailable') {
    return 'border-red-200 bg-red-50/95 text-red-900'
  }
  return 'border-slate-200 bg-white/95 text-slate-800'
}
