import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock,
  Eye,
  Loader2,
  MonitorOff,
  Pause,
  Play,
  RotateCcw,
  Scan,
  ShieldCheck,
  Square,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { SafetyNotice } from '@/components/SafetyNotice'
import { useCamera, type CameraState } from '@/features/camera/useCamera'
import { useSoundAlertPreferences } from '@/features/notifications/soundAlertPreferences'
import {
  getCalibrationFailureReasonKey,
  useSessionSoundAlerts
} from '@/features/notifications/useSessionSoundAlerts'
import { CameraPoseLayer } from '@/features/pose/CameraPoseLayer'
import { BaselineReadings } from '@/features/pose/BaselineReadings'
import { createMediaPipePoseAdapter } from '@/features/pose/poseAdapter'
import {
  usePostureMonitor,
  type CalibrationFailureReason
} from '@/features/pose/usePostureMonitor'
import {
  usePoseTracking,
  type PoseTrackingStatus
} from '@/features/pose/usePoseTracking'
import { BreakReminderEngine } from '@/features/reminders/breakReminderEngine'
import { formatDuration } from '@/lib/format'
import { getSession, updateSession } from '@/services/product'

type TechnicalTone = 'neutral' | 'ready' | 'caution' | 'error'

interface TechnicalStatus {
  messageKey: string
  tone: TechnicalTone
}

export function LiveSessionPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const camera = useCamera()
  const { preferences: soundPreferences, toggleEnabled: toggleSound } =
    useSoundAlertPreferences()
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null)
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [syncedInitial, setSyncedInitial] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  // Deterministic break reminder engine
  const reminderEngineRef = useRef<BreakReminderEngine | null>(null)
  if (!reminderEngineRef.current) {
    reminderEngineRef.current = new BreakReminderEngine()
  }
  const [breakDue, setBreakDue] = useState(false)

  const session = useQuery({
    queryKey: ['session', id],
    queryFn: ({ signal }) => getSession(id, signal),
    enabled: id.length > 0
  })

  useEffect(() => {
    if (
      session.data?.status === 'completed' ||
      session.data?.status === 'stopped'
    ) {
      navigate(`/app/sessions/${id}/summary`, { replace: true })
    }
  }, [id, navigate, session.data?.status])

  useEffect(() => {
    if (!syncedInitial && session.data?.metrics?.duration_seconds) {
      setSeconds(session.data.metrics.duration_seconds)
      setSyncedInitial(true)
    }
  }, [session.data?.metrics?.duration_seconds, syncedInitial])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPaused(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const pose = usePoseTracking(
    camera.videoRef,
    cameraCanvasRef,
    camera.state === 'ready' && !paused,
    'seated-posture-demo',
    createMediaPipePoseAdapter
  )

  const monitor = usePostureMonitor(pose, paused)

  const thaiT = i18n.getFixedT('th')

  useSessionSoundAlerts({
    cameraState: camera.state,
    paused,
    isFinishing,
    breakDue,
    breakIntervalMinutes: reminderEngineRef.current?.getIntervalMinutes() ?? 25,
    feedback: monitor.feedback,
    calibrationState: monitor.calibrationState,
    preferences: soundPreferences,
    tThai: (key, options) => String(thaiT(key, options))
  })

  // Update break reminders every elapsed second
  useEffect(() => {
    if (paused || id.length === 0) return
    const interval = setInterval(() => {
      setSeconds((current) => {
        const next = current + 1
        const due = reminderEngineRef.current?.update(next) ?? false
        setBreakDue(due)
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [id, paused])

  const acknowledgeBreak = () => {
    reminderEngineRef.current?.acknowledge()
    setBreakDue(false)
  }

  const snoozeBreak = () => {
    reminderEngineRef.current?.snooze(5)
    setBreakDue(false)
  }

  const finishSession = async () => {
    setIsFinishing(true)
    setSaveError(false)
    try {
      const summaryInput = monitor.getSummaryInput()
      const breakCount = reminderEngineRef.current?.getBreakCount() ?? 0
      const postureSummaryPayload = summaryInput
        ? {
            ...summaryInput,
            break_count: breakCount
          }
        : null

      await updateSession(id, {
        status: 'completed',
        metrics: {
          duration_seconds: seconds,
          good_alignment_seconds: summaryInput?.good_alignment_seconds ?? null,
          needs_adjustment_seconds:
            summaryInput?.needs_adjustment_seconds ?? null,
          alert_count: summaryInput?.alert_count ?? null,
          break_count: summaryInput ? breakCount : null
        },
        posture_summary: postureSummaryPayload
      })
      navigate(`/app/sessions/${id}/summary`)
    } catch {
      setSaveError(true)
    } finally {
      setIsFinishing(false)
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
  const canCalibrate =
    camera.state === 'ready' && pose.status === 'ready' && !paused

  return (
    <div className="mx-auto max-w-[82rem] pb-4">
      <header className="flex flex-col gap-5 rounded-[var(--radius-feature)] border border-emerald-950/10 bg-[var(--color-kg-night)] p-5 text-white shadow-[var(--shadow-floating)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
            {t('session.live')}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
            <span className="size-2.5 rounded-full bg-[var(--color-kg-accent)] shadow-[0_0_0_5px_rgb(223_243_108_/_0.10)]" />
            {t('session.technicalOnly')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-h-11 items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 font-semibold tabular-nums text-white shadow-sm">
            {formatDuration(seconds)}
          </div>
          <button
            aria-pressed={soundPreferences.enabled}
            className="kg-button-secondary"
            onClick={toggleSound}
            type="button"
          >
            {soundPreferences.enabled ? (
              <Volume2 aria-hidden="true" size={18} />
            ) : (
              <VolumeX aria-hidden="true" size={18} />
            )}
            {soundPreferences.enabled
              ? t('session.soundOn')
              : t('session.soundOff')}
          </button>
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
            disabled={isFinishing}
            onClick={() => void finishSession()}
            type="button"
          >
            {isFinishing ? (
              <Loader2 aria-hidden="true" className="animate-spin" size={18} />
            ) : (
              <Square aria-hidden="true" size={18} />
            )}
            {t('session.finish')}
          </button>
        </div>
      </header>

      {/* Break reminder banner */}
      {breakDue && (
        <div
          aria-live="assertive"
          className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          role="region"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-200 text-amber-900">
              <Bell aria-hidden="true" size={20} />
            </span>
            <div>
              <p className="font-bold text-slate-900">
                {t('session.breakDueTitle')}
              </p>
              <p className="text-sm leading-6 text-slate-700">
                {t('session.breakDueBody', {
                  minutes: reminderEngineRef.current?.getIntervalMinutes() ?? 25
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <button
              className="kg-button-primary px-3 py-1.5 text-xs"
              onClick={acknowledgeBreak}
              type="button"
            >
              {t('session.breakAcknowledge')}
            </button>
            <button
              className="kg-button-secondary px-3 py-1.5 text-xs border-amber-300 hover:bg-amber-100"
              onClick={snoozeBreak}
              type="button"
            >
              {t('session.breakSnooze')}
            </button>
          </div>
        </div>
      )}

      {/* Camera angle & framing error banner */}
      {monitor.feedback.state === 'camera_framing_error' && (
        <div
          aria-live="polite"
          className="mt-4 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-950 shadow-sm"
          role="region"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-200 text-red-900">
            <Camera aria-hidden="true" size={20} />
          </span>
          <div>
            <p className="font-bold text-red-950">
              {t('session.cameraFramingAlert')}
            </p>
            <p className="mt-0.5 text-sm leading-6 text-red-900">
              {t(monitor.feedback.feedbackMessageKey)}
            </p>
          </div>
        </div>
      )}

      {saveError && (
        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <CircleAlert
              aria-hidden="true"
              className="text-red-700"
              size={18}
            />
            <p>{t('session.saveFailed')}</p>
          </div>
          <button
            className="kg-button-secondary px-3 py-1.5 text-xs text-red-900 border-red-300 hover:bg-red-100"
            disabled={isFinishing}
            onClick={() => void finishSession()}
            type="button"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-feature)] border border-emerald-950/20 bg-slate-950 shadow-[var(--shadow-floating)]">
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
          {/* Posture status card (only when calibrated) */}
          {monitor.calibrationState.status === 'calibrated' && (
            <section
              className="kg-card overflow-hidden border-teal-200"
              aria-labelledby="posture-status-title"
            >
              <div className="border-b border-teal-100 bg-teal-50/60 px-5 py-3">
                <h2
                  className="font-bold text-teal-950"
                  id="posture-status-title"
                >
                  {t('session.postureStatus')}
                </h2>
              </div>
              <div className="p-5">
                <p
                  aria-label={t('session.postureStatus')}
                  aria-live="polite"
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                    postureToneClasses[monitor.feedback.state]
                  }`}
                  role="status"
                >
                  {t(monitor.feedback.feedbackMessageKey)}
                </p>
                {monitor.feedback.state === 'needs_adjustment' &&
                  monitor.feedback.deviatedMetric && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                        {getDeviationBadgeText(
                          t,
                          monitor.feedback.deviatedMetric
                        )}
                      </span>
                    </div>
                  )}
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {t('session.observationalDisclaimer')}
                </p>
                <BaselineReadings
                  baseline={monitor.calibrationState.baseline}
                  metrics={monitor.observedMetrics}
                />
              </div>
            </section>
          )}

          {/* Activity mode card */}
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

          {/* Technical status card */}
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
                aria-label={t('session.technicalStatus')}
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

          {/* Baseline & calibration card */}
          <section
            className="kg-card overflow-hidden"
            aria-labelledby="baseline-title"
          >
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-900" id="baseline-title">
                {t('session.baselineTitle')}
              </h2>
              {monitor.calibrationState.status === 'calibrated' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800">
                  <CheckCircle2 aria-hidden="true" size={14} />
                  {t(
                    monitor.calibrationState.baseline.framing.mode ===
                      'full_torso'
                      ? 'calibration.modeFullTorso'
                      : 'calibration.modeUpperBody'
                  )}
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col gap-4">
              {monitor.calibrationState.status === 'idle' && (
                <div>
                  <p className="font-semibold text-slate-800">
                    {t('session.baselineUnavailable')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t('calibration.notCalibratedHint')}
                  </p>
                </div>
              )}

              {monitor.calibrationState.status === 'calibrating' && (
                <div
                  aria-live="polite"
                  className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm"
                  role="status"
                >
                  <div className="flex items-center gap-3 text-teal-950 font-semibold">
                    <Loader2
                      aria-hidden="true"
                      className="animate-spin text-teal-700"
                      size={18}
                    />
                    <span>
                      {t('calibration.calibrating', {
                        current: monitor.calibrationState.samplesCollected,
                        total: monitor.calibrationState.targetSamples
                      })}
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-teal-200">
                    <div
                      className="h-full bg-teal-700 transition-all duration-150"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (monitor.calibrationState.samplesCollected /
                              monitor.calibrationState.targetSamples) *
                              100
                          )
                        )}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {monitor.calibrationState.status === 'calibrated' && (
                <div>
                  <p className="font-semibold text-teal-900">
                    {t('calibration.calibratedSummary', {
                      mode: t(
                        monitor.calibrationState.baseline.framing.mode ===
                          'full_torso'
                          ? 'calibration.modeFullTorso'
                          : 'calibration.modeUpperBody'
                      )
                    })}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Clock aria-hidden="true" size={12} />
                    {t('session.calibratedAt')}{' '}
                    {new Date(
                      monitor.calibrationState.baseline.calibratedAt
                    ).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {monitor.calibrationState.status === 'failed' && (
                <div
                  aria-live="polite"
                  className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950"
                  role="status"
                >
                  <div className="flex items-start gap-2">
                    <CircleAlert
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-amber-700"
                      size={16}
                    />
                    <p>
                      {t('calibration.failedNotice', {
                        reason: getCalibrationReasonText(
                          t,
                          monitor.calibrationState.reason
                        )
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                <button
                  className="kg-button-secondary text-xs w-full justify-center"
                  disabled={
                    !canCalibrate ||
                    monitor.calibrationState.status === 'calibrating'
                  }
                  onClick={() => monitor.startCalibration()}
                  type="button"
                >
                  {monitor.calibrationState.status === 'calibrated' ? (
                    <>
                      <RotateCcw aria-hidden="true" size={14} />
                      {t('calibration.recalibrate')}
                    </>
                  ) : (
                    <>
                      <Scan aria-hidden="true" size={14} />
                      {t('calibration.calibrate')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <SafetyNotice className="mt-8">{t('common.noDiagnosis')}</SafetyNotice>
    </div>
  )
}

function getCalibrationReasonText(
  t: (key: string) => string,
  reason: CalibrationFailureReason
): string {
  return t(getCalibrationFailureReasonKey(reason))
}

const toneClasses: Record<TechnicalTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-800',
  ready: 'border-teal-200 bg-teal-50 text-teal-900',
  caution: 'border-amber-200 bg-amber-50 text-amber-950',
  error: 'border-red-200 bg-red-50 text-red-950'
}

const postureToneClasses: Record<string, string> = {
  good_alignment: 'border-teal-300 bg-teal-50 text-teal-950',
  needs_adjustment: 'border-amber-300 bg-amber-50 text-amber-950',
  camera_framing_error: 'border-red-300 bg-red-50 text-red-950',
  low_confidence: 'border-slate-200 bg-slate-50 text-slate-700',
  unable_to_assess: 'border-slate-200 bg-slate-50 text-slate-700',
  not_visible: 'border-slate-200 bg-slate-50 text-slate-700',
  recalibration_recommended: 'border-amber-300 bg-amber-50 text-amber-950'
}

function getDeviationBadgeText(
  t: (key: string) => string,
  metric: string
): string {
  if (metric === 'forwardHead') return t('session.badgeForwardHead')
  if (metric === 'slouching') return t('session.badgeSlouching')
  if (metric === 'shoulderSlopeDegrees') return t('session.badgeShoulderSlope')
  if (metric === 'headTiltDegrees') return t('session.badgeHeadTilt')
  return metric
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
