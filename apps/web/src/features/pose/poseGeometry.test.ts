import {
  classifyPoseFrame,
  createPoseBounds,
  type PoseLandmark
} from './poseGeometry'

function syntheticPose(overrides: Partial<PoseLandmark> = {}) {
  return Array.from({ length: 33 }, (_, index) => ({
    x: 0.25 + (index % 6) * 0.1,
    y: 0.15 + Math.floor(index / 6) * 0.12,
    visibility: 0.95,
    ...overrides
  }))
}

describe('pose geometry', () => {
  it('creates a padded bounding box clamped to normalized coordinates', () => {
    const bounds = createPoseBounds([
      { x: 0.02, y: 0.1, visibility: 0.9 },
      { x: 0.8, y: 0.95, visibility: 0.9 }
    ])

    expect(bounds).toEqual({ x: 0, y: 0.05, width: 0.85, height: 0.95 })
  })

  it.each(['sit-to-stand-demo', 'seated-knee-demo', 'shoulder-movement-demo'])(
    'accepts a technically visible pose for %s',
    (exerciseSlug) => {
      expect(classifyPoseFrame([syntheticPose()], exerciseSlug).status).toBe(
        'ready'
      )
    }
  )

  it('asks for camera adjustment when a required landmark is unreliable', () => {
    const pose = syntheticPose()
    pose[25] = { ...pose[25], visibility: 0.1 }

    const result = classifyPoseFrame([pose], 'sit-to-stand-demo')

    expect(result.status).toBe('adjust_camera')
    expect(result.unreliableLandmarks).toContain(25)
  })

  it('reports no pose without fabricating an assessment', () => {
    expect(classifyPoseFrame([], 'sit-to-stand-demo')).toEqual({
      status: 'no_pose',
      landmarks: null,
      bounds: null,
      unreliableLandmarks: []
    })
  })
})
