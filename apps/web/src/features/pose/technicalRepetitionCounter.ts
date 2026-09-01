import type { PoseFrameStatus, PoseLandmark } from './poseGeometry'

export type TechnicalMovementPhase =
  'unavailable' | 'waiting' | 'lowered' | 'raised'

export interface TechnicalRepetitionResult {
  count: number
  phase: TechnicalMovementPhase
  available: boolean
}

export interface TechnicalRepetitionCounter {
  update(
    status: PoseFrameStatus,
    landmarks: readonly PoseLandmark[] | null
  ): TechnicalRepetitionResult
  reset(): void
}

const SUPPORTED_EXERCISE = 'arm-abduction-research-demo'

function visible(landmark: PoseLandmark | undefined) {
  return Boolean(
    landmark && Number.isFinite(landmark.y) && (landmark.visibility ?? 0) >= 0.5
  )
}

export function createTechnicalRepetitionCounter(
  exerciseSlug: string
): TechnicalRepetitionCounter {
  const available = exerciseSlug === SUPPORTED_EXERCISE
  let count = 0
  let phase: TechnicalMovementPhase = available ? 'waiting' : 'unavailable'
  let sawRaised = false

  return {
    update(status, landmarks) {
      if (!available) return { count, phase: 'unavailable', available: false }
      if (status !== 'ready' || !landmarks) {
        phase = 'waiting'
        sawRaised = false
        return { count, phase, available: true }
      }

      const leftShoulder = landmarks[11]
      const rightShoulder = landmarks[12]
      const leftWrist = landmarks[15]
      const rightWrist = landmarks[16]
      if (
        !visible(leftShoulder) ||
        !visible(rightShoulder) ||
        !visible(leftWrist) ||
        !visible(rightWrist)
      ) {
        phase = 'waiting'
        sawRaised = false
        return { count, phase, available: true }
      }

      // Image y grows downwards. This is a coarse observable phase transition,
      // not a clinical angle, quality score, or claim that form is correct.
      const isRaised =
        leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y
      const isLowered =
        leftWrist.y > leftShoulder.y && rightWrist.y > rightShoulder.y

      if (isRaised) {
        phase = 'raised'
        sawRaised = true
      } else if (isLowered) {
        if (sawRaised) count += 1
        phase = 'lowered'
        sawRaised = false
      }
      return { count, phase, available: true }
    },
    reset() {
      count = 0
      phase = available ? 'waiting' : 'unavailable'
      sawRaised = false
    }
  }
}
