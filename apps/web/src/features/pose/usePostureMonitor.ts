import { useCallback, useEffect, useRef, useState } from 'react'

import {
  checkCameraFraming,
  type FramingErrorReason
} from './cameraFramingQuality'
import {
  PostureFeedbackEngine,
  type PostureFeedbackUpdate
} from './postureFeedbackEngine'
import {
  PostureSessionAccumulator,
  type PostureTotals
} from './postureSessionAccumulator'
import {
  buildPersonalBaseline,
  type PersonalBaseline
} from './seatedCalibration'
import {
  calculateSeatedMetrics,
  type RawSeatedMetrics,
  type SeatedFramingMode
} from './seatedMetrics'
import type { PoseTrackingSnapshot } from './usePoseTracking'

export const CALIBRATION_SAMPLE_TARGET = 30
export const METHOD_VERSION = 'seated-baseline-v1' as const

export type CalibrationFailureReason =
  | 'not_enough_samples'
  | 'mixed_framing'
  | 'unreliable_landmarks'
  | FramingErrorReason

export type CalibrationState =
  | { readonly status: 'idle' }
  | {
      readonly status: 'calibrating'
      readonly samplesCollected: number
      readonly targetSamples: number
    }
  | {
      readonly status: 'calibrated'
      readonly baseline: PersonalBaseline
    }
  | {
      readonly status: 'failed'
      readonly reason: CalibrationFailureReason
    }

export interface PostureSummarySubmission extends PostureTotals {
  framing_mode: SeatedFramingMode
  method_version: typeof METHOD_VERSION
}

export interface PostureMonitorResult {
  readonly feedback: PostureFeedbackUpdate
  readonly observedMetrics: RawSeatedMetrics | null
  readonly calibrationState: CalibrationState
  readonly startCalibration: () => void
  readonly cancelCalibration: (reason?: CalibrationFailureReason) => void
  readonly getSummaryInput: () => PostureSummarySubmission | null
  readonly reset: () => void
}

const INITIAL_FEEDBACK: PostureFeedbackUpdate = {
  state: 'unable_to_assess',
  feedbackMessageKey: 'session.noBaseline'
}

/**
 * Connects the real-time pose stream to the posture feedback engine, personal
 * baseline calibration, and session accumulator.
 *
 * Feedback changes immediately; numeric readings refresh at most twice per
 * second and expire after 1.5 seconds without a usable frame.
 */
export function usePostureMonitor(
  snapshot: PoseTrackingSnapshot,
  paused: boolean
): PostureMonitorResult {
  const engineRef = useRef<PostureFeedbackEngine | null>(null)
  if (!engineRef.current) {
    engineRef.current = new PostureFeedbackEngine()
  }

  const accumulatorRef = useRef<PostureSessionAccumulator | null>(null)
  if (!accumulatorRef.current) {
    accumulatorRef.current = new PostureSessionAccumulator()
  }

  const [calibrationState, setCalibrationState] = useState<CalibrationState>({
    status: 'idle'
  })
  const [feedback, setFeedback] =
    useState<PostureFeedbackUpdate>(INITIAL_FEEDBACK)
  const [observedMetrics, setObservedMetrics] =
    useState<RawSeatedMetrics | null>(null)
  const latestMetricsRef = useRef<{
    metrics: RawSeatedMetrics
    receivedAt: number
  } | null>(null)

  const clearObservedMetrics = useCallback(() => {
    latestMetricsRef.current = null
    setObservedMetrics(null)
  }, [])

  const calibrationSamplesRef = useRef<RawSeatedMetrics[]>([])
  const isCalibratingRef = useRef(false)
  const activeBaselineRef = useRef<PersonalBaseline | null>(null)

  const startCalibration = useCallback(() => {
    clearObservedMetrics()
    calibrationSamplesRef.current = []
    isCalibratingRef.current = true
    setCalibrationState({
      status: 'calibrating',
      samplesCollected: 0,
      targetSamples: CALIBRATION_SAMPLE_TARGET
    })
  }, [clearObservedMetrics])

  const cancelCalibration = useCallback(
    (reason: CalibrationFailureReason = 'not_enough_samples') => {
      clearObservedMetrics()
      isCalibratingRef.current = false
      calibrationSamplesRef.current = []
      setCalibrationState({ status: 'failed', reason })
    },
    [clearObservedMetrics]
  )

  const reset = useCallback(() => {
    clearObservedMetrics()
    isCalibratingRef.current = false
    calibrationSamplesRef.current = []
    activeBaselineRef.current = null
    engineRef.current?.reset()
    engineRef.current?.setBaseline(null)
    accumulatorRef.current?.reset()
    setCalibrationState({ status: 'idle' })
    setFeedback(INITIAL_FEEDBACK)
  }, [clearObservedMetrics])

  useEffect(() => {
    if (paused || calibrationState.status !== 'calibrated') return
    const interval = setInterval(() => {
      const latest = latestMetricsRef.current
      setObservedMetrics(
        latest && Date.now() - latest.receivedAt < 1500 ? latest.metrics : null
      )
    }, 500)
    return () => clearInterval(interval)
  }, [paused, calibrationState.status])

  // Feed each incoming pose frame to calibration or the feedback engine.
  useEffect(() => {
    const engine = engineRef.current
    const accumulator = accumulatorRef.current
    if (!engine || !accumulator) return

    if (paused) {
      accumulator.pause()
      clearObservedMetrics()
      return
    }

    const now = Date.now()
    const multiplePeople = snapshot.status === 'multiple_poses'

    // 1. If actively calibrating, accumulate clean seated metrics.
    if (isCalibratingRef.current) {
      if (snapshot.landmarks && !multiplePeople) {
        const framing = checkCameraFraming(snapshot.landmarks)
        if (
          framing.status === 'error' &&
          framing.reason !== 'insufficient_landmarks'
        ) {
          isCalibratingRef.current = false
          calibrationSamplesRef.current = []
          setCalibrationState({ status: 'failed', reason: framing.reason })
          return
        }

        const result = calculateSeatedMetrics(snapshot.landmarks)
        if (result.status === 'valid') {
          calibrationSamplesRef.current.push(result.metrics)
          const count = calibrationSamplesRef.current.length
          setCalibrationState({
            status: 'calibrating',
            samplesCollected: count,
            targetSamples: CALIBRATION_SAMPLE_TARGET
          })

          if (count >= CALIBRATION_SAMPLE_TARGET) {
            isCalibratingRef.current = false
            const baseline = buildPersonalBaseline(
              calibrationSamplesRef.current,
              now
            )
            if (baseline) {
              activeBaselineRef.current = baseline
              engine.setBaseline(baseline)
              accumulator.reset()
              setCalibrationState({ status: 'calibrated', baseline })
              const postUpdate = engine.update(snapshot.landmarks, now)
              setFeedback(postUpdate)
              if (snapshot.status === 'ready' && postUpdate.rawMetrics) {
                latestMetricsRef.current = {
                  metrics: postUpdate.rawMetrics,
                  receivedAt: now
                }
              }
            } else {
              setCalibrationState({
                status: 'failed',
                reason: 'mixed_framing'
              })
            }
          }
        }
      }
      return
    }

    // 2. Normal monitoring: update the engine and accumulate totals.
    const update = engine.update(snapshot.landmarks, now, { multiplePeople })
    if (
      snapshot.status === 'ready' &&
      update.rawMetrics &&
      update.evaluation?.status !== 'recalibration_recommended'
    ) {
      latestMetricsRef.current = { metrics: update.rawMetrics, receivedAt: now }
    } else {
      clearObservedMetrics()
    }

    // Accumulate only once an active baseline exists.
    if (activeBaselineRef.current) {
      accumulator.record(update.state, now, {
        alertTriggered: update.alertTriggered
      })
    }

    setFeedback((prev) => {
      if (
        prev.state === update.state &&
        prev.feedbackMessageKey === update.feedbackMessageKey &&
        prev.deviatedMetric === update.deviatedMetric
      ) {
        return prev
      }
      return update
    })
  }, [paused, snapshot, clearObservedMetrics])

  const getSummaryInput = useCallback((): PostureSummarySubmission | null => {
    const baseline = activeBaselineRef.current
    const accumulator = accumulatorRef.current
    if (!baseline || !accumulator) return null
    return {
      ...accumulator.toSummaryInput(),
      framing_mode: baseline.framing.mode,
      method_version: METHOD_VERSION
    }
  }, [])

  return {
    feedback,
    observedMetrics:
      !paused && calibrationState.status === 'calibrated'
        ? observedMetrics
        : null,
    calibrationState,
    startCalibration,
    cancelCalibration,
    getSummaryInput,
    reset
  }
}
