import type { PoseLandmark } from './poseGeometry'

export const POSE_RESEARCH_LANDMARK_COUNT = 33

export interface PoseResearchProfile {
  id: string
  sourceUrl: string
  method: 'cosine_dtw'
  researchSimilarityThreshold: number
  releaseStatus: 'research_only' | 'clinically_approved'
  referenceSequenceStatus:
    'missing_clinician_reference' | 'approved_clinician_reference'
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
    reference.length !== POSE_RESEARCH_LANDMARK_COUNT ||
    observed.length !== POSE_RESEARCH_LANDMARK_COUNT
  ) {
    return null
  }

  let total = 0
  for (let index = 0; index < POSE_RESEARCH_LANDMARK_COUNT; index += 1) {
    const referenceVector = vectorFor(reference[index])
    const observedVector = vectorFor(observed[index])
    if (!referenceVector || !observedVector) return null
    const similarity = cosineSimilarity(referenceVector, observedVector)
    if (similarity === null) return null
    total += similarity
  }
  return total / POSE_RESEARCH_LANDMARK_COUNT
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
  if (frame.length !== POSE_RESEARCH_LANDMARK_COUNT) return null
  const flattened: number[] = []
  for (const landmark of frame) {
    const vector = vectorFor(landmark)
    if (!vector) return null
    flattened.push(...vector)
  }
  return flattened
}

export function comparePoseSequences({
  observed,
  reference,
  profile
}: ComparePoseSequencesInput): PoseSequenceComparison {
  if (profile.referenceSequenceStatus !== 'approved_clinician_reference') {
    return { status: 'reference_unavailable' }
  }
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
