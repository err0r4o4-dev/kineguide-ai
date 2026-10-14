export const DEFAULT_BREAK_INTERVAL_MINUTES = 25
export const MIN_BREAK_INTERVAL_MINUTES = 10
export const MAX_BREAK_INTERVAL_MINUTES = 60
export const DEFAULT_SNOOZE_MINUTES = 5

export interface BreakReminderState {
  readonly enabled: boolean
  readonly intervalMinutes: number
  readonly isDue: boolean
  readonly breakCount: number
  readonly lastBreakTimeSeconds: number
  readonly activeSeconds: number
}

/**
 * Deterministic break reminder engine for seated work sessions.
 *
 * This provides practical ergonomic pause reminders based on user-chosen intervals.
 * It is non-diagnostic and makes no medical claim about safe duration thresholds.
 */
export class BreakReminderEngine {
  private enabled: boolean = true
  private intervalMinutes: number = DEFAULT_BREAK_INTERVAL_MINUTES
  private activeSeconds: number = 0
  private lastBreakTimeSeconds: number = 0
  private snoozeUntilSeconds: number | null = null
  private due: boolean = false
  private breakCount: number = 0

  public isEnabled(): boolean {
    return this.enabled
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) {
      this.due = false
      this.snoozeUntilSeconds = null
    }
  }

  public getIntervalMinutes(): number {
    return this.intervalMinutes
  }

  public setIntervalMinutes(minutes: number): void {
    this.intervalMinutes = Math.min(
      MAX_BREAK_INTERVAL_MINUTES,
      Math.max(MIN_BREAK_INTERVAL_MINUTES, Math.round(minutes))
    )
  }

  public isDue(): boolean {
    return this.due
  }

  public getBreakCount(): number {
    return this.breakCount
  }

  public getActiveSeconds(): number {
    return this.activeSeconds
  }

  public update(currentActiveSeconds: number): boolean {
    this.activeSeconds = Math.max(0, currentActiveSeconds)

    if (!this.enabled) {
      this.due = false
      return false
    }

    if (this.snoozeUntilSeconds !== null) {
      if (this.activeSeconds >= this.snoozeUntilSeconds) {
        this.snoozeUntilSeconds = null
        this.due = true
        return true
      }
      return false
    }

    const intervalSeconds = this.intervalMinutes * 60
    const secondsSinceLastBreak = this.activeSeconds - this.lastBreakTimeSeconds

    if (secondsSinceLastBreak >= intervalSeconds) {
      this.due = true
      return true
    }

    return false
  }

  public snooze(minutes: number = DEFAULT_SNOOZE_MINUTES): void {
    const snoozeSeconds = Math.max(1, minutes) * 60
    this.snoozeUntilSeconds = this.activeSeconds + snoozeSeconds
    this.due = false
  }

  public acknowledge(): void {
    this.lastBreakTimeSeconds = this.activeSeconds
    this.snoozeUntilSeconds = null
    this.due = false
    this.breakCount += 1
  }

  public reset(): void {
    this.activeSeconds = 0
    this.lastBreakTimeSeconds = 0
    this.snoozeUntilSeconds = null
    this.due = false
    this.breakCount = 0
  }

  public getState(): BreakReminderState {
    return {
      enabled: this.enabled,
      intervalMinutes: this.intervalMinutes,
      isDue: this.due,
      breakCount: this.breakCount,
      lastBreakTimeSeconds: this.lastBreakTimeSeconds,
      activeSeconds: this.activeSeconds
    }
  }
}
