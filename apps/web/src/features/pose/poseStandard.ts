import type { PoseLandmark } from './poseGeometry'

export const KINEGUIDE_POSE_SCHEMA_VERSION = 'kineguide.pose.v1' as const
export const MEDIAPIPE_POSE_LANDMARK_COUNT = 33
export const KINEGUIDE_VISIBILITY_GATE = 0.5
export const MIN_CANONICAL_COVERAGE = 0.6

export const POSE_LANDMARK_INDEX = {
  nose: 0,
  left_ear: 7,
  right_ear: 8,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28
} as const

export const CANONICAL_LANDMARK_NAMES = Object.keys(
  POSE_LANDMARK_INDEX
) as CanonicalLandmarkName[]

const REQUIRED_CANONICAL_LANDMARKS = [
  'nose',
  'left_shoulder',
  'right_shoulder'
] as const satisfies readonly CanonicalLandmarkName[]

export type CanonicalLandmarkName = keyof typeof POSE_LANDMARK_INDEX

export type PoseQualityState = 'usable' | 'low_confidence' | 'unavailable'

export interface CanonicalPosePoint {
  imageNorm: PoseLandmark | null
  world: PoseLandmark | null
  sourceIndex: number
}

export interface DerivedPosePoint {
  imageNorm: PoseLandmark | null
  world: PoseLandmark | null
  sourceIndices: readonly number[]
}

export interface KineGuidePoseFrame {
  schemaVersion: typeof KINEGUIDE_POSE_SCHEMA_VERSION
  timestampMs: number
  coordinateSystem: {
    image: 'normalized_0_1'
    world: 'meters_hip_origin'
  }
  landmarks: Record<CanonicalLandmarkName, CanonicalPosePoint>
  virtual: {
    midShoulder: DerivedPosePoint | null
    midHip: DerivedPosePoint | null
    headCenter: DerivedPosePoint | null
  }
  quality: {
    state: PoseQualityState
    requiredCoverage: number
    missingLandmarks: CanonicalLandmarkName[]
  }
}

function isFinitePoint(
  point: PoseLandmark | null | undefined
): point is PoseLandmark {
  return Boolean(
    point &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    Number.isFinite(point.z ?? 0)
  )
}

function isUsableImagePoint(
  point: PoseLandmark | null | undefined
): point is PoseLandmark {
  return Boolean(
    isFinitePoint(point) &&
    point.x >= 0 &&
    point.x <= 1 &&
    point.y >= 0 &&
    point.y <= 1 &&
    (point.visibility ?? 0) >= KINEGUIDE_VISIBILITY_GATE
  )
}

function clonePoint(
  point: PoseLandmark | null | undefined
): PoseLandmark | null {
  return isFinitePoint(point)
    ? {
        x: point.x,
        y: point.y,
        z: point.z,
        visibility: point.visibility
      }
    : null
}

function midpoint(
  first: PoseLandmark | null,
  second: PoseLandmark | null,
  sourceIndices: readonly number[]
): DerivedPosePoint | null {
  if (!first || !second) return null

  const visibility = Math.min(first.visibility ?? 0, second.visibility ?? 0)
  return {
    imageNorm: {
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
      z: ((first.z ?? 0) + (second.z ?? 0)) / 2,
      visibility
    },
    world: null,
    sourceIndices
  }
}

function midpointWithWorld(
  firstImage: PoseLandmark | null,
  secondImage: PoseLandmark | null,
  firstWorld: PoseLandmark | null,
  secondWorld: PoseLandmark | null,
  sourceIndices: readonly number[]
): DerivedPosePoint | null {
  const result = midpoint(firstImage, secondImage, sourceIndices)
  if (!result) return null
  if (firstWorld && secondWorld) {
    result.world = {
      x: (firstWorld.x + secondWorld.x) / 2,
      y: (firstWorld.y + secondWorld.y) / 2,
      z: (firstWorld.z ?? 0) / 2 + (secondWorld.z ?? 0) / 2,
      visibility: Math.min(
        firstWorld.visibility ?? 0,
        secondWorld.visibility ?? 0
      )
    }
  }
  return result
}

function createCanonicalLandmark(
  sourceIndex: number,
  imageLandmarks: readonly PoseLandmark[],
  worldLandmarks: readonly PoseLandmark[] | null
): CanonicalPosePoint {
  return {
    imageNorm: clonePoint(imageLandmarks[sourceIndex]),
    world: clonePoint(worldLandmarks?.[sourceIndex]),
    sourceIndex
  }
}

function createHeadCenter(
  landmarks: Record<CanonicalLandmarkName, CanonicalPosePoint>
): DerivedPosePoint | null {
  const leftEar = landmarks.left_ear
  const rightEar = landmarks.right_ear
  if (
    isUsableImagePoint(leftEar.imageNorm) &&
    isUsableImagePoint(rightEar.imageNorm)
  ) {
    return midpointWithWorld(
      leftEar.imageNorm,
      rightEar.imageNorm,
      leftEar.world,
      rightEar.world,
      [leftEar.sourceIndex, rightEar.sourceIndex]
    )
  }

  const nose = landmarks.nose
  if (!isUsableImagePoint(nose.imageNorm)) return null
  return {
    imageNorm: clonePoint(nose.imageNorm),
    world: clonePoint(nose.world ?? undefined),
    sourceIndices: [nose.sourceIndex]
  }
}

export function createKineGuidePoseFrame(
  imageLandmarks: readonly PoseLandmark[],
  worldLandmarks: readonly PoseLandmark[] | null,
  timestampMs: number
): KineGuidePoseFrame {
  const landmarks = Object.fromEntries(
    CANONICAL_LANDMARK_NAMES.map((name) => [
      name,
      createCanonicalLandmark(
        POSE_LANDMARK_INDEX[name],
        imageLandmarks,
        worldLandmarks
      )
    ])
  ) as Record<CanonicalLandmarkName, CanonicalPosePoint>

  const missingLandmarks = CANONICAL_LANDMARK_NAMES.filter(
    (name) => !isUsableImagePoint(landmarks[name].imageNorm)
  )
  const validCount = CANONICAL_LANDMARK_NAMES.length - missingLandmarks.length
  const requiredCoverage = validCount / CANONICAL_LANDMARK_NAMES.length
  const hasRequiredLandmarks = REQUIRED_CANONICAL_LANDMARKS.every(
    (name) => !missingLandmarks.includes(name)
  )

  let state: PoseQualityState = 'low_confidence'
  if (validCount === 0) state = 'unavailable'
  else if (hasRequiredLandmarks && requiredCoverage >= MIN_CANONICAL_COVERAGE) {
    state = 'usable'
  }

  return {
    schemaVersion: KINEGUIDE_POSE_SCHEMA_VERSION,
    timestampMs,
    coordinateSystem: {
      image: 'normalized_0_1',
      world: 'meters_hip_origin'
    },
    landmarks,
    virtual: {
      midShoulder: midpointWithWorld(
        landmarks.left_shoulder.imageNorm,
        landmarks.right_shoulder.imageNorm,
        landmarks.left_shoulder.world,
        landmarks.right_shoulder.world,
        [
          landmarks.left_shoulder.sourceIndex,
          landmarks.right_shoulder.sourceIndex
        ]
      ),
      midHip: midpointWithWorld(
        landmarks.left_hip.imageNorm,
        landmarks.right_hip.imageNorm,
        landmarks.left_hip.world,
        landmarks.right_hip.world,
        [landmarks.left_hip.sourceIndex, landmarks.right_hip.sourceIndex]
      ),
      headCenter: createHeadCenter(landmarks)
    },
    quality: {
      state,
      requiredCoverage,
      missingLandmarks
    }
  }
}
