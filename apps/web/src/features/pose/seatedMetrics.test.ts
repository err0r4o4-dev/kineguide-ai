import type { PoseLandmark } from './poseGeometry'
import { calculateSeatedMetrics } from './seatedMetrics'

function createSyntheticPose(
  overrides: Partial<Record<number, Partial<PoseLandmark>>> = {}
): PoseLandmark[] {
  // A standard upright seated posture fixture
  const base: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.95
  }))

  // Nose
  base[0] = { x: 0.5, y: 0.2, z: 0, visibility: 0.95 }
  // Eyes
  base[2] = { x: 0.48, y: 0.18, z: 0, visibility: 0.95 } // Left eye
  base[5] = { x: 0.52, y: 0.18, z: 0, visibility: 0.95 } // Right eye
  // Ears
  base[7] = { x: 0.45, y: 0.19, z: 0, visibility: 0.95 } // Left ear
  base[8] = { x: 0.55, y: 0.19, z: 0, visibility: 0.95 } // Right ear
  // Shoulders (horizontal line, width = 0.2)
  base[11] = { x: 0.4, y: 0.35, z: 0, visibility: 0.95 } // Left shoulder
  base[12] = { x: 0.6, y: 0.35, z: 0, visibility: 0.95 } // Right shoulder
  // Hips (horizontal line, centered below shoulders)
  base[23] = { x: 0.42, y: 0.65, z: 0, visibility: 0.95 } // Left hip
  base[24] = { x: 0.58, y: 0.65, z: 0, visibility: 0.95 } // Right hip

  for (const [indexStr, override] of Object.entries(overrides)) {
    const idx = Number(indexStr)
    base[idx] = { ...base[idx], ...override }
  }

  return base
}

describe('seatedMetrics', () => {
  it('calculates deterministic metrics for valid upright seated pose', () => {
    const landmarks = createSyntheticPose()
    const result = calculateSeatedMetrics(landmarks)

    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return

    expect(result.metrics.shoulderSlopeDegrees).toBe(0)
    expect(result.metrics.headTiltDegrees).toBe(0)
    expect(result.metrics.torsoInclinationDegrees).toBe(0)
    expect(result.metrics.shoulderWidth).toBeCloseTo(0.2, 2)
    expect(result.metrics.eyeShoulderDistanceRatio).toBeGreaterThan(0)
  })

  it('detects shoulder slope tilt correctly', () => {
    // Right shoulder higher than left shoulder (lower y in image space)
    const landmarks = createSyntheticPose({
      12: { x: 0.6, y: 0.32, visibility: 0.95 }
    })
    const result = calculateSeatedMetrics(landmarks)

    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return

    // dy = 0.32 - 0.35 = -0.03, dx = 0.2
    expect(result.metrics.shoulderSlopeDegrees).toBeLessThan(0)
  })

  it('detects torso inclination when leaning forward or sideways', () => {
    // Shoulders shifted forward/right
    const landmarks = createSyntheticPose({
      11: { x: 0.45, y: 0.35, visibility: 0.95 },
      12: { x: 0.65, y: 0.35, visibility: 0.95 }
    })
    const result = calculateSeatedMetrics(landmarks)

    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return

    expect(result.metrics.torsoInclinationDegrees).toBeGreaterThan(0)
  })

  it('returns insufficient_landmarks if any required landmark is missing or low confidence', () => {
    const landmarks = createSyntheticPose({
      11: { x: 0.4, y: 0.35, visibility: 0.3 } // visibility below gate
    })
    const result = calculateSeatedMetrics(landmarks)

    expect(result.status).toBe('insufficient_landmarks')
    if (result.status === 'insufficient_landmarks') {
      expect(result.missingIndices).toContain(11)
    }
  })

  it('rejects non-finite landmark coordinates (NaN or Infinity)', () => {
    const landmarks = createSyntheticPose({
      23: { x: NaN, y: 0.65, visibility: 0.95 }
    })
    const result = calculateSeatedMetrics(landmarks)

    expect(result.status).toBe('insufficient_landmarks')
    if (result.status === 'insufficient_landmarks') {
      expect(result.missingIndices).toContain(23)
    }
  })

  it('rejects out of range landmark coordinates (< 0 or > 1)', () => {
    const landmarks = createSyntheticPose({
      12: { x: 1.1, y: 0.35, visibility: 0.95 }
    })
    const result = calculateSeatedMetrics(landmarks)

    expect(result.status).toBe('insufficient_landmarks')
  })

  it('returns invalid_coordinates when shoulders are collapsed or inverted below hips', () => {
    // Inverted: shoulders below hips
    const landmarks = createSyntheticPose({
      11: { x: 0.4, y: 0.75, visibility: 0.95 },
      12: { x: 0.6, y: 0.75, visibility: 0.95 },
      23: { x: 0.4, y: 0.55, visibility: 0.95 },
      24: { x: 0.6, y: 0.55, visibility: 0.95 }
    })
    const result = calculateSeatedMetrics(landmarks)

    expect(result.status).toBe('invalid_coordinates')
  })

  it('handles null or empty landmarks safely', () => {
    expect(calculateSeatedMetrics(null).status).toBe('insufficient_landmarks')
    expect(calculateSeatedMetrics([]).status).toBe('insufficient_landmarks')
  })
})
