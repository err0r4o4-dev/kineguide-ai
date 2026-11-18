import type { PoseLandmark } from './poseGeometry'
import {
  comparePoseSequences,
  cosineSimilarity,
  dynamicTimeWarping,
  frameCosineSimilarity
} from './poseSimilarity'

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

  it('uses DTW to align sequences that contain repeated frames and finds optimal path', () => {
    const reference = [[0], [1], [2]]
    const observed = [[0], [0], [1], [2]]

    const dtwResult = dynamicTimeWarping(reference, observed)
    expect(dtwResult.distance).toBe(0)
    expect(dtwResult.path.length).toBeGreaterThan(0)
  })

  it('keeps a research result unavailable without an approved reference', () => {
    expect(
      comparePoseSequences({
        observed: [frame()],
        reference: [frame()],
        profile: {
          id: 'shoulder-front-research-v1',
          sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10781250/',
          method: 'cosine_dtw',
          researchSimilarityThreshold: 0.9,
          releaseStatus: 'research_only',
          referenceSequenceStatus: 'missing_clinician_reference'
        }
      })
    ).toEqual({ status: 'reference_unavailable' })
  })

  it('keeps an approved research comparison separate from a clinical verdict', () => {
    expect(
      comparePoseSequences({
        observed: [frame()],
        reference: [frame()],
        profile: {
          id: 'approved-test-profile',
          sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10781250/',
          method: 'cosine_dtw',
          researchSimilarityThreshold: 0.9,
          releaseStatus: 'research_only',
          referenceSequenceStatus: 'approved_clinician_reference'
        }
      })
    ).toMatchObject({
      status: 'research_measurement',
      clinicalVerdict: null,
      profileId: 'approved-test-profile'
    })
  })
})
