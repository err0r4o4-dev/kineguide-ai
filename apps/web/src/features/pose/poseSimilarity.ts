import type { PoseLandmark } from './poseGeometry'

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

function clampSimilarity(value: number) {
  // The cited prototype maps cosine output to a non-negative similarity.
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
  const { x, y, z } = landmark
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return null
  }
  return [x, y, z as number]
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

function euclideanDistance(left: readonly number[], right: readonly number[]) {
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

export function dynamicTimeWarpingDistance(
  reference: readonly (readonly number[])[],
  observed: readonly (readonly number[])[]
): number {
  if (reference.length === 0 || observed.length === 0) {
    return Number.POSITIVE_INFINITY
  }

  let previous = new Array<number>(observed.length + 1).fill(
    Number.POSITIVE_INFINITY
  )
  previous[0] = 0

  for (
    let referenceIndex = 1;
    referenceIndex <= reference.length;
    referenceIndex += 1
  ) {
    const current = new Array<number>(observed.length + 1).fill(
      Number.POSITIVE_INFINITY
    )
    for (
      let observedIndex = 1;
      observedIndex <= observed.length;
      observedIndex += 1
    ) {
      const cost = euclideanDistance(
        reference[referenceIndex - 1],
        observed[observedIndex - 1]
      )
      current[observedIndex] =
        cost +
        Math.min(
          current[observedIndex - 1],
          previous[observedIndex],
          previous[observedIndex - 1]
        )
    }
    previous = current
  }

  return previous[observed.length]
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
    // Research similarity is not a diagnosis or clinical correctness decision.
    clinicalVerdict: null,
    profileId: profile.id,
    sourceUrl: profile.sourceUrl
  }
}
