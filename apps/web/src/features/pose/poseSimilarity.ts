import type { PoseLandmark } from './poseGeometry'
import type {
  ExerciseFeatures,
  JointAngleMap,
  JointError,
  JointName
} from './exerciseFeatures'
import type {
  ExerciseConfig,
  ReferenceMovementModel
} from './referenceMovementModel'
import { getExerciseConfig } from './referenceMovementModel'

const EXPECTED_LANDMARK_COUNT = 33

export interface PoseResearchProfile {
  id: string
  sourceUrl: string
  method: 'cosine_dtw'
  researchSimilarityThreshold: number
  releaseStatus: 'research_only' | 'clinically_approved'
}

interface ComparePoseSequencesInput {
  observed: readonly PoseLandmark[][]
  reference: readonly PoseLandmark[][]
  profile: PoseResearchProfile
}

export type PoseSequenceComparison =
  | { status: 'reference_unavailable' }
  | { status: 'observation_unavailable' }
  | {
      status: 'research_measurement'
      meanFrameSimilarity: number
      dtwDistance: number
      meetsResearchThreshold: boolean
      clinicalVerdict: null
      profileId: string
      sourceUrl: string
    }

export interface DetailedMovementComparison {
  overallScore: number // 0 - 100
  landmarkSimilarity: number // 0 - 1
  angleSimilarity: number // 0 - 1
  temporalSimilarity: number // 0 - 1
  dtwDistance: number
  matchedReferenceFrameIndex: number
  jointErrors: JointError[]
  feedbackMessages: {
    status: 'correct' | 'warning' | 'incorrect'
    messageKey: string
    joint?: JointName
    degreeDiff?: number
  }[]
}

function clampSimilarity(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function cosineSimilarity(
  left: readonly number[],
  right: readonly number[]
): number | null {
  if (left.length === 0 || left.length !== right.length) return null

  let dot = 0
  let leftMagnitude = 0
  let rightMagnitude = 0
  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index]
    const rightValue = right[index]
    if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return null
    dot += leftValue * rightValue
    leftMagnitude += leftValue * leftValue
    rightMagnitude += rightValue * rightValue
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude)
  if (denominator === 0) return null
  return clampSimilarity(dot / denominator)
}

function vectorFor(landmark: PoseLandmark): readonly number[] | null {
  const { x, y, z = 0 } = landmark
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return null
  }
  return [x, y, z]
}

export function frameCosineSimilarity(
  reference: readonly PoseLandmark[],
  observed: readonly PoseLandmark[]
): number | null {
  if (
    reference.length !== EXPECTED_LANDMARK_COUNT ||
    observed.length !== EXPECTED_LANDMARK_COUNT
  ) {
    return null
  }

  let total = 0
  for (let index = 0; index < EXPECTED_LANDMARK_COUNT; index += 1) {
    const referenceVector = vectorFor(reference[index])
    const observedVector = vectorFor(observed[index])
    if (!referenceVector || !observedVector) return null
    const similarity = cosineSimilarity(referenceVector, observedVector)
    if (similarity === null) return null
    total += similarity
  }
  return total / EXPECTED_LANDMARK_COUNT
}

export function euclideanDistance(
  left: readonly number[],
  right: readonly number[]
) {
  if (left.length !== right.length || left.length === 0)
    return Number.POSITIVE_INFINITY
  let squared = 0
  for (let index = 0; index < left.length; index += 1) {
    const delta = left[index] - right[index]
    if (!Number.isFinite(delta)) return Number.POSITIVE_INFINITY
    squared += delta * delta
  }
  return Math.sqrt(squared)
}

/**
 * Computes Dynamic Time Warping distance and optimal warping alignment path.
 */
export function dynamicTimeWarping(
  reference: readonly (readonly number[])[],
  observed: readonly (readonly number[])[]
): {
  distance: number
  path: [number, number][] // [refIndex, obsIndex]
} {
  const n = reference.length
  const m = observed.length
  if (n === 0 || m === 0) {
    return { distance: Number.POSITIVE_INFINITY, path: [] }
  }

  const dtw: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(Number.POSITIVE_INFINITY)
  )
  dtw[0][0] = 0

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = euclideanDistance(reference[i - 1], observed[j - 1])
      dtw[i][j] =
        cost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1])
    }
  }

  // Backtrack to find optimal path
  let i = n
  let j = m
  const path: [number, number][] = []

  while (i > 0 || j > 0) {
    path.unshift([i - 1, j - 1])
    if (i === 1 && j === 1) break
    if (i === 1) {
      j--
    } else if (j === 1) {
      i--
    } else {
      const minVal = Math.min(dtw[i - 1][j - 1], dtw[i - 1][j], dtw[i][j - 1])
      if (minVal === dtw[i - 1][j - 1]) {
        i--
        j--
      } else if (minVal === dtw[i - 1][j]) {
        i--
      } else {
        j--
      }
    }
  }

  return { distance: dtw[n][m], path }
}

export function dynamicTimeWarpingDistance(
  reference: readonly (readonly number[])[],
  observed: readonly (readonly number[])[]
): number {
  return dynamicTimeWarping(reference, observed).distance
}

function flattenFrame(frame: readonly PoseLandmark[]) {
  if (frame.length !== EXPECTED_LANDMARK_COUNT) return null
  const flattened: number[] = []
  for (const landmark of frame) {
    const vector = vectorFor(landmark)
    if (!vector) return null
    flattened.push(...vector)
  }
  return flattened
}

/**
 * Multi-dimensional feature vector per frame:
 * Combines Body-Normalized Landmarks + Selected Joint Angles (scaled to 0-1)
 */
export function createFeatureVector(
  features: ExerciseFeatures,
  importantAngles: JointName[] = [
    'leftShoulder',
    'rightShoulder',
    'leftElbow',
    'rightElbow',
    'leftKnee',
    'rightKnee'
  ]
): number[] {
  const vector: number[] = []

  // Normalized landmarks (x, y, z)
  for (const lm of features.normalizedLandmarks) {
    vector.push(lm.x, lm.y, lm.z ?? 0)
  }

  // Key angles normalized to 0-1 range (angle / 180)
  for (const joint of importantAngles) {
    const angle = features.angles[joint]
    if (angle !== undefined && Number.isFinite(angle)) {
      vector.push(angle / 180)
    } else {
      vector.push(0.5) // Default neutral angle
    }
  }

  return vector
}

/**
 * Calculates joint error analysis between reference frame and user frame.
 */
export function analyzeJointErrors(
  refAngles: JointAngleMap,
  userAngles: JointAngleMap,
  config: ExerciseConfig
): JointError[] {
  const errors: JointError[] = []

  for (const joint of config.importantAngles) {
    const refAngle = refAngles[joint]
    const userAngle = userAngles[joint]

    if (
      refAngle !== undefined &&
      userAngle !== undefined &&
      Number.isFinite(refAngle) &&
      Number.isFinite(userAngle)
    ) {
      const error = Math.abs(refAngle - userAngle)
      let status: 'correct' | 'warning' | 'incorrect' = 'correct'

      if (error > config.thresholds.incorrect) {
        status = 'incorrect'
      } else if (error > config.thresholds.warning) {
        status = 'warning'
      }

      errors.push({
        joint,
        referenceAngle: refAngle,
        userAngle,
        error,
        status
      })
    }
  }

  return errors
}

/**
 * Comprehensive Movement Quality & Similarity Evaluation against a Reference Movement Model.
 */
export function evaluateMovementAgainstReference(
  userSequence: ExerciseFeatures[],
  referenceModel: ReferenceMovementModel
): DetailedMovementComparison {
  if (userSequence.length === 0 || referenceModel.features.length === 0) {
    return {
      overallScore: 0,
      landmarkSimilarity: 0,
      angleSimilarity: 0,
      temporalSimilarity: 0,
      dtwDistance: Number.POSITIVE_INFINITY,
      matchedReferenceFrameIndex: 0,
      jointErrors: [],
      feedbackMessages: [
        {
          status: 'warning',
          messageKey: 'session.feedback.noMovementDetected'
        }
      ]
    }
  }

  const config =
    referenceModel.config || getExerciseConfig(referenceModel.exerciseSlug)
  const importantAngles = config.importantAngles

  // Build feature vectors
  const refVectors = referenceModel.features.map((f) =>
    createFeatureVector(f, importantAngles)
  )
  const userVectors = userSequence.map((f) =>
    createFeatureVector(f, importantAngles)
  )

  // 1. DTW Alignment
  const { distance: dtwDist, path } = dynamicTimeWarping(
    refVectors,
    userVectors
  )

  // Find the reference frame aligned with the most recent user frame
  const latestUserIndex = userSequence.length - 1
  let matchedRefIndex = referenceModel.features.length - 1
  for (let idx = path.length - 1; idx >= 0; idx--) {
    if (path[idx][1] === latestUserIndex) {
      matchedRefIndex = path[idx][0]
      break
    }
  }

  const matchedRefFrame =
    referenceModel.features[matchedRefIndex] || referenceModel.features[0]
  const latestUserFrame = userSequence[latestUserIndex]

  // 2. Landmark Similarity (Cosine of normalized landmarks)
  let landmarkSim = 0
  const pairedLen = Math.min(
    userSequence.length,
    referenceModel.features.length
  )
  let landmarkSimSum = 0
  let validCount = 0

  for (let i = 0; i < pairedLen; i++) {
    const sim = frameCosineSimilarity(
      referenceModel.features[i].landmarks,
      userSequence[i].landmarks
    )
    if (sim !== null) {
      landmarkSimSum += sim
      validCount++
    }
  }
  landmarkSim = validCount > 0 ? landmarkSimSum / validCount : 0.5

  // 3. Joint Angle Similarity & Joint Errors
  const jointErrors = analyzeJointErrors(
    matchedRefFrame.angles,
    latestUserFrame.angles,
    config
  )

  let angleScoreSum = 0
  if (jointErrors.length > 0) {
    for (const err of jointErrors) {
      // Angular score: 100% at 0 deg diff, down linearly or gaussian
      const score = Math.max(0, 1 - err.error / 60)
      angleScoreSum += score
    }
    angleScoreSum /= jointErrors.length
  } else {
    angleScoreSum = 0.8 // Neutral if not enough joint data
  }
  const angleSimilarity = clampSimilarity(angleScoreSum)

  // 4. Temporal Similarity (Normalized DTW score: lower distance is better)
  const maxPossibleDtw = Math.max(1, userSequence.length * 2)
  const temporalSimilarity = clampSimilarity(
    1 - Math.min(dtwDist, maxPossibleDtw) / maxPossibleDtw
  )

  // 5. Overall Score (0-100)
  const weights = config.similarityWeights || {
    landmark: 0.3,
    angle: 0.5,
    temporal: 0.2
  }
  const rawScore =
    landmarkSim * weights.landmark +
    angleSimilarity * weights.angle +
    temporalSimilarity * weights.temporal

  const overallScore = Math.round(clampSimilarity(rawScore) * 100)

  // 6. Actionable Feedback Messages
  const feedbackMessages: DetailedMovementComparison['feedbackMessages'] = []

  for (const err of jointErrors) {
    if (err.status === 'incorrect') {
      feedbackMessages.push({
        status: 'incorrect',
        messageKey: `session.feedback.jointError_${err.joint}`,
        joint: err.joint,
        degreeDiff: Math.round(err.error)
      })
    } else if (err.status === 'warning') {
      feedbackMessages.push({
        status: 'warning',
        messageKey: `session.feedback.jointWarning_${err.joint}`,
        joint: err.joint,
        degreeDiff: Math.round(err.error)
      })
    }
  }

  if (feedbackMessages.length === 0) {
    feedbackMessages.push({
      status: 'correct',
      messageKey: 'session.feedback.formGood'
    })
  }

  return {
    overallScore,
    landmarkSimilarity: landmarkSim,
    angleSimilarity,
    temporalSimilarity,
    dtwDistance: Number.isFinite(dtwDist) ? Number(dtwDist.toFixed(2)) : 999,
    matchedReferenceFrameIndex: matchedRefIndex,
    jointErrors,
    feedbackMessages
  }
}

export function comparePoseSequences({
  observed,
  reference,
  profile
}: ComparePoseSequencesInput): PoseSequenceComparison {
  if (reference.length === 0) return { status: 'reference_unavailable' }
  if (observed.length === 0) return { status: 'observation_unavailable' }

  const pairedFrameCount = Math.min(reference.length, observed.length)
  let similarityTotal = 0
  for (let index = 0; index < pairedFrameCount; index += 1) {
    const similarity = frameCosineSimilarity(reference[index], observed[index])
    if (similarity === null) return { status: 'observation_unavailable' }
    similarityTotal += similarity
  }

  const referenceVectors = reference.map(flattenFrame)
  const observedVectors = observed.map(flattenFrame)
  if (
    referenceVectors.some((item) => item === null) ||
    observedVectors.some((item) => item === null)
  ) {
    return { status: 'observation_unavailable' }
  }

  const meanFrameSimilarity = similarityTotal / pairedFrameCount
  return {
    status: 'research_measurement',
    meanFrameSimilarity,
    dtwDistance: dynamicTimeWarpingDistance(
      referenceVectors as number[][],
      observedVectors as number[][]
    ),
    meetsResearchThreshold:
      meanFrameSimilarity > profile.researchSimilarityThreshold,
    clinicalVerdict: null,
    profileId: profile.id,
    sourceUrl: profile.sourceUrl
  }
}
