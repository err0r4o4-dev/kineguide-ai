import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  CircleMinus,
  CirclePlus,
  Layers,
  Pause,
  Play,
  Square,
  XCircle
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { useCamera } from '@/features/camera/useCamera'
import { CameraPoseLayer } from '@/features/pose/CameraPoseLayer'
import { createMediaPipePoseAdapter } from '@/features/pose/poseAdapter'
import { createTechnicalRepetitionCounter } from '@/features/pose/technicalRepetitionCounter'
import { RealTimePoseComparator } from '@/features/pose/realTimePoseComparator'
import {
  loadReferenceModelFromStorage,
  type ReferenceMovementModel
} from '@/features/pose/referenceMovementModel'
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
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null)
  const query = useQuery({
    queryKey: ['session', id],
    queryFn: ({ signal }) => getSession(id, signal)
  })
  const exerciseSlug = query.data?.exercise_slug ?? ''

  const pose = usePoseTracking(
    camera.videoRef,
    cameraCanvasRef,
    camera.state === 'ready',
    exerciseSlug,
    createMediaPipePoseAdapter
  )
  const repetitionCounter = useMemo(
    () => createTechnicalRepetitionCounter(exerciseSlug),
    [exerciseSlug]
  )
  const poseComparator = useMemo(() => new RealTimePoseComparator(3, 15), [])

  const [referenceModel, setReferenceModel] =
    useState<ReferenceMovementModel | null>(null)
  const [automaticCount, setAutomaticCount] = useState(0)
  const [repProgressPercent, setRepProgressPercent] = useState(0)
  const [automaticAvailable, setAutomaticAvailable] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [reps, setReps] = useState(0)
  const [running, setRunning] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load reference model from local storage if available
  useEffect(() => {
    if (exerciseSlug) {
      const stored = loadReferenceModelFromStorage(exerciseSlug)
      setReferenceModel(stored)
    }
  }, [exerciseSlug])

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

  // Real-time evaluation update
  const evaluation = useMemo(() => {
    if (pose.status !== 'ready' || !pose.landmarks) {
      return {
        hasReference: referenceModel !== null,
        comparison: null,
        userFeatures: null
      }
    }
    return poseComparator.update(pose.landmarks, referenceModel, Date.now())
  }, [pose.landmarks, pose.status, poseComparator, referenceModel])

  useEffect(() => {
    const frameStatus = pose.status === 'ready' ? 'ready' : 'no_pose'
    const result = repetitionCounter.update(frameStatus, pose.landmarks)
    setAutomaticCount(result.count)
    setAutomaticAvailable(result.available)
    setRepProgressPercent(result.repProgressPercent)
  }, [pose.landmarks, pose.status, repetitionCounter])

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

  const comp = evaluation.comparison

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-700">{exerciseSlug}</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-950">
            {t('session.live')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            className="kg-button-secondary text-xs"
            to="/app/reference-models"
          >
            <Layers size={15} />
            {t('session.manageReference')}
          </Link>
          <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-lg font-semibold tabular-nums">
            {formatDuration(seconds)}
          </span>
        </div>
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="kg-card overflow-hidden bg-black">
          <div className="relative aspect-video">
            <CameraPoseLayer
              canvasRef={cameraCanvasRef}
              jointErrors={comp?.jointErrors ?? []}
              label={t('camera.visibility')}
              snapshot={pose}
              videoRef={camera.videoRef}
            />
            {camera.state === 'ready' && (
              <div
                aria-hidden="true"
                className={`absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm sm:left-4 sm:top-4 ${poseStatusClass(pose.status)}`}
              >
                {t(poseStatusKey(pose.status))}
              </div>
            )}
            {referenceModel && camera.state === 'ready' && (
              <div
                aria-hidden="true"
                className="absolute right-3 top-3 rounded-xl border border-teal-200 bg-teal-50/90 px-3 py-1.5 text-xs font-semibold text-teal-900 shadow-sm"
              >
                ✓ {t('session.referenceModelLoaded')}
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
          {/* Movement Accuracy & Quality Score Card */}
          <article className="kg-card p-5">
            <p className="text-sm font-semibold text-slate-950">
              {t('session.accuracy')}
            </p>
            {comp ? (
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">
                      {t('session.accuracyScore')}
                    </span>
                    <span className="text-lg font-bold text-teal-800">
                      {comp.overallScore}%
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full transition-all duration-300 ${
                        comp.overallScore >= 80
                          ? 'bg-emerald-500'
                          : comp.overallScore >= 60
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${comp.overallScore}%` }}
                    />
                  </div>
                </div>

                {/* Real-time Feedback Messages */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700">
                    {t('session.movementQuality')}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs">
                    {comp.feedbackMessages.map((msg, i) => (
                      <li
                        className={`flex items-start gap-1.5 ${
                          msg.status === 'correct'
                            ? 'text-emerald-700'
                            : msg.status === 'warning'
                              ? 'text-amber-700'
                              : 'text-red-700'
                        }`}
                        key={i}
                      >
                        {msg.status === 'correct' ? (
                          <CheckCircle className="mt-0.5 shrink-0" size={13} />
                        ) : msg.status === 'warning' ? (
                          <AlertTriangle
                            className="mt-0.5 shrink-0"
                            size={13}
                          />
                        ) : (
                          <XCircle className="mt-0.5 shrink-0" size={13} />
                        )}
                        <span>
                          {t(msg.messageKey, { degreeDiff: msg.degreeDiff })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                {referenceModel
                  ? t('session.feedback.noMovementDetected')
                  : t('session.noReferenceModel')}
              </div>
            )}
          </article>

          {/* Repetitions & Progress Card */}
          <article className="kg-card p-6 text-center">
            <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-left">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-sky-950">
                  {t('session.automaticTechnicalCount')}
                </p>
                <span className="text-2xl font-bold tabular-nums text-sky-900">
                  {automaticAvailable
                    ? automaticCount
                    : t('session.notAvailable')}
                </span>
              </div>
              {automaticAvailable && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-200">
                    <div
                      className="h-full bg-sky-600 transition-all duration-150"
                      style={{ width: `${repProgressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs uppercase tracking-wide text-slate-500">
              {t('session.reps')}
            </p>
            <p
              aria-live="polite"
              className="mt-2 text-4xl font-bold tabular-nums text-teal-800"
            >
              {reps}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
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
