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
  | 'unsupported_activity'

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
  'seated-posture-demo': [0, 11, 12, 23, 24, 25, 26],
  'standing-posture-demo': [0, 11, 12, 23, 24, 25, 26, 27, 28],
  'walking-demo': [0, 11, 12, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
  'neck-flexion-demo': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'neck-rotation-demo': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
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
  'squat-research-demo': [11, 12, 23, 24, 25, 26, 27, 28],
  'hand-wrist-demo': [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
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
      status: 'unsupported_activity',
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

/**
 * คำนวณมุม (องศา) ระหว่าง 3 จุด (p1 -> p2 -> p3) โดย p2 เป็นจุดยอดมุม (Vertex)
 */
export function calculateAngle(
  p1: PoseLandmark,
  p2: PoseLandmark,
  p3: PoseLandmark
): number {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)

  if (angle > 180.0) {
    angle = 360.0 - angle
  }
  return rounded(angle)
}

/**
 * [TECHNICAL PROTOTYPE ONLY]
 * คำนวณค่ามุมทางเรขาคณิตสำหรับท่านั่ง ไม่ใช่การวินิจฉัยทางการแพทย์
 */
export function calculateSeatedPostureAngles(landmarks: PoseLandmark[]) {
  // Indices:
  // 11 = Left Shoulder, 12 = Right Shoulder
  // 23 = Left Hip, 24 = Right Hip
  // 25 = Left Knee, 26 = Right Knee
  // 27 = Left Ankle, 28 = Right Ankle

  const hasRequired = [11, 12, 23, 24, 25, 26, 27, 28].every(
    (i) => landmarks[i] && (landmarks[i].visibility ?? 0) >= TECHNICAL_VISIBILITY_GATE
  )

  if (!hasRequired) return null

  // คำนวณมุมสะโพก (Shoulder -> Hip -> Knee)
  const leftHipAngle = calculateAngle(landmarks[11], landmarks[23], landmarks[25])
  const rightHipAngle = calculateAngle(landmarks[12], landmarks[24], landmarks[26])

  // คำนวณมุมเข่า (Hip -> Knee -> Ankle)
  const leftKneeAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27])
  const rightKneeAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28])

  return {
    leftHipAngle,
    rightHipAngle,
    leftKneeAngle,
    rightKneeAngle,
    // MOCK_THRESHOLDS: ต้องได้รับการตรวจสอบ/กำหนดโดยนักกายภาพบำบัด
    // ห้ามใช้ค่าเหล่านี้เพื่อการประเมินผู้ใช้จนกว่าจะผ่าน clinical review
    mock_thresholds: {
      hip_min: 80, // TODO: Pending clinical review
      hip_max: 110, // TODO: Pending clinical review
      knee_min: 80, // TODO: Pending clinical review
      knee_max: 100 // TODO: Pending clinical review
    }
  }
}
