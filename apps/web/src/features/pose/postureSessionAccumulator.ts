import {
  DISCONNECT_RESET_THRESHOLD_MS,
  type PostureFeedbackState
} from './postureFeedbackEngine'

export interface PostureTotals {
  good_alignment_seconds: number
  needs_adjustment_seconds: number
  /** Low confidence, not visible, unable to assess, or recalibration needed. */
  unassessed_seconds: number
  alert_count: number
}

/** Frame gaps longer than this are not attributed to any state. */
export const MAX_FRAME_GAP_MS = DISCONNECT_RESET_THRESHOLD_MS

/**
 * Accumulates observed posture-state durations over a live session.
 *
 * Each interval between two recorded frames is attributed to the state of the
 * earlier frame. Paused time and frame gaps (tab hidden, inference stalled)
 * are not counted, so totals describe only time that was actually observed.
 * Only aggregate seconds and counts are kept — no landmarks or frames.
 */
export class PostureSessionAccumulator {
  private lastState: PostureFeedbackState | null = null
  private lastTimestamp: number | null = null
  private goodMs = 0
  private needsMs = 0
  private unassessedMs = 0
  private alerts = 0

  public record(
    state: PostureFeedbackState,
    timestamp: number,
    options: { alertTriggered?: boolean } = {}
  ): void {
    if (this.lastState !== null && this.lastTimestamp !== null) {
      const elapsed = timestamp - this.lastTimestamp
      if (elapsed > 0 && elapsed <= MAX_FRAME_GAP_MS) {
        if (this.lastState === 'good_alignment') this.goodMs += elapsed
        else if (this.lastState === 'needs_adjustment') this.needsMs += elapsed
        else this.unassessedMs += elapsed
      }
    }
    if (options.alertTriggered) this.alerts += 1
    this.lastState = state
    this.lastTimestamp = timestamp
  }

  /** Ends the current interval so time until the next frame is not counted. */
  public pause(): void {
    this.lastState = null
    this.lastTimestamp = null
  }

  public reset(): void {
    this.pause()
    this.goodMs = 0
    this.needsMs = 0
    this.unassessedMs = 0
    this.alerts = 0
  }

  public getTotals(): PostureTotals {
    return {
      good_alignment_seconds: this.goodMs / 1000,
      needs_adjustment_seconds: this.needsMs / 1000,
      unassessed_seconds: this.unassessedMs / 1000,
      alert_count: this.alerts
    }
  }

  /** Whole-second totals for the session summary contract. */
  public toSummaryInput(): PostureTotals {
    const totals = this.getTotals()
    return {
      good_alignment_seconds: Math.floor(totals.good_alignment_seconds),
      needs_adjustment_seconds: Math.floor(totals.needs_adjustment_seconds),
      unassessed_seconds: Math.floor(totals.unassessed_seconds),
      alert_count: totals.alert_count
    }
  }
}
