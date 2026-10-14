import type { RawSeatedMetrics } from './seatedMetrics'

export interface MetricSummary {
  readonly mean: number
  readonly stdDev: number
}

export interface PersonalBaseline {
  readonly id: string
  readonly calibratedAt: number // Timestamp in milliseconds
  readonly sampleCount: number
  readonly metrics: {
    readonly shoulderSlopeDegrees: MetricSummary
    readonly headTiltDegrees: MetricSummary
    readonly torsoInclinationDegrees: MetricSummary
    readonly eyeShoulderDistanceRatio: MetricSummary
  }
  readonly framing: {
    readonly shoulderWidth: number
  }
}

export interface MetricDeviation {
  readonly metric: keyof PersonalBaseline['metrics']
  readonly observed: number
  readonly baselineMean: number
  readonly diff: number
}

export type PostureAlignmentEvaluation =
  | {
      readonly status: 'good_alignment'
      readonly maxDeviationZScore: number
    }
  | {
      readonly status: 'needs_adjustment'
      readonly deviations: readonly MetricDeviation[]
    }
  | {
      readonly status: 'recalibration_recommended'
      readonly reason: 'framing_shift' | 'expired'
    }

export const MIN_CALIBRATION_SAMPLES = 15
export const BASELINE_MAX_AGE_MS = 8 * 60 * 60 * 1000 // 8 hours
export const FRAMING_SHIFT_THRESHOLD = 0.35 // 35% shoulder width change indicates camera/distance move

// Default tolerances for deviation from personal baseline (in standard deviation units or minimum degree thresholds)
const TOLERANCES = {
  shoulderSlopeDegrees: { minDegreeDiff: 5, zThreshold: 2.5 },
  headTiltDegrees: { minDegreeDiff: 6, zThreshold: 2.5 },
  torsoInclinationDegrees: { minDegreeDiff: 7, zThreshold: 2.5 },
  eyeShoulderDistanceRatio: { minRatioDiff: 0.15, zThreshold: 2.5 }
} as const

function calculateSummary(values: readonly number[]): MetricSummary {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0 }
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  return {
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2))
  }
}

/**
 * Creates a personal calibration baseline from collected raw seated metric samples.
 */
export function buildPersonalBaseline(
  samples: readonly RawSeatedMetrics[],
  calibratedAt: number = Date.now()
): PersonalBaseline | null {
  if (samples.length < MIN_CALIBRATION_SAMPLES) {
    return null
  }

  const shoulderSlopes = samples.map((s) => s.shoulderSlopeDegrees)
  const headTilts = samples.map((s) => s.headTiltDegrees)
  const torsoInclinations = samples.map((s) => s.torsoInclinationDegrees)
  const eyeRatios = samples.map((s) => s.eyeShoulderDistanceRatio)
  const shoulderWidths = samples.map((s) => s.shoulderWidth)

  const avgWidth =
    shoulderWidths.reduce((sum, w) => sum + w, 0) / shoulderWidths.length

  return {
    id: `baseline-${calibratedAt}`,
    calibratedAt,
    sampleCount: samples.length,
    metrics: {
      shoulderSlopeDegrees: calculateSummary(shoulderSlopes),
      headTiltDegrees: calculateSummary(headTilts),
      torsoInclinationDegrees: calculateSummary(torsoInclinations),
      eyeShoulderDistanceRatio: calculateSummary(eyeRatios)
    },
    framing: {
      shoulderWidth: Number(avgWidth.toFixed(4))
    }
  }
}

/**
 * Evaluates current observed metrics against an established personal baseline.
 *
 * This provides observational ergonomic feedback relative to the user's natural setup.
 * It is non-diagnostic and makes no claims about clinical safety or injury causation.
 */
export function evaluateAgainstBaseline(
  current: RawSeatedMetrics,
  baseline: PersonalBaseline,
  now: number = Date.now()
): PostureAlignmentEvaluation {
  // Check validity / expiration
  if (now - baseline.calibratedAt > BASELINE_MAX_AGE_MS) {
    return {
      status: 'recalibration_recommended',
      reason: 'expired'
    }
  }

  // Check significant framing shift (user stood up, changed chair, or moved camera)
  const widthRatioDiff =
    Math.abs(current.shoulderWidth - baseline.framing.shoulderWidth) /
    baseline.framing.shoulderWidth
  if (widthRatioDiff > FRAMING_SHIFT_THRESHOLD) {
    return {
      status: 'recalibration_recommended',
      reason: 'framing_shift'
    }
  }

  const deviations: MetricDeviation[] = []
  let maxZ = 0

  // Check shoulder slope
  const shoulderDiff = Math.abs(
    current.shoulderSlopeDegrees - baseline.metrics.shoulderSlopeDegrees.mean
  )
  const shoulderZ =
    baseline.metrics.shoulderSlopeDegrees.stdDev > 0
      ? shoulderDiff / baseline.metrics.shoulderSlopeDegrees.stdDev
      : 0
  maxZ = Math.max(maxZ, shoulderZ)
  const shoulderDeviated =
    baseline.metrics.shoulderSlopeDegrees.stdDev > 0
      ? shoulderDiff > TOLERANCES.shoulderSlopeDegrees.minDegreeDiff &&
        shoulderZ > TOLERANCES.shoulderSlopeDegrees.zThreshold
      : shoulderDiff > TOLERANCES.shoulderSlopeDegrees.minDegreeDiff
  if (shoulderDeviated) {
    deviations.push({
      metric: 'shoulderSlopeDegrees',
      observed: current.shoulderSlopeDegrees,
      baselineMean: baseline.metrics.shoulderSlopeDegrees.mean,
      diff: Number(shoulderDiff.toFixed(2))
    })
  }

  // Check head tilt
  const headDiff = Math.abs(
    current.headTiltDegrees - baseline.metrics.headTiltDegrees.mean
  )
  const headZ =
    baseline.metrics.headTiltDegrees.stdDev > 0
      ? headDiff / baseline.metrics.headTiltDegrees.stdDev
      : 0
  maxZ = Math.max(maxZ, headZ)
  const headDeviated =
    baseline.metrics.headTiltDegrees.stdDev > 0
      ? headDiff > TOLERANCES.headTiltDegrees.minDegreeDiff &&
        headZ > TOLERANCES.headTiltDegrees.zThreshold
      : headDiff > TOLERANCES.headTiltDegrees.minDegreeDiff
  if (headDeviated) {
    deviations.push({
      metric: 'headTiltDegrees',
      observed: current.headTiltDegrees,
      baselineMean: baseline.metrics.headTiltDegrees.mean,
      diff: Number(headDiff.toFixed(2))
    })
  }

  // Check torso inclination
  const torsoDiff = Math.abs(
    current.torsoInclinationDegrees -
      baseline.metrics.torsoInclinationDegrees.mean
  )
  const torsoZ =
    baseline.metrics.torsoInclinationDegrees.stdDev > 0
      ? torsoDiff / baseline.metrics.torsoInclinationDegrees.stdDev
      : 0
  maxZ = Math.max(maxZ, torsoZ)
  const torsoDeviated =
    baseline.metrics.torsoInclinationDegrees.stdDev > 0
      ? torsoDiff > TOLERANCES.torsoInclinationDegrees.minDegreeDiff &&
        torsoZ > TOLERANCES.torsoInclinationDegrees.zThreshold
      : torsoDiff > TOLERANCES.torsoInclinationDegrees.minDegreeDiff
  if (torsoDeviated) {
    deviations.push({
      metric: 'torsoInclinationDegrees',
      observed: current.torsoInclinationDegrees,
      baselineMean: baseline.metrics.torsoInclinationDegrees.mean,
      diff: Number(torsoDiff.toFixed(2))
    })
  }

  // Check eye to shoulder ratio (forward head / slouching)
  const eyeDiff = Math.abs(
    current.eyeShoulderDistanceRatio -
      baseline.metrics.eyeShoulderDistanceRatio.mean
  )
  const eyeZ =
    baseline.metrics.eyeShoulderDistanceRatio.stdDev > 0
      ? eyeDiff / baseline.metrics.eyeShoulderDistanceRatio.stdDev
      : 0
  maxZ = Math.max(maxZ, eyeZ)
  const eyeDeviated =
    baseline.metrics.eyeShoulderDistanceRatio.stdDev > 0
      ? eyeDiff > TOLERANCES.eyeShoulderDistanceRatio.minRatioDiff &&
        eyeZ > TOLERANCES.eyeShoulderDistanceRatio.zThreshold
      : eyeDiff > TOLERANCES.eyeShoulderDistanceRatio.minRatioDiff
  if (eyeDeviated) {
    deviations.push({
      metric: 'eyeShoulderDistanceRatio',
      observed: current.eyeShoulderDistanceRatio,
      baselineMean: baseline.metrics.eyeShoulderDistanceRatio.mean,
      diff: Number(eyeDiff.toFixed(3))
    })
  }

  if (deviations.length > 0) {
    return {
      status: 'needs_adjustment',
      deviations
    }
  }

  return {
    status: 'good_alignment',
    maxDeviationZScore: Number(maxZ.toFixed(2))
  }
}
