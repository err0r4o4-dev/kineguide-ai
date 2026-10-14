import type { RawSeatedMetrics } from './seatedMetrics'
import {
  buildPersonalBaseline,
  evaluateAgainstBaseline,
  MIN_CALIBRATION_SAMPLES,
  BASELINE_MAX_AGE_MS
} from './seatedCalibration'

function createSample(
  overrides: Partial<RawSeatedMetrics> = {}
): RawSeatedMetrics {
  return {
    shoulderSlopeDegrees: 0,
    headTiltDegrees: 0,
    torsoInclinationDegrees: 0,
    eyeShoulderDistanceRatio: 0.8,
    shoulderWidth: 0.2,
    ...overrides
  }
}

describe('seatedCalibration', () => {
  it('returns null when sample count is less than minimum', () => {
    const samples = Array.from({ length: MIN_CALIBRATION_SAMPLES - 1 }, () =>
      createSample()
    )
    expect(buildPersonalBaseline(samples)).toBeNull()
  })

  it('builds a personal baseline from sufficient samples', () => {
    const samples = Array.from({ length: 20 }, (_, i) =>
      createSample({
        shoulderSlopeDegrees: (i % 3) - 1, // -1, 0, 1
        headTiltDegrees: 0,
        torsoInclinationDegrees: 2,
        eyeShoulderDistanceRatio: 0.85,
        shoulderWidth: 0.22
      })
    )

    const baseline = buildPersonalBaseline(samples, 1000000)
    expect(baseline).not.toBeNull()
    if (!baseline) return

    expect(baseline.sampleCount).toBe(20)
    expect(baseline.calibratedAt).toBe(1000000)
    expect(baseline.framing.shoulderWidth).toBe(0.22)
    expect(baseline.metrics.torsoInclinationDegrees.mean).toBe(2)
  })

  it('evaluates current posture as good_alignment when matching baseline', () => {
    const samples = Array.from({ length: 20 }, () => createSample())
    const baseline = buildPersonalBaseline(samples, 1000000)!

    const current = createSample({
      shoulderSlopeDegrees: 1, // small variation within tolerance
      headTiltDegrees: 1
    })

    const evaluation = evaluateAgainstBaseline(
      current,
      baseline,
      1000000 + 60000
    )
    expect(evaluation.status).toBe('good_alignment')
  })

  it('evaluates current posture as needs_adjustment when deviating significantly', () => {
    const samples = Array.from({ length: 20 }, () =>
      createSample({
        shoulderSlopeDegrees: 0,
        headTiltDegrees: 0
      })
    )
    const baseline = buildPersonalBaseline(samples, 1000000)!

    const current = createSample({
      shoulderSlopeDegrees: 15 // 15 degrees tilt
    })

    const evaluation = evaluateAgainstBaseline(
      current,
      baseline,
      1000000 + 60000
    )
    expect(evaluation.status).toBe('needs_adjustment')
    if (evaluation.status === 'needs_adjustment') {
      expect(
        evaluation.deviations.some((d) => d.metric === 'shoulderSlopeDegrees')
      ).toBe(true)
    }
  })

  it('recommends recalibration when framing shifts significantly', () => {
    const samples = Array.from({ length: 20 }, () =>
      createSample({ shoulderWidth: 0.2 })
    )
    const baseline = buildPersonalBaseline(samples, 1000000)!

    // Shoulder width shrunk by 50% (user moved away or changed camera)
    const current = createSample({ shoulderWidth: 0.1 })

    const evaluation = evaluateAgainstBaseline(
      current,
      baseline,
      1000000 + 60000
    )
    expect(evaluation.status).toBe('recalibration_recommended')
    if (evaluation.status === 'recalibration_recommended') {
      expect(evaluation.reason).toBe('framing_shift')
    }
  })

  it('recommends recalibration when baseline has expired (> 8 hours)', () => {
    const samples = Array.from({ length: 20 }, () => createSample())
    const baseline = buildPersonalBaseline(samples, 1000000)!

    const evaluation = evaluateAgainstBaseline(
      createSample(),
      baseline,
      1000000 + BASELINE_MAX_AGE_MS + 1000 // expired
    )
    expect(evaluation.status).toBe('recalibration_recommended')
    if (evaluation.status === 'recalibration_recommended') {
      expect(evaluation.reason).toBe('expired')
    }
  })
})
