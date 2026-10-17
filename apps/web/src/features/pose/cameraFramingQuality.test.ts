import type { PoseLandmark } from './poseGeometry'
import { checkCameraFraming } from './cameraFramingQuality'

function createSyntheticPose(
  overrides: Partial<Record<number, Partial<PoseLandmark>>> = {}
): PoseLandmark[] {
  const base: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.95
  }))

  // Nose (centered)
  base[0] = { x: 0.5, y: 0.2, z: 0, visibility: 0.95 }
  // Eyes (symmetric)
  base[2] = { x: 0.46, y: 0.18, z: 0, visibility: 0.95 } // Left eye
  base[5] = { x: 0.54, y: 0.18, z: 0, visibility: 0.95 } // Right eye
  // Ears
  base[7] = { x: 0.42, y: 0.19, z: 0, visibility: 0.95 }
  base[8] = { x: 0.58, y: 0.19, z: 0, visibility: 0.95 }
  // Shoulders (centered, width = 0.28)
  base[11] = { x: 0.36, y: 0.38, z: 0, visibility: 0.95 }
  base[12] = { x: 0.64, y: 0.38, z: 0, visibility: 0.95 }

  for (const [indexStr, override] of Object.entries(overrides)) {
    base[Number(indexStr)] = { ...base[Number(indexStr)], ...override }
  }

  return base
}

describe('cameraFramingQuality', () => {
  it('returns ok for a well-framed, centered, facing-front user', () => {
    const result = checkCameraFraming(createSyntheticPose())
    expect(result.status).toBe('ok')
  })

  it('detects when user is too close to camera (excessive shoulder width)', () => {
    // Shoulders fill > 65% of screen width (width = 0.76)
    const landmarks = createSyntheticPose({
      11: { x: 0.12, y: 0.38 },
      12: { x: 0.88, y: 0.38 }
    })
    const result = checkCameraFraming(landmarks)
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.reason).toBe('too_close')
      expect(result.messageKey).toBe('camera.tooClose')
    }
  })

  it('detects when user is too far from camera (tiny shoulder width)', () => {
    // Shoulders fill < 12% of screen width (width = 0.08)
    const landmarks = createSyntheticPose({
      11: { x: 0.46, y: 0.38 },
      12: { x: 0.54, y: 0.38 }
    })
    const result = checkCameraFraming(landmarks)
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.reason).toBe('too_far')
      expect(result.messageKey).toBe('camera.tooFar')
    }
  })

  it('detects when user is turned sideways (not facing camera)', () => {
    // User rotated: nose shifted way towards one side relative to eyes
    // Left eye at 0.49, nose at 0.49, right eye at 0.58 (yaw > 35 degrees)
    const landmarks = createSyntheticPose({
      0: { x: 0.49, y: 0.2 },
      2: { x: 0.49, y: 0.18 },
      5: { x: 0.58, y: 0.18 }
    })
    const result = checkCameraFraming(landmarks)
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.reason).toBe('not_facing_camera')
      expect(result.messageKey).toBe('camera.notFacingCamera')
    }
  })

  it('detects when camera angle is tilted sideways (roll > 25 degrees)', () => {
    // One shoulder significantly higher than the other (dx = 0.28, dy = 0.16 -> ~30 degrees)
    const landmarks = createSyntheticPose({
      11: { x: 0.36, y: 0.46 },
      12: { x: 0.64, y: 0.3 }
    })
    const result = checkCameraFraming(landmarks)
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.reason).toBe('camera_tilted')
      expect(result.messageKey).toBe('camera.tilted')
    }
  })

  it('detects when head is cropped out of top of frame (nose/eye y < 0.03)', () => {
    const landmarks = createSyntheticPose({
      0: { x: 0.5, y: 0.01 },
      2: { x: 0.46, y: 0.01 },
      5: { x: 0.54, y: 0.01 }
    })
    const result = checkCameraFraming(landmarks)
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.reason).toBe('head_cropped')
      expect(result.messageKey).toBe('camera.headCropped')
    }
  })

  it('handles null, empty, or insufficient landmarks gracefully', () => {
    expect(checkCameraFraming(null).status).toBe('error')
    expect(checkCameraFraming([]).status).toBe('error')
  })
})
