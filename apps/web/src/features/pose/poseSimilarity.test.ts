import type { PoseLandmark } from './poseGeometry'
import {
  comparePoseSequences,
  cosineSimilarity,
  dynamicTimeWarpingDistance,
  frameCosineSimilarity
} from './poseSimilarity'

const point = (x: number, y: number, z: number): PoseLandmark => ({
  x,
  y,
  z,
  visibility: 0.95
})

const frame = (offset = 0) =>
  Array.from({ length: 33 }, (_, index) =>
    point(index + 1 + offset, index + 2 + offset, index + 3 + offset)
  )

describe('research pose similarity', () => {
  it('calculates bounded cosine similarity without accepting zero vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBe(1)
    expect(cosineSimilarity([1, 0, 0], [-1, 0, 0])).toBe(0)
    expect(cosineSimilarity([0, 0, 0], [1, 0, 0])).toBeNull()
  })

  it('averages the 33 landmark-vector similarities used by the cited study', () => {
    expect(frameCosineSimilarity(frame(), frame())).toBe(1)
    expect(frameCosineSimilarity(frame().slice(0, 32), frame())).toBeNull()
  })

  it('uses DTW to align sequences that contain repeated frames', () => {
    const reference = [[0], [1], [2]]
    const observed = [[0], [0], [1], [2]]

    expect(dynamicTimeWarpingDistance(reference, observed)).toBe(0)
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

  it('returns measurements but never a clinical correctness verdict', () => {
    const result = comparePoseSequences({
      observed: [frame(), frame(1)],
      reference: [frame(), frame(1)],
      profile: {
        id: 'shoulder-front-research-v1',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10781250/',
        method: 'cosine_dtw',
        researchSimilarityThreshold: 0.9,
        releaseStatus: 'research_only'
      }
    })

    expect(result).toMatchObject({
      status: 'research_measurement',
      meanFrameSimilarity: 1,
      dtwDistance: 0,
      meetsResearchThreshold: true,
      clinicalVerdict: null
    })
  })
})
