import type { PoseLandmark } from './poseGeometry'
import { TECHNICAL_VISIBILITY_GATE } from './poseGeometry'

export interface RawSeatedMetrics {
  readonly shoulderSlopeDegrees: number
  readonly headTiltDegrees: number
  readonly torsoInclinationDegrees: number
  readonly eyeShoulderDistanceRatio: number
  readonly shoulderWidth: number
}

export type SeatedMetricsResult =
  | {
      readonly status: 'valid'
      readonly metrics: RawSeatedMetrics
    }
  | {
      readonly status: 'insufficient_landmarks'
      readonly missingIndices: readonly number[]
    }
  | {
      readonly status: 'invalid_coordinates'
    }

export const SEATED_METRICS_REQUIRED_LANDMARKS = [
  0, 2, 5, 11, 12, 23, 24
] as const

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

function isValidLandmark(
  landmark: PoseLandmark | undefined
): landmark is PoseLandmark {
  if (!landmark) return false
  return (
    Number.isFinite(landmark.x) &&
    Number.isFinite(landmark.y) &&
    landmark.x >= 0 &&
    landmark.x <= 1 &&
    landmark.y >= 0 &&
    landmark.y <= 1 &&
    (landmark.visibility ?? 1) >= TECHNICAL_VISIBILITY_GATE
  )
}

/**
 * Calculates deterministic observational posture metrics for a seated individual
 * from normalized MediaPipe pose landmarks.
 *
 * This function returns observational geometry only and makes no medical diagnosis
 * or universal correctness judgment.
 */
export function calculateSeatedMetrics(
  landmarks: readonly PoseLandmark[] | null | undefined
): SeatedMetricsResult {
  if (!landmarks || landmarks.length === 0) {
    return {
      status: 'insufficient_landmarks',
      missingIndices: [...SEATED_METRICS_REQUIRED_LANDMARKS]
    }
  }

  const missingIndices: number[] = []
  for (const index of SEATED_METRICS_REQUIRED_LANDMARKS) {
    if (!isValidLandmark(landmarks[index])) {
      missingIndices.push(index)
    }
  }

  if (missingIndices.length > 0) {
    return {
      status: 'insufficient_landmarks',
      missingIndices
    }
  }

  const leftEye = landmarks[2]
  const rightEye = landmarks[5]
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftHip = landmarks[23]
  const rightHip = landmarks[24]

  const shoulderDx = rightShoulder.x - leftShoulder.x
  const shoulderDy = rightShoulder.y - leftShoulder.y
  const shoulderWidth = Math.hypot(shoulderDx, shoulderDy)

  if (shoulderWidth < 0.02) {
    return { status: 'invalid_coordinates' }
  }

  // 1. Shoulder slope: angle relative to horizontal plane
  // Normalized so 0 = level, positive/negative represents tilt.
  const shoulderAngle = toDegrees(Math.atan2(shoulderDy, shoulderDx))
  const shoulderSlopeDegrees = Number(shoulderAngle.toFixed(2))

  // 2. Head tilt: use ears (7, 8) if visible; otherwise fallback to eyes (2, 5)
  const leftEar = landmarks[7]
  const rightEar = landmarks[8]
  const useEars = isValidLandmark(leftEar) && isValidLandmark(rightEar)

  const headDx = useEars ? rightEar.x - leftEar.x : rightEye.x - leftEye.x
  const headDy = useEars ? rightEar.y - leftEar.y : rightEye.y - leftEye.y
  const headAngle = toDegrees(Math.atan2(headDy, headDx))
  const headTiltDegrees = Number(headAngle.toFixed(2))

  // 3. Torso inclination: midpoint of shoulders vs midpoint of hips relative to vertical
  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2
  const midHipX = (leftHip.x + rightHip.x) / 2
  const midHipY = (leftHip.y + rightHip.y) / 2

  const torsoDx = midShoulderX - midHipX
  const torsoDy = midHipY - midShoulderY // In image coordinates, hip Y > shoulder Y

  if (torsoDy <= 0) {
    // Shoulders below or level with hips indicates non-seated or inverted posture
    return { status: 'invalid_coordinates' }
  }

  const torsoInclination = toDegrees(Math.atan2(Math.abs(torsoDx), torsoDy))
  const torsoInclinationDegrees = Number(torsoInclination.toFixed(2))

  // 4. Eye to shoulder ratio: distance between eye midpoint and shoulder midpoint normalized by shoulder width
  const midEyeX = (leftEye.x + rightEye.x) / 2
  const midEyeY = (leftEye.y + rightEye.y) / 2
  const eyeToShoulderDist = Math.hypot(
    midEyeX - midShoulderX,
    midEyeY - midShoulderY
  )
  const eyeShoulderDistanceRatio = Number(
    (eyeToShoulderDist / shoulderWidth).toFixed(3)
  )

  return {
    status: 'valid',
    metrics: {
      shoulderSlopeDegrees,
      headTiltDegrees,
      torsoInclinationDegrees,
      eyeShoulderDistanceRatio,
      shoulderWidth: Number(shoulderWidth.toFixed(4))
    }
  }
}
