import type { PoseFrameStatus, PoseLandmark } from './poseGeometry'
import type { JointName } from './exerciseFeatures'
import { extractJointAngles } from './exerciseFeatures'
import { getExerciseConfig } from './referenceMovementModel'

export type MovementState =
  | 'REST'
  | 'START'
  | 'MOVING'
  | 'PEAK'
  | 'RETURN'
  | 'COMPLETED'

export interface StateRepetitionResult {
  count: number
  state: MovementState
  currentAngle: number | null
  targetPeakAngle: number | null
  repProgressPercent: number // 0 - 100%
  available: boolean
}

export interface TechnicalRepetitionCounter {
  update(
    status: PoseFrameStatus,
    landmarks: readonly PoseLandmark[] | null
  ): StateRepetitionResult
  reset(): void
}

export function createTechnicalRepetitionCounter(
  exerciseSlug: string
): TechnicalRepetitionCounter {
  const config = getExerciseConfig(exerciseSlug)
  const available = Boolean(config.repCounting?.enabled)
  const repConfig = config.repCounting

  let count = 0
  let state: MovementState = 'REST'
  let repProgress = 0

  const primaryJoint: JointName = repConfig?.primaryJoint || 'leftShoulder'
  const restAngle = repConfig?.restAngle ?? 30
  const peakAngle = repConfig?.peakAngle ?? 90
  const threshold = repConfig?.threshold ?? 15
  const isIncreasing = peakAngle > restAngle

  return {
    update(status, landmarks): StateRepetitionResult {
      if (!available || !repConfig) {
        return {
          count,
          state: 'REST',
          currentAngle: null,
          targetPeakAngle: null,
          repProgressPercent: 0,
          available: false
        }
      }

      if (status !== 'ready' || !landmarks || landmarks.length < 33) {
        return {
          count,
          state,
          currentAngle: null,
          targetPeakAngle: peakAngle,
          repProgressPercent: repProgress,
          available: true
        }
      }

      const angles = extractJointAngles(landmarks)
      const currentAngle = angles[primaryJoint]

      if (currentAngle === undefined || !Number.isFinite(currentAngle)) {
        return {
          count,
          state,
          currentAngle: null,
          targetPeakAngle: peakAngle,
          repProgressPercent: repProgress,
          available: true
        }
      }

      // Calculate progress percentage between restAngle and peakAngle
      const totalSpan = Math.abs(peakAngle - restAngle) || 1
      const currentSpan = Math.abs(currentAngle - restAngle)
      repProgress = Math.max(0, Math.min(100, Math.round((currentSpan / totalSpan) * 100)))

      const isAtRest = Math.abs(currentAngle - restAngle) <= threshold
      const reachedPeak = isIncreasing
        ? currentAngle >= peakAngle - threshold
        : currentAngle <= peakAngle + threshold

      // State machine logic: REST -> START -> MOVING -> PEAK -> RETURN -> COMPLETED -> REST
      switch (state) {
        case 'REST': {
          if (!isAtRest) {
            state = reachedPeak ? 'PEAK' : 'MOVING'
          }
          break
        }
        case 'START':
        case 'MOVING': {
          if (reachedPeak) {
            state = 'PEAK'
          } else if (isAtRest) {
            state = 'REST'
          }
          break
        }
        case 'PEAK': {
          if (!reachedPeak) {
            state = 'RETURN'
            if (isAtRest) {
              count += 1
              state = 'COMPLETED'
            }
          }
          break
        }
        case 'RETURN': {
          if (isAtRest) {
            count += 1
            state = 'COMPLETED'
          }
          break
        }
        case 'COMPLETED': {
          state = isAtRest ? 'REST' : 'MOVING'
          break
        }
      }

      return {
        count,
        state,
        currentAngle,
        targetPeakAngle: peakAngle,
        repProgressPercent: repProgress,
        available: true
      }
    },

    reset() {
      count = 0
      state = 'REST'
      repProgress = 0
    }
  }
}
