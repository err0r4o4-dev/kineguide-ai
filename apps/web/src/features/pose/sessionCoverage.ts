import type { PostureSummaryResponse } from '@/services/product'

type ObservedDurations = Pick<
  PostureSummaryResponse,
  'good_alignment_seconds' | 'needs_adjustment_seconds' | 'unassessed_seconds'
>

export function getSessionCoverage(
  elapsedSeconds: number,
  summary: ObservedDurations
) {
  const durations = [
    summary.good_alignment_seconds,
    summary.needs_adjustment_seconds,
    summary.unassessed_seconds
  ]
  if (
    !Number.isSafeInteger(elapsedSeconds) ||
    elapsedSeconds < 0 ||
    durations.some((seconds) => !Number.isSafeInteger(seconds) || seconds < 0)
  )
    return null

  const assessedSeconds = durations[0] + durations[1]
  const totalObservedSeconds = assessedSeconds + durations[2]
  if (totalObservedSeconds > elapsedSeconds) return null

  return {
    assessedSeconds,
    unassessedSeconds: durations[2],
    unobservedSeconds: elapsedSeconds - totalObservedSeconds
  }
}
