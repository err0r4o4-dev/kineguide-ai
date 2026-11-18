import {
  HOLISTIC_INTERVAL_MS,
  SAFETY_POSE_INTERVAL_MS,
  shouldRunSafetyPose
} from './poseAdapter'

describe('pose adapter frame rates', () => {
  it('targets 15 FPS display inference and 5 FPS safety checks', () => {
    expect(HOLISTIC_INTERVAL_MS).toBeCloseTo(1000 / 15)
    expect(SAFETY_POSE_INTERVAL_MS).toBe(200)
    expect(shouldRunSafetyPose(null, 0)).toBe(true)
    expect(shouldRunSafetyPose(0, 199)).toBe(false)
    expect(shouldRunSafetyPose(0, 200)).toBe(true)
  })
})
