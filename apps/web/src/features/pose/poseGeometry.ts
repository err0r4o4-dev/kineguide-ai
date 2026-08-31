export interface PoseLandmark {
  x: number
  y: number
  z?: number
  visibility?: number
}

export interface PoseBounds {
  x: number
  y: number
  width: number
  height: number
}

export type PoseFrameStatus =
  | 'ready'
  | 'adjust_camera'
  | 'no_pose'
  | 'multiple_poses'
  | 'unsupported_exercise'

export interface ClassifiedPoseFrame {
  status: PoseFrameStatus
  landmarks: PoseLandmark[] | null
  bounds: PoseBounds | null
  unreliableLandmarks: number[]
}

// This gate only describes whether a landmark is technically usable. It is not
// an exercise-correctness or clinical threshold.
export const TECHNICAL_VISIBILITY_GATE = 0.5

const BOUNDS_PADDING = 0.05

const REQUIRED_LANDMARKS: Record<string, readonly number[]> = {
  'sit-to-stand-demo': [11, 12, 23, 24, 25, 26, 27, 28],
  'seated-knee-demo': [23, 24, 25, 26, 27, 28],
  'shoulder-movement-demo': [11, 12, 13, 14, 15, 16],
  'arm-abduction-research-demo': [11, 12, 13, 14, 15, 16, 23, 24],
  'arm-vw-research-demo': [11, 12, 13, 14, 15, 16, 23, 24],
  'table-push-up-research-demo': [
    11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28
  ],
  'standing-leg-abduction-research-demo': [23, 24, 25, 26, 27, 28],
  'lunge-research-demo': [11, 12, 23, 24, 25, 26, 27, 28],
  'squat-research-demo': [11, 12, 23, 24, 25, 26, 27, 28]
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function rounded(value: number) {
  return Number(value.toFixed(4))
}

export function createPoseBounds(
  landmarks: readonly PoseLandmark[]
): PoseBounds | null {
  const visible = landmarks.filter(
    ({ x, y, visibility = 1 }) =>
      Number.isFinite(x) &&
      Number.isFinite(y) &&
      visibility >= TECHNICAL_VISIBILITY_GATE
  )
  if (visible.length === 0) return null

  const xs = visible.map(({ x }) => x)
  const ys = visible.map(({ y }) => y)
  const left = clamp(Math.min(...xs) - BOUNDS_PADDING)
  const top = clamp(Math.min(...ys) - BOUNDS_PADDING)
  const right = clamp(Math.max(...xs) + BOUNDS_PADDING)
  const bottom = clamp(Math.max(...ys) + BOUNDS_PADDING)

  return {
    x: rounded(left),
    y: rounded(top),
    width: rounded(right - left),
    height: rounded(bottom - top)
  }
}

export function classifyPoseFrame(
  poses: readonly PoseLandmark[][],
  exerciseSlug: string
): ClassifiedPoseFrame {
  if (!Object.hasOwn(REQUIRED_LANDMARKS, exerciseSlug)) {
    return {
      status: 'unsupported_exercise',
      landmarks: null,
      bounds: null,
      unreliableLandmarks: []
    }
  }

  if (poses.length > 1) {
    return {
      status: 'multiple_poses',
      landmarks: null,
      bounds: null,
      unreliableLandmarks: []
    }
  }

  const landmarks = poses[0]
  if (!landmarks) {
    return {
      status: 'no_pose',
      landmarks: null,
      bounds: null,
      unreliableLandmarks: []
    }
  }

  const required = REQUIRED_LANDMARKS[exerciseSlug]
  const unreliableLandmarks = required.filter((index) => {
    const landmark = landmarks[index]
    return (
      !landmark ||
      !Number.isFinite(landmark.x) ||
      !Number.isFinite(landmark.y) ||
      (landmark.visibility ?? 0) < TECHNICAL_VISIBILITY_GATE ||
      landmark.x < 0 ||
      landmark.x > 1 ||
      landmark.y < 0 ||
      landmark.y > 1
    )
  })
  const bounds = createPoseBounds(landmarks)

  return {
    status:
      unreliableLandmarks.length === 0 && bounds ? 'ready' : 'adjust_camera',
    landmarks,
    bounds,
    unreliableLandmarks
  }
}
