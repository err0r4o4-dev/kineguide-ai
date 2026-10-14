import type { PoseLandmark } from './poseGeometry'
import { calculateSeatedMetrics, type RawSeatedMetrics } from './seatedMetrics'
import {
  evaluateAgainstBaseline,
  type PersonalBaseline,
  type PostureAlignmentEvaluation
} from './seatedCalibration'

export type PostureFeedbackState =
  | 'good_alignment'
  | 'needs_adjustment'
  | 'low_confidence'
  | 'unable_to_assess'
  | 'not_visible'
  | 'recalibration_recommended'

export interface PostureFeedbackUpdate {
  readonly state: PostureFeedbackState
  readonly feedbackMessageKey: string
  readonly deviatedMetric?: string
  readonly evaluation?: PostureAlignmentEvaluation
  readonly rawMetrics?: RawSeatedMetrics
}

export const SUSTAINED_DEVIATION_THRESHOLD_MS = 5000 // 5 seconds of sustained deviation to alert
export const REALIGNMENT_STABILITY_THRESHOLD_MS = 2000 // 2 seconds of good alignment to clear alert
export const DISCONNECT_RESET_THRESHOLD_MS = 2000 // 2 seconds of lost pose resets deviation timer

/**
 * Deterministic posture feedback engine implementing temporal smoothing, debounce,
 * and hysteresis over raw MediaPipe seated metrics relative to a personal baseline.
 *
 * This engine operates in-browser, is non-diagnostic, and does not require an LLM.
 */
export class PostureFeedbackEngine {
  private baseline: PersonalBaseline | null = null
  private currentState: PostureFeedbackState = 'unable_to_assess'
  private deviationStartTime: number | null = null
  private realignmentStartTime: number | null = null
  private lastPoseTime: number | null = null
  private lastDeviatedMetric: string | undefined

  public setBaseline(baseline: PersonalBaseline | null): void {
    this.baseline = baseline
    this.reset()
  }

  public getBaseline(): PersonalBaseline | null {
    return this.baseline
  }

  public reset(): void {
    this.currentState = this.baseline ? 'good_alignment' : 'unable_to_assess'
    this.deviationStartTime = null
    this.realignmentStartTime = null
    this.lastPoseTime = null
    this.lastDeviatedMetric = undefined
  }

  public update(
    landmarks: readonly PoseLandmark[] | null | undefined,
    timestamp: number = Date.now()
  ): PostureFeedbackUpdate {
    if (!landmarks || landmarks.length === 0) {
      if (
        this.lastPoseTime !== null &&
        timestamp - this.lastPoseTime > DISCONNECT_RESET_THRESHOLD_MS
      ) {
        this.deviationStartTime = null
        this.realignmentStartTime = null
        this.currentState = 'not_visible'
      }
      return {
        state: 'not_visible',
        feedbackMessageKey: 'session.poseMissing'
      }
    }

    this.lastPoseTime = timestamp

    if (!this.baseline) {
      this.currentState = 'unable_to_assess'
      return {
        state: 'unable_to_assess',
        feedbackMessageKey: 'session.noBaseline'
      }
    }

    const metricsResult = calculateSeatedMetrics(landmarks)
    if (metricsResult.status !== 'valid') {
      return {
        state: 'unable_to_assess',
        feedbackMessageKey: 'session.poseAdjust'
      }
    }

    const evaluation = evaluateAgainstBaseline(
      metricsResult.metrics,
      this.baseline,
      timestamp
    )

    if (evaluation.status === 'recalibration_recommended') {
      this.currentState = 'recalibration_recommended'
      return {
        state: 'recalibration_recommended',
        feedbackMessageKey:
          evaluation.reason === 'expired'
            ? 'calibration.expiredNotice'
            : 'calibration.framingShiftNotice',
        evaluation,
        rawMetrics: metricsResult.metrics
      }
    }

    // Temporal Debounce & Hysteresis Logic
    if (evaluation.status === 'needs_adjustment') {
      this.realignmentStartTime = null
      this.lastDeviatedMetric = evaluation.deviations[0]?.metric

      if (this.currentState === 'needs_adjustment') {
        // Already in alerted state, stay alerted
        return {
          state: 'needs_adjustment',
          feedbackMessageKey: `session.feedback.${this.lastDeviatedMetric ?? 'general'}`,
          deviatedMetric: this.lastDeviatedMetric,
          evaluation,
          rawMetrics: metricsResult.metrics
        }
      }

      // In good_alignment but detected deviation: debounce
      if (this.deviationStartTime === null) {
        this.deviationStartTime = timestamp
      }

      const deviationDuration = timestamp - this.deviationStartTime
      if (deviationDuration >= SUSTAINED_DEVIATION_THRESHOLD_MS) {
        this.currentState = 'needs_adjustment'
        return {
          state: 'needs_adjustment',
          feedbackMessageKey: `session.feedback.${this.lastDeviatedMetric ?? 'general'}`,
          deviatedMetric: this.lastDeviatedMetric,
          evaluation,
          rawMetrics: metricsResult.metrics
        }
      }

      // Transient deviation: remain in good_alignment until sustained duration threshold met
      return {
        state: 'good_alignment',
        feedbackMessageKey: 'session.goodAlignment',
        evaluation,
        rawMetrics: metricsResult.metrics
      }
    }

    // evaluation.status === 'good_alignment'
    this.deviationStartTime = null

    if (this.currentState === 'needs_adjustment') {
      // Hysteresis: user is returning to alignment, require stability window
      if (this.realignmentStartTime === null) {
        this.realignmentStartTime = timestamp
      }

      const realignmentDuration = timestamp - this.realignmentStartTime
      if (realignmentDuration >= REALIGNMENT_STABILITY_THRESHOLD_MS) {
        this.currentState = 'good_alignment'
        this.realignmentStartTime = null
        this.lastDeviatedMetric = undefined
        return {
          state: 'good_alignment',
          feedbackMessageKey: 'session.goodAlignment',
          evaluation,
          rawMetrics: metricsResult.metrics
        }
      }

      // Still in hysteresis recovery window
      return {
        state: 'needs_adjustment',
        feedbackMessageKey: `session.feedback.${this.lastDeviatedMetric ?? 'general'}`,
        deviatedMetric: this.lastDeviatedMetric,
        evaluation,
        rawMetrics: metricsResult.metrics
      }
    }

    this.currentState = 'good_alignment'
    this.realignmentStartTime = null
    this.lastDeviatedMetric = undefined

    return {
      state: 'good_alignment',
      feedbackMessageKey: 'session.goodAlignment',
      evaluation,
      rawMetrics: metricsResult.metrics
    }
  }
}
