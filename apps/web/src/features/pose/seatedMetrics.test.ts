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
  it.each([
    { width: 640, height: 480 },
    { width: 1280, height: 720 }
  ])('uses image-plane geometry for $width x $height frames', (frame) => {
    const aspect = frame.width / frame.height
    const landmarks = createSyntheticPose({
      2: { x: 0.45, y: 0.1 },
      5: { x: 0.55, y: 0.1 },
      7: { x: 0.45, y: 0.15 },
      8: { x: 0.55, y: 0.15 + 0.1 * aspect },
      11: { x: 0.4, y: 0.4 },
      12: { x: 0.6, y: 0.4 + 0.2 * aspect },
      23: { x: 0.25, y: 0.4 + 0.25 * aspect },
      24: { x: 0.45, y: 0.4 + 0.25 * aspect }
    })
    const result = calculateSeatedMetrics(landmarks, frame)
    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return
    expect(result.metrics.shoulderSlopeDegrees).toBe(45)
    expect(result.metrics.headTiltDegrees).toBe(45)
    expect(result.metrics.torsoInclinationDegrees).toBe(45)
  })

  it('corrects vertical distances without changing the input landmarks', () => {
    const landmarks = createSyntheticPose({
      2: { y: 0.15 },
      5: { y: 0.15 }
    })
    const original = structuredClone(landmarks)
    const result = calculateSeatedMetrics(landmarks, {
      width: 640,
      height: 480
    })
    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return
    expect(result.metrics.eyeShoulderDistanceRatio).toBe(0.75)
    expect(result.metrics.shoulderWidth).toBe(0.2)
    expect(landmarks).toEqual(original)
  })

  it.each([
    { width: 0, height: 480 },
    { width: 640, height: -1 },
    { width: Number.NaN, height: 480 },
    { width: 640, height: Number.POSITIVE_INFINITY },
    { width: 640.5, height: 480 }
  ])('rejects unusable frame dimensions: %j', (frame) => {
    expect(calculateSeatedMetrics(createSyntheticPose(), frame).status).toBe(
      'invalid_coordinates'
    )
  })

  it('keeps hidden hips unavailable with explicit frame dimensions', () => {
    const result = calculateSeatedMetrics(
      createSyntheticPose({ 23: { visibility: 0.1 }, 24: { visibility: 0.1 } }),
      { width: 640, height: 480 }
    )
    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return
    expect(result.metrics.torsoInclinationDegrees).toBeNull()
    expect(result.metrics.framingMode).toBe('upper_body')
  })

  it('preserves signed image-line orientation when the image is mirrored', () => {
    const landmarks = createSyntheticPose({
      7: { x: 0.45, y: 0.15 },
      8: { x: 0.55, y: 0.15 + 0.1 * (4 / 3) },
      11: { x: 0.4, y: 0.35 },
      12: { x: 0.6, y: 0.35 + 0.2 * (4 / 3) }
    }).map((landmark) => ({ ...landmark, x: 1 - landmark.x }))
    const result = calculateSeatedMetrics(landmarks, {
      width: 640,
      height: 480
    })
    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return
    expect(result.metrics.shoulderSlopeDegrees).toBe(-45)
    expect(result.metrics.headTiltDegrees).toBe(-45)
  })

  it('preserves the legacy calculation on square images', () => {
    const landmarks = createSyntheticPose({ 12: { y: 0.4 } })
    expect(
      calculateSeatedMetrics(landmarks, { width: 640, height: 640 })
    ).toEqual(calculateSeatedMetrics(landmarks))
  })

  it('corrects eye-line fallback when ears are hidden', () => {
    const landmarks = createSyntheticPose({
      2: { x: 0.45, y: 0.15 },
      5: { x: 0.55, y: 0.15 + 0.1 * (4 / 3) },
      7: { visibility: 0.1 },
      8: { visibility: 0.1 }
    })
    const result = calculateSeatedMetrics(landmarks, {
      width: 640,
      height: 480
    })
    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return
    expect(result.metrics.headTiltDegrees).toBe(45)
  })

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
    expect(result.metrics.forwardHeadRatio).toBeGreaterThan(0)
  })

  it('detects forward head magnification when face leans closer to camera', () => {
    const normal = calculateSeatedMetrics(createSyntheticPose())
    // Eyes spread wider relative to shoulders as face approaches camera
    const leaningForward = calculateSeatedMetrics(
      createSyntheticPose({
        2: { x: 0.45, y: 0.18 },
        5: { x: 0.55, y: 0.18 }
      })
    )

    expect(normal.status).toBe('valid')
    expect(leaningForward.status).toBe('valid')
    if (normal.status !== 'valid' || leaningForward.status !== 'valid') return

    expect(leaningForward.metrics.forwardHeadRatio).toBeGreaterThan(
      normal.metrics.forwardHeadRatio
    )
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

  it('rejects non-finite required landmark coordinates (NaN or Infinity)', () => {
    const landmarks = createSyntheticPose({
      11: { x: NaN, y: 0.35, visibility: 0.95 }
    })
    const result = calculateSeatedMetrics(landmarks)

    expect(result.status).toBe('insufficient_landmarks')
    if (result.status === 'insufficient_landmarks') {
      expect(result.missingIndices).toContain(11)
    }
  })

  it('reports full_torso framing when both hips are reliable', () => {
    const result = calculateSeatedMetrics(createSyntheticPose())

    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return
    expect(result.metrics.framingMode).toBe('full_torso')
  })

  it('assesses upper-body framing when hips are hidden by a desk', () => {
    const landmarks = createSyntheticPose({
      23: { visibility: 0.1 },
      24: { visibility: 0.1 }
    })
    const result = calculateSeatedMetrics(landmarks)

    expect(result.status).toBe('valid')
    if (result.status !== 'valid') return
    expect(result.metrics.framingMode).toBe('upper_body')
    expect(result.metrics.torsoInclinationDegrees).toBeNull()
    expect(result.metrics.shoulderSlopeDegrees).toBe(0)
    expect(result.metrics.eyeShoulderDistanceRatio).toBeGreaterThan(0)
  })

  it('falls back to upper_body when only one hip or a non-finite hip is available', () => {
    const oneHip = calculateSeatedMetrics(
      createSyntheticPose({ 24: { visibility: 0.2 } })
    )
    const nanHip = calculateSeatedMetrics(
      createSyntheticPose({ 23: { x: NaN } })
    )

    for (const result of [oneHip, nanHip]) {
      expect(result.status).toBe('valid')
      if (result.status !== 'valid') continue
      expect(result.metrics.framingMode).toBe('upper_body')
      expect(result.metrics.torsoInclinationDegrees).toBeNull()
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
