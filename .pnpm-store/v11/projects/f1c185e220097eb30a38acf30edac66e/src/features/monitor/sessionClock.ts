export class SessionClock {
  private elapsedMs: number
  private startedAt: number | null

  constructor(initialSeconds: number, now: number) {
    this.elapsedMs = initialSeconds * 1000
    this.startedAt = now
  }

  addInitial(seconds: number) {
    this.elapsedMs += seconds * 1000
  }

  seconds(now: number) {
    return Math.floor(
      (this.elapsedMs +
        (this.startedAt === null ? 0 : Math.max(0, now - this.startedAt))) /
        1000
    )
  }

  pause(now: number) {
    if (this.startedAt !== null)
      this.elapsedMs += Math.max(0, now - this.startedAt)
    this.startedAt = null
  }

  resume(now: number) {
    if (this.startedAt === null) this.startedAt = now
  }
}
