import { describe, expect, it } from 'vitest'

import { getSessionCoverage } from './sessionCoverage'

const summary = {
  good_alignment_seconds: 30,
  needs_adjustment_seconds: 10,
  unassessed_seconds: 5
}

describe('getSessionCoverage', () => {
  it('keeps assessed, unreliable and unobserved time separate', () => {
    expect(getSessionCoverage(60, summary)).toEqual({
      assessedSeconds: 40,
      unassessedSeconds: 5,
      unobservedSeconds: 15
    })
  })

  it('accepts zero duration without inventing a percentage or sitting time', () => {
    expect(
      getSessionCoverage(0, {
        good_alignment_seconds: 0,
        needs_adjustment_seconds: 0,
        unassessed_seconds: 0
      })
    ).toEqual({
      assessedSeconds: 0,
      unassessedSeconds: 0,
      unobservedSeconds: 0
    })
  })

  it.each([-1, NaN, Infinity, 1.5])(
    'rejects invalid duration %s',
    (seconds) => {
      expect(getSessionCoverage(seconds, summary)).toBeNull()
    }
  )

  it.each([-1, NaN, Infinity, 1.5])(
    'rejects invalid aggregate %s',
    (seconds) => {
      expect(
        getSessionCoverage(60, { ...summary, unassessed_seconds: seconds })
      ).toBeNull()
    }
  )

  it('rejects totals exceeding session time instead of clamping or hiding them', () => {
    expect(getSessionCoverage(40, summary)).toBeNull()
  })
})
