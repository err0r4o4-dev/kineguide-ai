import type { PoseLandmark } from './poseGeometry'
import { TECHNICAL_VISIBILITY_GATE } from './poseGeometry'

export type FramingErrorReason =
  | 'too_close'
  | 'too_far'
  | 'not_facing_camera'
  | 'camera_tilted'
  | 'head_cropped'
  | 'insufficient_landmarks'

export type FramingStatus =
  | { readonly status: 'ok' }
  | {
      readonly status: 'error'
      readonly reason: FramingErrorReason
      readonly messageKey: string
    }

export const MIN_SHOULDER_WIDTH = 0.12
export const MAX_SHOULDER_WIDTH = 0.65
export const MAX_CAMERA_TILT_DEGREES = 25
export const MIN_HEAD_TOP_Y = 0.03
export const MAX_FACIAL_ASYMMETRY_RATIO = 0.55

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

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Validates whether the user's position and camera angle/distance are technically
 * suitable for reliable seated posture observation.
 *
 * Checks:
 * 1. Landmark visibility of head and shoulders (0, 2, 5, 11, 12)
 * 2. Head cropping at the top of the frame (pitch)
 * 3. Distance: too close (> 65% width) or too far (< 12% width)
 * 4. Facial symmetry: user facing front rather than turned sideways (yaw)
 * 5. Level alignment: camera or resting shoulder slope tilt (roll > 18 deg)
 *
 * This provides technical camera framing feedback and makes no medical diagnosis.
 */
export function checkCameraFraming(
  landmarks: readonly PoseLandmark[] | null | undefined
): FramingStatus {
  if (!landmarks || landmarks.length === 0) {
    return {
      status: 'error',
      reason: 'insufficient_landmarks',
      messageKey: 'session.poseMissing'
    }
  }

  const nose = landmarks[0]
  const leftEye = landmarks[2]
  const rightEye = landmarks[5]
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]

  if (
    !isValidLandmark(nose) ||
    !isValidLandmark(leftEye) ||
    !isValidLandmark(rightEye) ||
    !isValidLandmark(leftShoulder) ||
    !isValidLandmark(rightShoulder)
  ) {
    return {
      status: 'error',
      reason: 'insufficient_landmarks',
      messageKey: 'session.poseAdjust'
    }
  }

  // 1. Head cropped at top of frame
  if (
    nose.y < MIN_HEAD_TOP_Y ||
    leftEye.y < MIN_HEAD_TOP_Y ||
    rightEye.y < MIN_HEAD_TOP_Y
  ) {
    return {
      status: 'error',
      reason: 'head_cropped',
      messageKey: 'camera.headCropped'
    }
  }

  // 2. Distance: shoulder width relative to frame
  const shoulderDx = rightShoulder.x - leftShoulder.x
  const shoulderDy = rightShoulder.y - leftShoulder.y
  const shoulderWidth = Math.hypot(shoulderDx, shoulderDy)

  if (shoulderWidth > MAX_SHOULDER_WIDTH) {
    return {
      status: 'error',
      reason: 'too_close',
      messageKey: 'camera.tooClose'
    }
  }

  if (shoulderWidth < MIN_SHOULDER_WIDTH) {
    return {
      status: 'error',
      reason: 'too_far',
      messageKey: 'camera.tooFar'
    }
  }

  // 3. Camera or body severe tilt (roll)
  const shoulderSlope = Math.abs(toDegrees(Math.atan2(shoulderDy, shoulderDx)))
  if (shoulderSlope > MAX_CAMERA_TILT_DEGREES) {
    return {
      status: 'error',
      reason: 'camera_tilted',
      messageKey: 'camera.tilted'
    }
  }

  // 4. Facing angle / Yaw (user turned sideways)
  const eyeDx = rightEye.x - leftEye.x
  const eyeDy = rightEye.y - leftEye.y
  const eyeWidth = Math.hypot(eyeDx, eyeDy)

  if (eyeWidth > 0.01) {
    const leftDist = Math.abs(nose.x - leftEye.x)
    const rightDist = Math.abs(rightEye.x - nose.x)
    const asymmetry = Math.abs(leftDist - rightDist) / eyeWidth

    if (asymmetry > MAX_FACIAL_ASYMMETRY_RATIO) {
      return {
        status: 'error',
        reason: 'not_facing_camera',
        messageKey: 'camera.notFacingCamera'
      }
    }
  }

  return { status: 'ok' }
}
