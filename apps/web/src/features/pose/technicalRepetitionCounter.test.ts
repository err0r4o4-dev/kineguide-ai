import { createTechnicalRepetitionCounter } from './technicalRepetitionCounter'
import type { PoseLandmark } from './poseGeometry'

const point = (x: number, y: number, z = 0): PoseLandmark => ({
  x,
  y,
  z,
  visibility: 0.95
})

describe('state-based repetition counter', () => {
  it('denies automatic counting for an unknown or unreviewed activity', () => {
    const counter = createTechnicalRepetitionCounter('unknown-activity')

    expect(counter.update('ready', null)).toMatchObject({
      available: false,
      count: 0
    })
  })

  it.each([
    'seated-posture-demo',
    'standing-posture-demo',
    'sit-to-stand-demo',
    'walking-demo'
  ])('keeps automatic counting unavailable for %s', (slug) => {
    const counter = createTechnicalRepetitionCounter(slug)
    const pose = Array.from({ length: 33 }, () => point(0.5, 0.5, 0))

    expect(counter.update('ready', pose)).toMatchObject({
      available: false,
      count: 0
    })
  })
})
