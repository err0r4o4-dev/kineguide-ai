import { PostureSessionAccumulator } from './postureSessionAccumulator'

describe('PostureSessionAccumulator', () => {
  it('accumulates time per posture state between consecutive frames', () => {
    const acc = new PostureSessionAccumulator()
    acc.record('good_alignment', 0)
    acc.record('good_alignment', 1000)
    acc.record('needs_adjustment', 3000, { alertTriggered: true })
    acc.record('needs_adjustment', 4000)
    acc.record('low_confidence', 5000)
    acc.record('low_confidence', 6500)

    // Each interval is attributed to the state observed at its start.
    expect(acc.getTotals()).toEqual({
      good_alignment_seconds: 3,
      needs_adjustment_seconds: 2,
      unassessed_seconds: 1.5,
      alert_count: 1
    })
  })

  it('does not count paused time', () => {
    const acc = new PostureSessionAccumulator()
    acc.record('good_alignment', 0)
    acc.record('good_alignment', 2000)
    acc.pause()
    acc.record('good_alignment', 60_000)
    acc.record('good_alignment', 61_000)

    expect(acc.getTotals().good_alignment_seconds).toBe(3)
  })

  it('does not attribute frame gaps longer than the gap limit to any state', () => {
    const acc = new PostureSessionAccumulator()
    acc.record('needs_adjustment', 0)
    acc.record('needs_adjustment', 10_000)
    acc.record('needs_adjustment', 11_000)

    expect(acc.getTotals().needs_adjustment_seconds).toBe(1)
  })

  it('counts alerts only when the engine reports a newly triggered alert', () => {
    const acc = new PostureSessionAccumulator()
    acc.record('good_alignment', 0)
    acc.record('needs_adjustment', 500, { alertTriggered: true })
    acc.record('low_confidence', 1000)
    acc.record('needs_adjustment', 1500)
    acc.record('needs_adjustment', 2000, { alertTriggered: false })

    expect(acc.getTotals().alert_count).toBe(1)
  })

  it('rounds totals to whole seconds for persistence and resets cleanly', () => {
    const acc = new PostureSessionAccumulator()
    acc.record('good_alignment', 0)
    acc.record('good_alignment', 1600)
    expect(acc.toSummaryInput()).toEqual({
      good_alignment_seconds: 2,
      needs_adjustment_seconds: 0,
      unassessed_seconds: 0,
      alert_count: 0
    })

    acc.reset()
    expect(acc.getTotals().good_alignment_seconds).toBe(0)
  })
})
