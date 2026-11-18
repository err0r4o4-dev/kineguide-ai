import { mapSessionResponse, type PostureSession } from '@/services/product'

import { selectAnalyticsSessions, summarizeAnalytics } from './sessionAnalytics'

const now = new Date(2026, 10, 2, 12).getTime()

function session(
  id: string,
  startedAt: string,
  seconds: number,
  status: PostureSession['status'] = 'completed'
) {
  return mapSessionResponse({
    id,
    status,
    elapsed_seconds: seconds,
    manual_cycles: 0,
    started_at: startedAt,
    completed_at: status === 'active' ? null : startedAt,
    retention_until: '2027-11-02T00:00:00Z'
  })
}

describe('session analytics', () => {
  it('includes local midnight six days ago, excludes older and active sessions', () => {
    const records = [
      session('boundary', new Date(2026, 9, 27).toISOString(), 60),
      session('older', new Date(2026, 9, 26, 23, 59, 59).toISOString(), 120),
      session('stopped', new Date(now).toISOString(), 180, 'stopped'),
      session('active', new Date(now).toISOString(), 999, 'active')
    ]
    expect(
      selectAnalyticsSessions(records, 7, now).sessions.map(({ id }) => id)
    ).toEqual(['stopped', 'boundary'])
    expect(selectAnalyticsSessions(records, 0, now).sessions).toHaveLength(3)
    expect(records[0].id).toBe('boundary')
  })

  it.each([30, 90])('uses calendar boundaries for %i days', (days) => {
    const boundary = new Date(2026, 10, 2)
    boundary.setDate(boundary.getDate() - days + 1)
    const records = [
      session('boundary', boundary.toISOString(), 0),
      session('older', new Date(boundary.getTime() - 1).toISOString(), 60)
    ]
    expect(
      selectAnalyticsSessions(records, days, now).sessions.map(({ id }) => id)
    ).toEqual(['boundary'])
  })

  it('excludes malformed, future and invalid-duration records without inventing zero', () => {
    const records = [
      session('valid-zero', new Date(now).toISOString(), 0),
      session('invalid-date', 'invalid', 60),
      session('future', new Date(now + 1).toISOString(), 60),
      ...[-1, NaN, Infinity, 0.5].map((seconds, index) =>
        session(`invalid-${index}`, new Date(now).toISOString(), seconds)
      )
    ]
    const result = selectAnalyticsSessions(records, 0, now)
    expect(result.sessions.map(({ id }) => id)).toEqual(['valid-zero'])
    expect(result.invalidCount).toBe(6)
  })

  it('sums actual seconds and groups the entire duration by the local start day', () => {
    const records = [
      session('long', new Date(2026, 10, 1, 23, 55).toISOString(), 7200),
      session('short', new Date(2026, 10, 1, 10).toISOString(), 60),
      session('today', new Date(2026, 10, 2, 1).toISOString(), 30, 'stopped')
    ]
    expect(summarizeAnalytics(records)).toEqual({
      count: 3,
      totalSeconds: 7290,
      averageSeconds: 2430,
      days: [
        { date: new Date(2026, 10, 1).getTime(), seconds: 7260, count: 2 },
        { date: new Date(2026, 10, 2).getTime(), seconds: 30, count: 1 }
      ]
    })
  })

  it('does not drop days after twelve records and rounds the mean to a second', () => {
    const records = Array.from({ length: 15 }, (_, index) =>
      session(
        String(index),
        new Date(2026, 9, index + 1).toISOString(),
        index === 0 ? 61 : 60
      )
    )
    const summary = summarizeAnalytics(records)
    expect(summary.days).toHaveLength(15)
    expect(summary.totalSeconds).toBe(901)
    expect(summary.averageSeconds).toBe(60)
  })

  it('distinguishes no measurements from a recorded zero-duration session', () => {
    expect(summarizeAnalytics([])).toMatchObject({
      count: 0,
      totalSeconds: 0,
      averageSeconds: null,
      days: []
    })
    expect(
      summarizeAnalytics([session('zero', new Date(now).toISOString(), 0)])
    ).toMatchObject({ count: 1, totalSeconds: 0, averageSeconds: 0 })
  })
})
