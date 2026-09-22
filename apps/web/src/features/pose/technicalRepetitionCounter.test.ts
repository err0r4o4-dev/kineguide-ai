import { createTechnicalRepetitionCounter } from './technicalRepetitionCounter'
import type { PoseLandmark } from './poseGeometry'

const point = (x: number, y: number, z = 0): PoseLandmark => ({
  x,
  y,
  z,
  visibility: 0.95
})

describe('automatic repetition safety gate', () => {
  it('denies automatic counting for an unknown or unreviewed activity', () => {
    const counter = createTechnicalRepetitionCounter('unknown-activity')

    expect(counter.update('ready', null)).toMatchObject({
      available: false,
      count: 0,
      state: 'UNAVAILABLE',
      reason: 'clinician_rule_required'
    })
  })

  it.each([
    'seated-posture-demo',
    'standing-posture-demo',
    'sit-to-stand-demo',
    'walking-demo',
    'seated-knee-demo',
    'shoulder-movement-demo',
    'squat-research-demo',
    'arm-abduction-research-demo'
  ])('keeps automatic counting unavailable for %s', (slug) => {
    const counter = createTechnicalRepetitionCounter(slug)
    const pose = Array.from({ length: 33 }, () => point(0.5, 0.5, 0))

    expect(counter.update('ready', pose)).toMatchObject({
      available: false,
      count: 0,
      targetPeakAngle: null,
      reason: 'clinician_rule_required'
    })
  })
})
