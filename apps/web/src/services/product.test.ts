import { mapSessionResponse } from './product'

describe('session response mapping', () => {
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
      sitting_seconds: 0,
      standing_seconds: 0,
      good_alignment_seconds: 0,
      needs_adjustment_seconds: 0,
      alert_count: 0,
      break_count: 0,
      longest_sitting_seconds: 0
    })
  })
})
