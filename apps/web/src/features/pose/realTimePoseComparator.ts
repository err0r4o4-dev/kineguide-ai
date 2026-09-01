import type { ExerciseFeatures } from './exerciseFeatures'
import { extractFrameFeatures } from './exerciseFeatures'
import type { PoseLandmark } from './poseGeometry'
import type { DetailedMovementComparison } from './poseSimilarity'
import { evaluateMovementAgainstReference } from './poseSimilarity'
import type { ReferenceMovementModel } from './referenceMovementModel'

export interface RealTimeEvaluationResult {
  hasReference: boolean
  comparison: DetailedMovementComparison | null
  userFeatures: ExerciseFeatures | null
}

export class RealTimePoseComparator {
  private buffer: ExerciseFeatures[] = []
  private maxBufferSize: number
  private lastEvaluationTime = 0
  private evaluationIntervalMs = 200 // Subsample evaluation to ~5Hz to preserve 60FPS UI performance
  private cachedResult: DetailedMovementComparison | null = null

  constructor(windowDurationSeconds = 3, expectedFps = 15) {
    this.maxBufferSize = Math.max(10, windowDurationSeconds * expectedFps)
  }

  public clear(): void {
    this.buffer = []
    this.cachedResult = null
    this.lastEvaluationTime = 0
  }

  public update(
    landmarks: readonly PoseLandmark[] | null,
    referenceModel: ReferenceMovementModel | null,
    currentTimeMs: number = Date.now()
  ): RealTimeEvaluationResult {
    if (!landmarks || landmarks.length < 33) {
      return {
        hasReference: referenceModel !== null,
        comparison: null,
        userFeatures: null
      }
    }

    const currentFeatures = extractFrameFeatures(landmarks, currentTimeMs)
    this.buffer.push(currentFeatures)

    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift()
    }

    if (!referenceModel || referenceModel.features.length === 0) {
      return {
        hasReference: false,
        comparison: null,
        userFeatures: currentFeatures
      }
    }

    // Throttle heavy DTW computation
    if (
      currentTimeMs - this.lastEvaluationTime >= this.evaluationIntervalMs ||
      this.cachedResult === null
    ) {
      this.lastEvaluationTime = currentTimeMs
      this.cachedResult = evaluateMovementAgainstReference(
        this.buffer,
        referenceModel
      )
    }

    return {
      hasReference: true,
      comparison: this.cachedResult,
      userFeatures: currentFeatures
    }
  }
}
