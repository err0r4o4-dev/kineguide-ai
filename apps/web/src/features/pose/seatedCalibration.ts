import type { RawSeatedMetrics, SeatedFramingMode } from './seatedMetrics'

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
    /** `null` for an `upper_body` baseline, where hips were not observed. */
    readonly torsoInclinationDegrees: MetricSummary | null
    readonly eyeShoulderDistanceRatio: MetricSummary
    readonly forwardHeadRatio: MetricSummary
  }
  readonly framing: {
    readonly shoulderWidth: number
    readonly mode: SeatedFramingMode
  }
}

export type BaselineMetricKey = keyof PersonalBaseline['metrics']

export interface MetricDeviation {
  readonly metric: BaselineMetricKey
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

/**
 * Product engineering tolerances for deviation from the user's own baseline.
 *
 * A metric counts as deviated only when it exceeds BOTH an absolute minimum
 * difference (filters landmark jitter) and a z-score against the user's
 * calibration variability. These are configurable product values chosen to
 * suppress noise; they are NOT medical or ergonomic thresholds, carry no
 * clinical meaning, and have not been clinically validated.
 */
export const BASELINE_TOLERANCES: Readonly<
  Record<BaselineMetricKey, { minDiff: number; zThreshold: number }>
> = {
  shoulderSlopeDegrees: { minDiff: 5, zThreshold: 2.5 }, // degrees
  headTiltDegrees: { minDiff: 6, zThreshold: 2.5 }, // degrees
  torsoInclinationDegrees: { minDiff: 7, zThreshold: 2.5 }, // degrees
  eyeShoulderDistanceRatio: { minDiff: 0.15, zThreshold: 2.5 }, // unitless ratio
  forwardHeadRatio: { minDiff: 0.04, zThreshold: 2.5 } // unitless scale ratio
}

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
 *
 * Returns `null` when there are too few samples or when the samples mix
 * framing modes (the user moved in or out of a full-torso view mid-calibration).
 */
export function buildPersonalBaseline(
  samples: readonly RawSeatedMetrics[],
  calibratedAt: number = Date.now()
): PersonalBaseline | null {
  if (samples.length < MIN_CALIBRATION_SAMPLES) {
    return null
  }

  const mode = samples[0].framingMode
  if (samples.some((s) => s.framingMode !== mode)) {
    return null
  }

  const torsoValues = samples
    .map((s) => s.torsoInclinationDegrees)
    .filter((v): v is number => v !== null)
  const avgWidth =
    samples.reduce((sum, s) => sum + s.shoulderWidth, 0) / samples.length

  return {
    id: `baseline-${calibratedAt}`,
    calibratedAt,
    sampleCount: samples.length,
    metrics: {
      shoulderSlopeDegrees: calculateSummary(
        samples.map((s) => s.shoulderSlopeDegrees)
      ),
      headTiltDegrees: calculateSummary(samples.map((s) => s.headTiltDegrees)),
      torsoInclinationDegrees:
        mode === 'full_torso' && torsoValues.length === samples.length
          ? calculateSummary(torsoValues)
          : null,
      eyeShoulderDistanceRatio: calculateSummary(
        samples.map((s) => s.eyeShoulderDistanceRatio)
      ),
      forwardHeadRatio: calculateSummary(samples.map((s) => s.forwardHeadRatio))
    },
    framing: {
      shoulderWidth: Number(avgWidth.toFixed(4)),
      mode
    }
  }
}

function evaluateMetric(
  metric: BaselineMetricKey,
  observed: number,
  summary: MetricSummary
): { z: number; deviation: MetricDeviation | null } {
  const tolerance = BASELINE_TOLERANCES[metric]
  const diff = Math.abs(observed - summary.mean)
  const z = summary.stdDev > 0 ? diff / summary.stdDev : 0
  const deviated =
    diff > tolerance.minDiff &&
    (summary.stdDev > 0 ? z > tolerance.zThreshold : true)
  return {
    z,
    deviation: deviated
      ? {
          metric,
          observed,
          baselineMean: summary.mean,
          diff: Number(
            diff.toFixed(metric === 'eyeShoulderDistanceRatio' ? 3 : 2)
          )
        }
      : null
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

  // A different framing mode means the camera view no longer matches the baseline.
  if (current.framingMode !== baseline.framing.mode) {
    return {
      status: 'recalibration_recommended',
      reason: 'framing_shift'
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

  const checks: Array<{
    metric: BaselineMetricKey
    observed: number | null
    summary: MetricSummary | null
  }> = [
    {
      metric: 'shoulderSlopeDegrees',
      observed: current.shoulderSlopeDegrees,
      summary: baseline.metrics.shoulderSlopeDegrees
    },
    {
      metric: 'headTiltDegrees',
      observed: current.headTiltDegrees,
      summary: baseline.metrics.headTiltDegrees
    },
    {
      metric: 'torsoInclinationDegrees',
      observed: current.torsoInclinationDegrees,
      summary: baseline.metrics.torsoInclinationDegrees
    },
    {
      // Forward head / slouching changes the eye-to-shoulder distance ratio.
      metric: 'eyeShoulderDistanceRatio',
      observed: current.eyeShoulderDistanceRatio,
      summary: baseline.metrics.eyeShoulderDistanceRatio
    },
    {
      // Forward head magnification relative to shoulder width.
      metric: 'forwardHeadRatio',
      observed: current.forwardHeadRatio,
      summary: baseline.metrics.forwardHeadRatio
    }
  ]

  const deviations: MetricDeviation[] = []
  let maxZ = 0
  for (const { metric, observed, summary } of checks) {
    if (observed === null || summary === null) continue
    const result = evaluateMetric(metric, observed, summary)
    maxZ = Math.max(maxZ, result.z)
    if (result.deviation) deviations.push(result.deviation)
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
