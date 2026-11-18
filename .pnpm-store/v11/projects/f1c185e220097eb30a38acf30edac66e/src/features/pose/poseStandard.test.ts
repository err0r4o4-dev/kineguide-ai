import type { PoseLandmark } from './poseGeometry'
import {
  CANONICAL_LANDMARK_NAMES,
  KINEGUIDE_POSE_SCHEMA_VERSION,
  POSE_LANDMARK_INDEX,
  createKineGuidePoseFrame
} from './poseStandard'

function syntheticPose(
  overrides: Partial<Record<number, Partial<PoseLandmark>>> = {}
) {
  return Array.from({ length: 33 }, (_, index) => ({
    x: 0.25 + (index % 6) * 0.05,
    y: 0.15 + Math.floor(index / 6) * 0.08,
    z: index / 100,
    visibility: 0.95,
    ...overrides[index]
  }))
}

describe('KineGuide pose standard', () => {
  it('keeps a versioned 15-point canonical mapping over MediaPipe indices', () => {
    const image = syntheticPose({
      11: { x: 0.4, y: 0.35 },
      12: { x: 0.6, y: 0.35 }
    })
    const frame = createKineGuidePoseFrame(image, null, 1234)

    expect(frame.schemaVersion).toBe(KINEGUIDE_POSE_SCHEMA_VERSION)
    expect(CANONICAL_LANDMARK_NAMES).toHaveLength(15)
    expect(POSE_LANDMARK_INDEX.left_shoulder).toBe(11)
    expect(frame.landmarks.left_shoulder.sourceIndex).toBe(11)
    expect(frame.landmarks.right_shoulder.sourceIndex).toBe(12)
    expect(frame.quality.state).toBe('usable')
    expect(frame.timestampMs).toBe(1234)
  })

  it('derives midpoint landmarks and preserves world coordinates separately', () => {
    const image = syntheticPose({
      7: { x: 0.4, y: 0.2 },
      8: { x: 0.6, y: 0.2 },
      11: { x: 0.4, y: 0.35 },
      12: { x: 0.6, y: 0.35 },
      23: { x: 0.42, y: 0.65 },
      24: { x: 0.58, y: 0.65 }
    })
    const world = syntheticPose({
      11: { x: -0.1, y: 0.2, z: 0.3 },
      12: { x: 0.1, y: 0.2, z: 0.3 }
    })
    const frame = createKineGuidePoseFrame(image, world, 2000)

    expect(frame.virtual.midShoulder?.imageNorm?.x).toBeCloseTo(0.5)
    expect(frame.virtual.midHip?.imageNorm?.x).toBeCloseTo(0.5)
    expect(frame.virtual.headCenter?.imageNorm?.x).toBeCloseTo(0.5)
    expect(frame.landmarks.left_shoulder.world?.x).toBeCloseTo(-0.1)
    expect(frame.landmarks.right_shoulder.imageNorm?.x).toBeCloseTo(0.6)
  })

  it('uses nose as the head-center fallback when ears are unavailable', () => {
    const frame = createKineGuidePoseFrame(
      syntheticPose({
        0: { x: 0.52, y: 0.2 },
        7: { visibility: 0.1 },
        8: { visibility: 0.1 }
      }),
      null,
      3000
    )

    expect(frame.virtual.headCenter?.imageNorm?.x).toBeCloseTo(0.52)
  })

  it('reports low confidence instead of fabricating missing landmarks', () => {
    const frame = createKineGuidePoseFrame(
      syntheticPose({
        11: { visibility: 0.1 },
        12: { visibility: 0.1 }
      }),
      null,
      4000
    )

    expect(frame.quality.state).toBe('low_confidence')
    expect(frame.quality.missingLandmarks).toEqual(
      expect.arrayContaining(['left_shoulder', 'right_shoulder'])
    )
    expect(frame.landmarks.left_shoulder.imageNorm?.visibility).toBe(0.1)
  })

  it('reports unavailable when no canonical landmark is technically usable', () => {
    const frame = createKineGuidePoseFrame(
      syntheticPose(
        Object.fromEntries(
          CANONICAL_LANDMARK_NAMES.map((name) => [
            POSE_LANDMARK_INDEX[name],
            { visibility: 0.1 }
          ])
        )
      ),
      null,
      5000
    )

    expect(frame.quality.state).toBe('unavailable')
    expect(frame.quality.requiredCoverage).toBe(0)
  })
})
