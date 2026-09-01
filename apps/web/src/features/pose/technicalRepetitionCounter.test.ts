import { createTechnicalRepetitionCounter } from './technicalRepetitionCounter'
import type { PoseLandmark } from './poseGeometry'

const point = (x: number, y: number, z = 0): PoseLandmark => ({
  x,
  y,
  z,
  visibility: 0.95
})

describe('state-based repetition counter', () => {
  it('counts repetitions through full state machine transitions', () => {
    const counter = createTechnicalRepetitionCounter('arm-abduction-research-demo')

    // Initial state
    const restPose = Array.from({ length: 33 }, () => point(0.5, 0.5, 0))
    // Rest: shoulder angle ~20 deg (hip: 0.5, 0.8; shoulder: 0.5, 0.5; elbow: 0.52, 0.6)
    restPose[23] = point(0.5, 0.8, 0)
    restPose[11] = point(0.5, 0.5, 0)
    restPose[13] = point(0.52, 0.6, 0)

    let res = counter.update('ready', restPose)
    expect(res.available).toBe(true)
    expect(res.count).toBe(0)

    // Moving up (arm abduction)
    const peakPose = Array.from({ length: 33 }, () => point(0.5, 0.5, 0))
    // Peak: shoulder angle ~160 deg (elbow raised high above shoulder)
    peakPose[23] = point(0.5, 0.8, 0)
    peakPose[11] = point(0.5, 0.5, 0)
    peakPose[13] = point(0.48, 0.2, 0)

    res = counter.update('ready', peakPose)
    expect(res.count).toBe(0)

    // Return to rest
    res = counter.update('ready', restPose)
    // Completed 1 full cycle
    expect(res.count).toBe(1)
  })
})
