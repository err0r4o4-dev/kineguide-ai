import type { PoseFrameStatus, PoseLandmark } from './poseGeometry'

export type MovementState = 'UNAVAILABLE'

export interface StateRepetitionResult {
  count: number
  state: MovementState
  currentAngle: number | null
  targetPeakAngle: number | null
  repProgressPercent: number // 0 - 100%
  available: boolean
  reason: 'clinician_rule_required'
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
  // Activity-specific counting stays disabled until a versioned clinician rule exists.
  void exerciseSlug

  return {
    update(): StateRepetitionResult {
      return {
        count: 0,
        state: 'UNAVAILABLE',
        currentAngle: null,
        targetPeakAngle: null,
        repProgressPercent: 0,
        available: false,
        reason: 'clinician_rule_required'
      }
    },
    reset() {}
  }
}
