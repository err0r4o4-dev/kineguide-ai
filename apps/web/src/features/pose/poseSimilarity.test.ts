import type { PoseLandmark } from './poseGeometry'
import {
  comparePoseSequences,
  cosineSimilarity,
  dynamicTimeWarping,
  evaluateMovementAgainstReference,
  frameCosineSimilarity
} from './poseSimilarity'
import {
  calculateAngle,
  extractFrameFeatures,
  normalizeBodyLandmarks
} from './exerciseFeatures'
import type { ReferenceMovementModel } from './referenceMovementModel'
import { getExerciseConfig } from './referenceMovementModel'

const point = (x: number, y: number, z = 0): PoseLandmark => ({
  x,
  y,
  z,
  visibility: 0.95
})

const frame = (offset = 0) =>
  Array.from({ length: 33 }, (_, index) =>
    point(index + 1 + offset, index + 2 + offset, index + 3 + offset)
  )

describe('research pose similarity & feature extraction', () => {
  it('calculates bounded cosine similarity without accepting zero vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBe(1)
    expect(cosineSimilarity([1, 0, 0], [-1, 0, 0])).toBe(0)
    expect(cosineSimilarity([0, 0, 0], [1, 0, 0])).toBeNull()
  })

  it('averages the 33 landmark-vector similarities used by the cited study', () => {
    expect(frameCosineSimilarity(frame(), frame())).toBe(1)
    expect(frameCosineSimilarity(frame().slice(0, 32), frame())).toBeNull()
  })

  it('calculates joint angle between 3 landmarks correctly (90 degrees test)', () => {
    const a = point(0, 1, 0)
    const b = point(0, 0, 0)
    const c = point(1, 0, 0)
    const angle = calculateAngle(a, b, c)
    expect(angle).toBe(90)
  })

  it('normalizes landmarks relative to mid-hip and torso scale', () => {
    const rawLandmarks = Array.from({ length: 33 }, () => point(0.5, 0.5, 0))
    rawLandmarks[23] = point(0.4, 0.6, 0) // left hip
    rawLandmarks[24] = point(0.6, 0.6, 0) // right hip
    rawLandmarks[11] = point(0.4, 0.2, 0) // left shoulder
    rawLandmarks[12] = point(0.6, 0.2, 0) // right shoulder

    const normalized = normalizeBodyLandmarks(rawLandmarks)
    expect(normalized).toHaveLength(33)
    // Origin at mid-hip should be (0, 0)
    const midHipX = (normalized[23].x + normalized[24].x) / 2
    const midHipY = (normalized[23].y + normalized[24].y) / 2
    expect(midHipX).toBeCloseTo(0, 2)
    expect(midHipY).toBeCloseTo(0, 2)
  })

  it('uses DTW to align sequences that contain repeated frames and finds optimal path', () => {
    const reference = [[0], [1], [2]]
    const observed = [[0], [0], [1], [2]]

    const dtwResult = dynamicTimeWarping(reference, observed)
    expect(dtwResult.distance).toBe(0)
    expect(dtwResult.path.length).toBeGreaterThan(0)
  })

  it('evaluates movement against reference model and identifies joint deviation', () => {
    const landmarks1 = Array.from({ length: 33 }, () => point(0.5, 0.5, 0))
    // Left shoulder 90 deg: hip(0.5, 0.8), shoulder(0.5, 0.5), elbow(0.8, 0.5)
    landmarks1[23] = point(0.5, 0.8, 0)
    landmarks1[11] = point(0.5, 0.5, 0)
    landmarks1[13] = point(0.8, 0.5, 0)

    const refFeature = extractFrameFeatures(landmarks1, 0)

    const refModel: ReferenceMovementModel = {
      exerciseId: 'shoulder-movement-demo',
      exerciseSlug: 'shoulder-movement-demo',
      exerciseName: 'Shoulder Movement',
      fps: 30,
      frameCount: 1,
      durationSeconds: 1,
      features: [refFeature],
      config: getExerciseConfig('shoulder-movement-demo')
    }

    // User does incorrect pose (arm higher, e.g. 135 deg)
    const userLandmarks = Array.from({ length: 33 }, () => point(0.5, 0.5, 0))
    userLandmarks[23] = point(0.5, 0.8, 0)
    userLandmarks[11] = point(0.5, 0.5, 0)
    userLandmarks[13] = point(0.8, 0.2, 0) // Moved elbow up
    const userFeature = extractFrameFeatures(userLandmarks, 0)

    const comparison = evaluateMovementAgainstReference([userFeature], refModel)

    expect(comparison.overallScore).toBeGreaterThanOrEqual(0)
    expect(comparison.overallScore).toBeLessThanOrEqual(100)
    expect(comparison.jointErrors.length).toBeGreaterThan(0)
    const shoulderErr = comparison.jointErrors.find(
      (e) => e.joint === 'leftShoulder'
    )
    expect(shoulderErr).toBeDefined()
    expect(shoulderErr?.error).toBeGreaterThan(10)
  })

  it('keeps a research result unavailable without an approved reference', () => {
    expect(
      comparePoseSequences({
        observed: [frame()],
        reference: [],
        profile: {
          id: 'shoulder-front-research-v1',
          sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10781250/',
          method: 'cosine_dtw',
          researchSimilarityThreshold: 0.9,
          releaseStatus: 'research_only'
        }
      })
    ).toEqual({ status: 'reference_unavailable' })
  })
})
