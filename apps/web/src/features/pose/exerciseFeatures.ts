import type { PoseLandmark } from './poseGeometry'

/**
 * Standard BlazePose 33 Landmarks Indices:
 * 0: nose, 1: left_eye_inner, 2: left_eye, 3: left_eye_outer, 4: right_eye_inner, 5: right_eye, 6: right_eye_outer
 * 7: left_ear, 8: right_ear, 9: mouth_left, 10: mouth_right
 * 11: left_shoulder, 12: right_shoulder, 13: left_elbow, 14: right_elbow, 15: left_wrist, 16: right_wrist
 * 17: left_pinky, 18: right_pinky, 19: left_index, 20: right_index, 21: left_thumb, 22: right_thumb
 * 23: left_hip, 24: right_hip, 25: left_knee, 26: right_knee, 27: left_ankle, 28: right_ankle
 * 29: left_heel, 30: right_heel, 31: left_foot_index, 32: right_foot_index
 */

export type JointName =
  | 'leftElbow'
  | 'rightElbow'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle'
  | 'torsoInclination'

export type JointAngleMap = Partial<Record<JointName, number>>

export interface ExerciseFeatures {
  timestamp: number
  landmarks: PoseLandmark[]
  normalizedLandmarks: PoseLandmark[]
  angles: JointAngleMap
}

export interface JointError {
  joint: JointName
  referenceAngle: number
  userAngle: number
  error: number
  status: 'correct' | 'warning' | 'incorrect'
}

/**
 * Calculate 2D/3D angle in degrees between three points (A -> B -> C) where B is the vertex.
 */
export function calculateAngle(
  a: PoseLandmark,
  b: PoseLandmark,
  c: PoseLandmark
): number | null {
  if (
    !Number.isFinite(a.x) ||
    !Number.isFinite(a.y) ||
    !Number.isFinite(b.x) ||
    !Number.isFinite(b.y) ||
    !Number.isFinite(c.x) ||
    !Number.isFinite(c.y)
  ) {
    return null
  }

  // Vector BA and Vector BC
  const v1 = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: (a.z ?? 0) - (b.z ?? 0)
  }
  const v2 = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: (c.z ?? 0) - (b.z ?? 0)
  }

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z)
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z)

  if (mag1 === 0 || mag2 === 0) return null

  const cosine = Math.max(-1, Math.min(1, dot / (mag1 * mag2)))
  const angleRad = Math.acos(cosine)
  return Math.round((angleRad * 180) / Math.PI)
}

/**
 * Normalizes landmarks relative to the body coordinate system:
 * - Origin (0,0,0) set to Mid-Hip (center of left and right hip)
 * - Scale factor normalized by Torso length (Mid-hip to Mid-shoulder) or Shoulder width
 * This provides scale and translation invariance across different body sizes and camera distances.
 */
export function normalizeBodyLandmarks(
  landmarks: readonly PoseLandmark[]
): PoseLandmark[] {
  if (landmarks.length < 33) return [...landmarks]

  const leftHip = landmarks[23]
  const rightHip = landmarks[24]
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]

  const hasHips =
    leftHip &&
    rightHip &&
    Number.isFinite(leftHip.x) &&
    Number.isFinite(rightHip.x)
  const hasShoulders =
    leftShoulder &&
    rightShoulder &&
    Number.isFinite(leftShoulder.x) &&
    Number.isFinite(rightShoulder.x)

  // Mid-hip as center
  const origin = hasHips
    ? {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2,
        z: ((leftHip.z ?? 0) + (rightHip.z ?? 0)) / 2
      }
    : { x: 0.5, y: 0.5, z: 0 }

  // Reference scale: torso length or shoulder width
  let scale = 1
  if (hasHips && hasShoulders) {
    const midShoulder = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
      z: ((leftShoulder.z ?? 0) + (rightShoulder.z ?? 0)) / 2
    }
    const torsoDist = Math.sqrt(
      (midShoulder.x - origin.x) ** 2 +
        (midShoulder.y - origin.y) ** 2 +
        (midShoulder.z - origin.z) ** 2
    )
    if (torsoDist > 0.01) {
      scale = torsoDist
    }
  } else if (hasShoulders) {
    const shoulderDist = Math.sqrt(
      (leftShoulder.x - rightShoulder.x) ** 2 +
        (leftShoulder.y - rightShoulder.y) ** 2 +
        ((leftShoulder.z ?? 0) - (rightShoulder.z ?? 0)) ** 2
    )
    if (shoulderDist > 0.01) {
      scale = shoulderDist
    }
  }

  return landmarks.map((lm) => ({
    x: Number(((lm.x - origin.x) / scale).toFixed(4)),
    y: Number(((lm.y - origin.y) / scale).toFixed(4)),
    z: Number((((lm.z ?? 0) - origin.z) / scale).toFixed(4)),
    visibility: lm.visibility
  }))
}

/**
 * Extracts key joint angles from 33 BlazePose landmarks.
 */
export function extractJointAngles(
  landmarks: readonly PoseLandmark[]
): JointAngleMap {
  if (landmarks.length < 33) return {}

  const angles: JointAngleMap = {}

  // 11: left_shoulder, 13: left_elbow, 15: left_wrist
  if (landmarks[11] && landmarks[13] && landmarks[15]) {
    const leftElbow = calculateAngle(
      landmarks[11],
      landmarks[13],
      landmarks[15]
    )
    if (leftElbow !== null) angles.leftElbow = leftElbow
  }

  // 12: right_shoulder, 14: right_elbow, 16: right_wrist
  if (landmarks[12] && landmarks[14] && landmarks[16]) {
    const rightElbow = calculateAngle(
      landmarks[12],
      landmarks[14],
      landmarks[16]
    )
    if (rightElbow !== null) angles.rightElbow = rightElbow
  }

  // 23: left_hip, 11: left_shoulder, 13: left_elbow (Shoulder angle)
  if (landmarks[23] && landmarks[11] && landmarks[13]) {
    const leftShoulder = calculateAngle(
      landmarks[23],
      landmarks[11],
      landmarks[13]
    )
    if (leftShoulder !== null) angles.leftShoulder = leftShoulder
  }

  // 24: right_hip, 12: right_shoulder, 14: right_elbow (Shoulder angle)
  if (landmarks[24] && landmarks[12] && landmarks[14]) {
    const rightShoulder = calculateAngle(
      landmarks[24],
      landmarks[12],
      landmarks[14]
    )
    if (rightShoulder !== null) angles.rightShoulder = rightShoulder
  }

  // 11: left_shoulder, 23: left_hip, 25: left_knee (Hip angle)
  if (landmarks[11] && landmarks[23] && landmarks[25]) {
    const leftHip = calculateAngle(landmarks[11], landmarks[23], landmarks[25])
    if (leftHip !== null) angles.leftHip = leftHip
  }

  // 12: right_shoulder, 24: right_hip, 26: right_knee (Hip angle)
  if (landmarks[12] && landmarks[24] && landmarks[26]) {
    const rightHip = calculateAngle(landmarks[12], landmarks[24], landmarks[26])
    if (rightHip !== null) angles.rightHip = rightHip
  }

  // 23: left_hip, 25: left_knee, 27: left_ankle (Knee angle)
  if (landmarks[23] && landmarks[25] && landmarks[27]) {
    const leftKnee = calculateAngle(landmarks[23], landmarks[25], landmarks[27])
    if (leftKnee !== null) angles.leftKnee = leftKnee
  }

  // 24: right_hip, 26: right_knee, 28: right_ankle (Knee angle)
  if (landmarks[24] && landmarks[26] && landmarks[28]) {
    const rightKnee = calculateAngle(
      landmarks[24],
      landmarks[26],
      landmarks[28]
    )
    if (rightKnee !== null) angles.rightKnee = rightKnee
  }

  // 25: left_knee, 27: left_ankle, 31: left_foot_index (Ankle angle)
  if (landmarks[25] && landmarks[27] && landmarks[31]) {
    const leftAnkle = calculateAngle(
      landmarks[25],
      landmarks[27],
      landmarks[31]
    )
    if (leftAnkle !== null) angles.leftAnkle = leftAnkle
  }

  // 26: right_knee, 28: right_ankle, 32: right_foot_index (Ankle angle)
  if (landmarks[26] && landmarks[28] && landmarks[32]) {
    const rightAnkle = calculateAngle(
      landmarks[26],
      landmarks[28],
      landmarks[32]
    )
    if (rightAnkle !== null) angles.rightAnkle = rightAnkle
  }

  return angles
}

/**
 * Extracts all features (landmarks, body-normalized landmarks, joint angles) for a single frame.
 */
export function extractFrameFeatures(
  landmarks: readonly PoseLandmark[],
  timestamp = 0
): ExerciseFeatures {
  const normalizedLandmarks = normalizeBodyLandmarks(landmarks)
  const angles = extractJointAngles(landmarks)

  return {
    timestamp,
    landmarks: [...landmarks],
    normalizedLandmarks,
    angles
  }
}
