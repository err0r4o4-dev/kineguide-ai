import type { PostureSession } from '@/services/product'

export interface AnalyticsDay {
  date: number
  seconds: number
  count: number
}

export function selectAnalyticsSessions(
  records: PostureSession[],
  days: number,
  now: number
) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - days + 1)
  let invalidCount = 0
  const sessions = records
    .filter((session) => {
      if (session.status !== 'completed' && session.status !== 'stopped')
        return false
      const timestamp = Date.parse(session.started_at)
      const seconds = session.metrics.duration_seconds
      if (
        session.has_valid_duration === false ||
        !Number.isFinite(timestamp) ||
        timestamp > now ||
        !Number.isSafeInteger(seconds) ||
        seconds < 0
      ) {
        invalidCount += 1
        return false
      }
      return days === 0 || timestamp >= start.getTime()
    })
    .sort(
      (left, right) =>
        Date.parse(right.started_at) - Date.parse(left.started_at)
    )
  return { sessions, invalidCount }
}

export function summarizeAnalytics(sessions: PostureSession[]) {
  const grouped = new Map<number, AnalyticsDay>()
  let totalSeconds = 0
  for (const session of sessions) {
    const date = new Date(session.started_at)
    date.setHours(0, 0, 0, 0)
    const key = date.getTime()
    const day = grouped.get(key) ?? { date: key, seconds: 0, count: 0 }
    day.seconds += session.metrics.duration_seconds
    day.count += 1
    totalSeconds += session.metrics.duration_seconds
    grouped.set(key, day)
  }
  return {
    count: sessions.length,
    totalSeconds,
    averageSeconds: sessions.length
      ? Math.round(totalSeconds / sessions.length)
      : null,
    days: [...grouped.values()].sort((left, right) => left.date - right.date)
  }
}
