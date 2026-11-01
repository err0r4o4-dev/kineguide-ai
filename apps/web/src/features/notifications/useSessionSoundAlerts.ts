import { useCallback, useEffect, useRef } from 'react'

import type { CameraState } from '@/features/camera/useCamera'
import type {
  PostureFeedbackState,
  PostureFeedbackUpdate
} from '@/features/pose/postureFeedbackEngine'
import type {
  CalibrationFailureReason,
  CalibrationState
} from '@/features/pose/usePostureMonitor'
import {
  createBrowserSoundAlertAdapter,
  THAI_SPEECH_LANGUAGE,
  type SoundAlertAdapter,
  type SoundAlertTone
} from './soundAlertAdapter'
import type { SoundAlertPreferences } from './soundAlertPreferences'

/**
 * Product engineering intervals (milliseconds) to keep audio reminders calm and
 * non-repetitive. Posture deviation itself is already debounced 5,000 ms in
 * PostureFeedbackEngine; these values are UX rate limits, not medical thresholds.
 */
export const POSTURE_SOUND_COOLDOWN_MS = 10_000
export const CAMERA_FRAMING_SOUND_DEBOUNCE_MS = 3_000
export const CAMERA_FRAMING_SOUND_COOLDOWN_MS = 15_000

export function getCalibrationFailureReasonKey(
  reason: CalibrationFailureReason
): string {
  if (reason === 'too_close') return 'calibration.reasonTooClose'
  if (reason === 'too_far') return 'calibration.reasonTooFar'
  if (reason === 'not_facing_camera') return 'calibration.reasonNotFacing'
  if (reason === 'camera_tilted') return 'calibration.reasonTilted'
  if (reason === 'head_cropped') return 'calibration.reasonHeadCropped'
  if (reason === 'mixed_framing') return 'calibration.reasonMixed'
  return 'calibration.reasonNotEnough'
}

function getThaiCalibrationSpeechReasonKey(
  reason: CalibrationFailureReason
): string {
  if (reason === 'too_close') return 'sound.speech.calibrationReason.tooClose'
  if (reason === 'too_far') return 'sound.speech.calibrationReason.tooFar'
  if (reason === 'not_facing_camera')
    return 'sound.speech.calibrationReason.notFacing'
  if (reason === 'camera_tilted') return 'sound.speech.calibrationReason.tilted'
  if (reason === 'head_cropped')
    return 'sound.speech.calibrationReason.headCropped'
  if (reason === 'mixed_framing') return 'sound.speech.calibrationReason.mixed'
  return 'sound.speech.calibrationReason.notEnough'
}

function getThaiPostureSpeechKey(deviatedMetric: string | undefined): string {
  if (
    deviatedMetric === 'forwardHead' ||
    deviatedMetric === 'forwardHeadRatio'
  ) {
    return 'sound.speech.posture.forwardHead'
  }
  if (deviatedMetric === 'slouching') {
    return 'sound.speech.posture.slouching'
  }
  if (deviatedMetric === 'shoulderSlopeDegrees') {
    return 'sound.speech.posture.shoulderSlopeDegrees'
  }
  if (deviatedMetric === 'headTiltDegrees') {
    return 'sound.speech.posture.headTiltDegrees'
  }
  if (deviatedMetric === 'torsoInclinationDegrees') {
    return 'sound.speech.posture.torsoInclinationDegrees'
  }
  if (deviatedMetric === 'eyeShoulderDistanceRatio') {
    return 'sound.speech.posture.eyeShoulderDistanceRatio'
  }
  return 'sound.speech.posture.general'
}

function getThaiCameraFramingSpeechKey(
  framingError: string | undefined,
  messageKey: string
): string {
  if (framingError === 'too_close' || messageKey === 'camera.tooClose') {
    return 'sound.speech.camera.tooClose'
  }
  if (framingError === 'too_far' || messageKey === 'camera.tooFar') {
    return 'sound.speech.camera.tooFar'
  }
  if (
    framingError === 'not_facing_camera' ||
    messageKey === 'camera.notFacingCamera'
  ) {
    return 'sound.speech.camera.notFacingCamera'
  }
  if (framingError === 'camera_tilted' || messageKey === 'camera.tilted') {
    return 'sound.speech.camera.tilted'
  }
  if (framingError === 'head_cropped' || messageKey === 'camera.headCropped') {
    return 'sound.speech.camera.headCropped'
  }
  return 'sound.speech.camera.general'
}

export interface SessionSoundAlertsInput {
  readonly cameraState: CameraState
  readonly paused: boolean
  readonly isFinishing: boolean
  readonly breakDue: boolean
  readonly breakIntervalMinutes: number
  readonly feedback: PostureFeedbackUpdate
  readonly calibrationState: CalibrationState
  readonly preferences: SoundAlertPreferences
  readonly tThai: (key: string, options?: Record<string, unknown>) => string
  readonly createAdapter?: () => SoundAlertAdapter
}

export function useSessionSoundAlerts({
  cameraState,
  paused,
  isFinishing,
  breakDue,
  breakIntervalMinutes,
  feedback,
  calibrationState,
  preferences,
  tThai,
  createAdapter
}: SessionSoundAlertsInput): void {
  const adapterRef = useRef<SoundAlertAdapter | null>(null)
  const createAdapterRef = useRef(createAdapter)
  createAdapterRef.current = createAdapter

  const framingSpeechKey = getThaiCameraFramingSpeechKey(
    feedback.framingError,
    feedback.feedbackMessageKey
  )

  const latestRef = useRef({
    tThai,
    preferences,
    breakIntervalMinutes,
    framingSpeechKey
  })
  latestRef.current = {
    tThai,
    preferences,
    breakIntervalMinutes,
    framingSpeechKey
  }

  const prevBreakDueRef = useRef(breakDue)
  const prevCalibrationStatusRef = useRef<CalibrationState['status']>(
    calibrationState.status
  )
  const prevFeedbackStateRef = useRef<PostureFeedbackState>(feedback.state)
  const lastPostureAlertAtRef = useRef<number | null>(null)
  const lastFramingAlertAtRef = useRef<number | null>(null)
  const framingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const framingEpisodeAlertedRef = useRef(false)

  useEffect(() => {
    const factory = createAdapterRef.current ?? createBrowserSoundAlertAdapter
    const adapter = factory()
    adapterRef.current = adapter

    return () => {
      if (framingTimerRef.current !== null) {
        clearTimeout(framingTimerRef.current)
        framingTimerRef.current = null
      }
      adapter.dispose()
      adapterRef.current = null
    }
  }, [])

  // Immediately stop active playback and pending timers when paused, finishing, or muted
  useEffect(() => {
    if (!paused && !isFinishing && preferences.enabled) return
    if (framingTimerRef.current !== null) {
      clearTimeout(framingTimerRef.current)
      framingTimerRef.current = null
    }
    adapterRef.current?.stop()
  }, [paused, isFinishing, preferences.enabled])

  const emitAlert = useCallback((tone: SoundAlertTone, text: string) => {
    const adapter = adapterRef.current
    if (!adapter) return
    const current = latestRef.current
    adapter.play({
      tone,
      text,
      language: THAI_SPEECH_LANGUAGE,
      mode: current.preferences.mode,
      volume: current.preferences.volume
    })
  }, [])

  // 1. Break reminder due transition
  useEffect(() => {
    const wasBreakDue = prevBreakDueRef.current
    prevBreakDueRef.current = breakDue

    if (
      !wasBreakDue &&
      breakDue &&
      !paused &&
      !isFinishing &&
      preferences.enabled &&
      preferences.events.breakReminder
    ) {
      const current = latestRef.current
      emitAlert(
        'break',
        current.tThai('sound.speech.breakDue', {
          minutes: current.breakIntervalMinutes
        })
      )
    }
  }, [
    breakDue,
    emitAlert,
    paused,
    isFinishing,
    preferences.enabled,
    preferences.events.breakReminder
  ])

  // 2. Calibration status completion/failure transitions
  useEffect(() => {
    const previousStatus = prevCalibrationStatusRef.current
    prevCalibrationStatusRef.current = calibrationState.status

    if (
      previousStatus !== 'calibrating' ||
      paused ||
      isFinishing ||
      !preferences.enabled ||
      !preferences.events.calibrationStatus
    ) {
      return
    }

    const current = latestRef.current
    if (calibrationState.status === 'calibrated') {
      emitAlert(
        'calibration_success',
        current.tThai('sound.speech.calibrationSuccess')
      )
    } else if (calibrationState.status === 'failed') {
      const reason = current.tThai(
        getThaiCalibrationSpeechReasonKey(calibrationState.reason)
      )
      emitAlert(
        'calibration_failed',
        current.tThai('sound.speech.calibrationFailed', { reason })
      )
    }
  }, [
    calibrationState,
    emitAlert,
    paused,
    isFinishing,
    preferences.enabled,
    preferences.events.calibrationStatus
  ])

  // 3. Debounced posture deviation alert
  useEffect(() => {
    const previousState = prevFeedbackStateRef.current
    prevFeedbackStateRef.current = feedback.state

    if (
      feedback.state !== 'needs_adjustment' ||
      previousState === 'needs_adjustment' ||
      !feedback.alertTriggered ||
      paused ||
      isFinishing ||
      !preferences.enabled ||
      !preferences.events.postureAlert
    ) {
      return
    }

    const now = Date.now()
    if (
      lastPostureAlertAtRef.current !== null &&
      now - lastPostureAlertAtRef.current < POSTURE_SOUND_COOLDOWN_MS
    ) {
      return
    }

    lastPostureAlertAtRef.current = now
    emitAlert(
      'posture',
      latestRef.current.tThai(getThaiPostureSpeechKey(feedback.deviatedMetric))
    )
  }, [
    emitAlert,
    feedback,
    paused,
    isFinishing,
    preferences.enabled,
    preferences.events.postureAlert
  ])

  // 4. Sustained camera framing error alert (debounced to ignore brief movements)
  useEffect(() => {
    if (feedback.state !== 'camera_framing_error') {
      framingEpisodeAlertedRef.current = false
    }

    const framingEligible =
      cameraState === 'ready' &&
      !paused &&
      !isFinishing &&
      calibrationState.status !== 'calibrating' &&
      preferences.enabled &&
      preferences.events.cameraFraming &&
      feedback.state === 'camera_framing_error'

    if (!framingEligible) {
      if (framingTimerRef.current !== null) {
        clearTimeout(framingTimerRef.current)
        framingTimerRef.current = null
      }
      return
    }

    if (framingEpisodeAlertedRef.current || framingTimerRef.current !== null) {
      return
    }

    framingTimerRef.current = setTimeout(() => {
      framingTimerRef.current = null
      framingEpisodeAlertedRef.current = true

      const now = Date.now()
      if (
        lastFramingAlertAtRef.current !== null &&
        now - lastFramingAlertAtRef.current < CAMERA_FRAMING_SOUND_COOLDOWN_MS
      ) {
        return
      }

      lastFramingAlertAtRef.current = now
      const current = latestRef.current
      emitAlert('camera_framing', current.tThai(current.framingSpeechKey))
    }, CAMERA_FRAMING_SOUND_DEBOUNCE_MS)
  }, [
    cameraState,
    calibrationState.status,
    emitAlert,
    feedback.state,
    isFinishing,
    paused,
    preferences.enabled,
    preferences.events.cameraFraming
  ])
}
