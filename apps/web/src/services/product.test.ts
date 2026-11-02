import { vi } from 'vitest'

import { selectAnalyticsSessions } from '@/features/analytics/sessionAnalytics'

import { http } from './http'
import { getSessions, mapSessionResponse } from './product'

vi.mock('./http', () => ({ http: { get: vi.fn() } }))

describe('session response mapping', () => {
  it.each([undefined, null])(
    'does not turn a missing API duration (%s) into a measured zero in analytics',
    async (elapsedSeconds) => {
      vi.mocked(http.get).mockResolvedValue({
        data: {
          sessions: [
            {
              id: 'missing-duration',
              status: 'completed',
              elapsed_seconds: elapsedSeconds,
              started_at: '2026-11-01T00:00:00Z',
              completed_at: '2026-11-01T00:00:00Z',
              retention_until: '2027-11-01T00:00:00Z',
              manual_cycles: 0
            }
          ]
        }
      })
      const sessions = await getSessions()
      expect(
        selectAnalyticsSessions(sessions, 0, Date.parse('2026-11-02T00:00:00Z'))
      ).toMatchObject({ sessions: [], invalidCount: 1 })
    }
  )

  it('does not derive posture metrics from elapsed time', () => {
    expect(
      mapSessionResponse({
        id: 'session-1',
        status: 'completed',
        elapsed_seconds: 100,
        manual_cycles: 4,
        started_at: '2026-08-28T09:00:00Z',
        completed_at: '2026-08-28T09:01:40Z',
        retention_until: '2027-08-28T09:01:40Z'
      }).metrics
    ).toEqual({
      duration_seconds: 100,
      sitting_seconds: null,
      standing_seconds: null,
      good_alignment_seconds: null,
      needs_adjustment_seconds: null,
      alert_count: null,
      break_count: null,
      longest_sitting_seconds: null
    })
  })
})
