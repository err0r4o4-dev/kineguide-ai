import { useQuery } from '@tanstack/react-query'
import {
  Camera,
  CircleMinus,
  CirclePlus,
  Pause,
  Play,
  Square
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { useCamera } from '@/features/camera/useCamera'
import { createMediaPipePoseAdapter } from '@/features/pose/poseAdapter'
import { PoseOverlay } from '@/features/pose/PoseOverlay'
import { researchProfileForExercise } from '@/features/pose/poseResearchProfiles'
import {
  usePoseTracking,
  type PoseTrackingStatus
} from '@/features/pose/usePoseTracking'
import { formatDuration } from '@/lib/format'
import { getSession, updateSession } from '@/services/product'

export function LiveSessionPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const camera = useCamera()
  const query = useQuery({
    queryKey: ['session', id],
    queryFn: ({ signal }) => getSession(id, signal)
  })
  const pose = usePoseTracking(
    camera.videoRef,
    camera.state === 'ready',
    query.data?.exercise_slug ?? '',
    createMediaPipePoseAdapter
  )
  const researchProfile = researchProfileForExercise(
    query.data?.exercise_slug ?? ''
  )
  const [seconds, setSeconds] = useState(0)
  const [reps, setReps] = useState(0)
  const [running, setRunning] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const initialized = useRef(false)
  useEffect(() => {
    if (query.data && !initialized.current) {
      initialized.current = true
      setSeconds(query.data.elapsed_seconds)
      setReps(query.data.manual_repetitions)
    }
  }, [query.data])
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
        manual_repetitions: reps,
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
  if (query.isLoading) return <QueryLoading />
  if (query.isError) return <QueryError retry={() => void query.refetch()} />
  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            {query.data?.exercise_slug}
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-950">
            {t('session.live')}
          </h1>
        </div>
        <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-lg font-semibold tabular-nums">
          {formatDuration(seconds)}
        </span>
      </header>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="kg-card overflow-hidden bg-black">
          <div className="relative aspect-video">
            <video
              aria-label={t('camera.visibility')}
              className="h-full w-full object-contain [transform:scaleX(-1)]"
              muted
              playsInline
              ref={camera.videoRef}
            />
            <PoseOverlay snapshot={pose} />
            {camera.state === 'ready' && (
              <div
                aria-hidden="true"
                className={`absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm sm:left-4 sm:top-4 ${poseStatusClass(pose.status)}`}
              >
                {t(poseStatusKey(pose.status))}
              </div>
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
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-3 rounded-2xl bg-white/95 p-2 shadow-lg shadow-slate-950/15 backdrop-blur sm:bottom-5">
              <button
                aria-label={running ? t('session.pause') : t('session.resume')}
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
                <Square aria-hidden="true" className="inline" size={15} />{' '}
                {t('session.stop')}
              </button>
            </div>
          </div>
        </div>
        <aside className="space-y-5">
          <article aria-live="polite" className="kg-card p-5" role="status">
            <p className="text-sm font-semibold text-slate-950">
              {t('session.poseTitle')}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {camera.state === 'ready'
                ? t(poseStatusKey(pose.status))
                : t('session.poseIdle')}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {t('session.posePrivacy')}
            </p>
            {researchProfile && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-800">
                  {t('session.poseResearchMethod')}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {t('session.poseResearchPending')}
                </p>
                <a
                  className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-teal-800 underline underline-offset-4"
                  href={researchProfile.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t('session.poseResearchSource')}
                </a>
              </div>
            )}
          </article>
          <article className="kg-card p-6 text-center">
            <p className="text-sm uppercase tracking-wide text-slate-500">
              {t('session.reps')}
            </p>
            <p
              aria-live="polite"
              className="mt-3 text-5xl font-bold tabular-nums text-teal-800"
            >
              {reps}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="kg-button-secondary"
                disabled={reps === 0}
                onClick={() => setReps((value) => Math.max(0, value - 1))}
                type="button"
              >
                <CircleMinus aria-hidden="true" />
                {t('session.undo')}
              </button>
              <button
                className="kg-button-primary"
                onClick={() => setReps((value) => value + 1)}
                type="button"
              >
                <CirclePlus aria-hidden="true" />
                {t('session.addRep')}
              </button>
            </div>
          </article>
          <p className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
            {t('session.estimate')}
          </p>
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
    unsupported_exercise: 'session.poseUnsupportedExercise',
    unavailable: 'session.poseUnavailable',
    error: 'session.poseError'
  }
  return keys[status]
}

function poseStatusClass(status: PoseTrackingStatus) {
  if (status === 'ready') {
    return 'border-emerald-200 bg-emerald-50/95 text-emerald-900'
  }
  if (status === 'adjust_camera' || status === 'multiple_poses') {
    return 'border-amber-200 bg-amber-50/95 text-amber-950'
  }
  if (status === 'error' || status === 'unavailable') {
    return 'border-red-200 bg-red-50/95 text-red-900'
  }
  return 'border-slate-200 bg-white/95 text-slate-800'
}
