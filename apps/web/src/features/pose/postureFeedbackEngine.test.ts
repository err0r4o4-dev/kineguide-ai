import type { PoseLandmark } from './poseGeometry'
import {
  buildPersonalBaseline,
  type PersonalBaseline
} from './seatedCalibration'
import {
  PostureFeedbackEngine,
  SUSTAINED_DEVIATION_THRESHOLD_MS,
  REALIGNMENT_STABILITY_THRESHOLD_MS
} from './postureFeedbackEngine'

function createSyntheticPose(
  overrides: Partial<Record<number, Partial<PoseLandmark>>> = {}
): PoseLandmark[] {
  const base: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.95
  }))
  base[0] = { x: 0.5, y: 0.2, z: 0, visibility: 0.95 }
  base[2] = { x: 0.48, y: 0.18, z: 0, visibility: 0.95 }
  base[5] = { x: 0.52, y: 0.18, z: 0, visibility: 0.95 }
  base[7] = { x: 0.45, y: 0.19, z: 0, visibility: 0.95 }
  base[8] = { x: 0.55, y: 0.19, z: 0, visibility: 0.95 }
  base[11] = { x: 0.4, y: 0.35, z: 0, visibility: 0.95 }
  base[12] = { x: 0.6, y: 0.35, z: 0, visibility: 0.95 }
  base[23] = { x: 0.42, y: 0.65, z: 0, visibility: 0.95 }
  base[24] = { x: 0.58, y: 0.65, z: 0, visibility: 0.95 }

  for (const [indexStr, override] of Object.entries(overrides)) {
    const idx = Number(indexStr)
    base[idx] = { ...base[idx], ...override }
  }

  return base
}

describe('PostureFeedbackEngine', () => {
  let engine: PostureFeedbackEngine
  let baseline: PersonalBaseline

  beforeEach(() => {
    engine = new PostureFeedbackEngine()
    const baselineSamples = Array.from({ length: 20 }, () => ({
      shoulderSlopeDegrees: 0,
      headTiltDegrees: 0,
      torsoInclinationDegrees: 0,
      eyeShoulderDistanceRatio: 0.8,
      shoulderWidth: 0.2
    }))
    baseline = buildPersonalBaseline(baselineSamples, 1000000)!
  })

  it('reports unable_to_assess when no baseline is set', () => {
    const freshEngine = new PostureFeedbackEngine()
    const result = freshEngine.update(createSyntheticPose(), 1000000)

    expect(result.state).toBe('unable_to_assess')
    expect(result.feedbackMessageKey).toBe('session.noBaseline')
  })

  it('reports not_visible when no landmarks are provided', () => {
    engine.setBaseline(baseline)
    const result = engine.update(null, 1000000)

    expect(result.state).toBe('not_visible')
  })

  it('remains in good_alignment during normal movement within baseline', () => {
    engine.setBaseline(baseline)
    const pose = createSyntheticPose()
    const result = engine.update(pose, 1000000)

    expect(result.state).toBe('good_alignment')
    expect(result.feedbackMessageKey).toBe('session.goodAlignment')
  })

  it('debounces transient posture deviation without triggering immediate alert', () => {
    engine.setBaseline(baseline)

    // Initial good alignment
    engine.update(createSyntheticPose(), 1000000)

    // Tilted pose (deviation) starts at t = 1001000
    const tiltedPose = createSyntheticPose({
      12: { x: 0.6, y: 0.28, visibility: 0.95 } // heavy shoulder tilt
    })

    // First frame of deviation (1 second into deviation)
    const immediateResult = engine.update(tiltedPose, 1001000)
    // Should NOT immediately alert; should remain good_alignment due to debounce
    expect(immediateResult.state).toBe('good_alignment')

    // At 4 seconds (under threshold of 5000ms)
    const midResult = engine.update(
      tiltedPose,
      1001000 + SUSTAINED_DEVIATION_THRESHOLD_MS - 500
    )
    expect(midResult.state).toBe('good_alignment')

    // At 5+ seconds (exceeded threshold)
    const sustainedResult = engine.update(
      tiltedPose,
      1001000 + SUSTAINED_DEVIATION_THRESHOLD_MS + 100
    )
    expect(sustainedResult.state).toBe('needs_adjustment')
    expect(sustainedResult.deviatedMetric).toBe('shoulderSlopeDegrees')
  })

  it('applies hysteresis before returning from needs_adjustment to good_alignment', () => {
    engine.setBaseline(baseline)
    const tiltedPose = createSyntheticPose({
      12: { x: 0.6, y: 0.28, visibility: 0.95 }
    })
    const normalPose = createSyntheticPose()

    // Trigger needs_adjustment
    engine.update(tiltedPose, 1000000)
    engine.update(tiltedPose, 1000000 + SUSTAINED_DEVIATION_THRESHOLD_MS + 200)

    // User moves back to good posture for only 500ms (less than 2000ms stability threshold)
    const quickRealign = engine.update(
      normalPose,
      1000000 + SUSTAINED_DEVIATION_THRESHOLD_MS + 700
    )
    // Should still be needs_adjustment due to hysteresis
    expect(quickRealign.state).toBe('needs_adjustment')

    // User maintains good posture for full 2000ms stability window
    const stableRealign = engine.update(
      normalPose,
      1000000 +
        SUSTAINED_DEVIATION_THRESHOLD_MS +
        700 +
        REALIGNMENT_STABILITY_THRESHOLD_MS +
        100
    )
    expect(stableRealign.state).toBe('good_alignment')
  })

  it('resets posture evaluation when landmarks are lost for longer than disconnect grace period', () => {
    engine.setBaseline(baseline)
    const tiltedPose = createSyntheticPose({
      12: { x: 0.6, y: 0.28, visibility: 0.95 }
    })

    // Sustained deviation
    engine.update(tiltedPose, 1000000)
    engine.update(tiltedPose, 1000000 + SUSTAINED_DEVIATION_THRESHOLD_MS + 200)

    // Person steps away for 3 seconds
    const lostResult = engine.update(
      null,
      1000000 + SUSTAINED_DEVIATION_THRESHOLD_MS + 3500
    )
    expect(lostResult.state).toBe('not_visible')

    // Person returns in good alignment
    const returnResult = engine.update(
      createSyntheticPose(),
      1000000 + SUSTAINED_DEVIATION_THRESHOLD_MS + 4000
    )
    expect(returnResult.state).toBe('good_alignment')
  })
})
