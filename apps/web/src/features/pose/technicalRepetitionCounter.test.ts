import { describe, expect, it } from 'vitest'

import type { PoseLandmark } from './poseGeometry'
import { createTechnicalRepetitionCounter } from './technicalRepetitionCounter'

function frame(wristY: number): PoseLandmark[] {
  const landmarks = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    visibility: 1
  }))
  landmarks[11] = { x: 0.4, y: 0.4, visibility: 1 }
  landmarks[12] = { x: 0.6, y: 0.4, visibility: 1 }
  landmarks[15] = { x: 0.3, y: wristY, visibility: 1 }
  landmarks[16] = { x: 0.7, y: wristY, visibility: 1 }
  return landmarks
}

describe('technical repetition counter', () => {
  it('counts one observable lower-raised-lower cycle without a correctness claim', () => {
    const counter = createTechnicalRepetitionCounter(
      'arm-abduction-research-demo'
    )

    counter.update('ready', frame(0.65))
    counter.update('ready', frame(0.25))
    const result = counter.update('ready', frame(0.65))

    expect(result).toEqual({ count: 1, phase: 'lowered', available: true })
  })

  it('stays unavailable for exercises without a reviewed technical profile', () => {
    const counter = createTechnicalRepetitionCounter('sit-to-stand-demo')

    expect(counter.update('ready', frame(0.65))).toEqual({
      count: 0,
      phase: 'unavailable',
      available: false
    })
  })

  it('does not count low-confidence or missing frames', () => {
    const counter = createTechnicalRepetitionCounter(
      'arm-abduction-research-demo'
    )
    counter.update('ready', frame(0.65))
    counter.update('adjust_camera', null)

    expect(counter.update('ready', frame(0.25)).count).toBe(0)
  })
})
