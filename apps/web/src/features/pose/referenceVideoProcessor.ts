import type { PoseAdapter } from './poseAdapter'
import type { ExerciseFeatures } from './exerciseFeatures'
import { extractFrameFeatures } from './exerciseFeatures'
import type { ReferenceMovementModel } from './referenceMovementModel'
import { getExerciseConfig } from './referenceMovementModel'

export interface VideoProcessingProgress {
  currentFrame: number
  totalFrames: number
  progressPercent: number
  status: 'idle' | 'loading_video' | 'extracting_landmarks' | 'generating_model' | 'completed' | 'error'
  errorMessage?: string
}

export interface ProcessVideoOptions {
  exerciseSlug: string
  exerciseName?: string
  targetFps?: number
  onProgress?: (progress: VideoProcessingProgress) => void
}

/**
 * Extracts MediaPipe Pose features frame-by-frame from a video element / file.
 */
export async function processReferenceVideo(
  videoFile: File | Blob,
  adapter: PoseAdapter,
  options: ProcessVideoOptions
): Promise<ReferenceMovementModel> {
  const { exerciseSlug, exerciseName = exerciseSlug, targetFps = 15, onProgress } = options
  const config = getExerciseConfig(exerciseSlug)

  const videoUrl = URL.createObjectURL(videoFile)
  const video = document.createElement('video')
  video.src = videoUrl
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'

  onProgress?.({
    currentFrame: 0,
    totalFrames: 100,
    progressPercent: 5,
    status: 'loading_video'
  })

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve()
    video.onerror = () => reject(new Error('Failed to load video metadata'))
  })

  const duration = video.duration || 1
  const frameInterval = 1 / targetFps
  const estimatedTotalFrames = Math.max(1, Math.floor(duration * targetFps))

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 480
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    URL.revokeObjectURL(videoUrl)
    throw new Error('Failed to obtain 2D canvas context')
  }

  const features: ExerciseFeatures[] = []
  let frameIndex = 0

  onProgress?.({
    currentFrame: 0,
    totalFrames: estimatedTotalFrames,
    progressPercent: 10,
    status: 'extracting_landmarks'
  })

  for (let currentTime = 0; currentTime < duration; currentTime += frameInterval) {
    video.currentTime = currentTime
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve()
    })

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const timestampMs = Math.round(currentTime * 1000)

    try {
      const detection = adapter.detect(canvas, timestampMs)
      if (detection.poses && detection.poses.length > 0) {
        const primaryPose = detection.poses[0]
        const frameFeature = extractFrameFeatures(primaryPose, timestampMs)
        features.push(frameFeature)
      }
    } catch (err) {
      console.warn(`Frame at ${currentTime}s pose detection skipped`, err)
    }

    frameIndex++
    const progress = Math.min(90, 10 + Math.floor((frameIndex / estimatedTotalFrames) * 80))
    onProgress?.({
      currentFrame: frameIndex,
      totalFrames: estimatedTotalFrames,
      progressPercent: progress,
      status: 'extracting_landmarks'
    })
  }

  URL.revokeObjectURL(videoUrl)

  onProgress?.({
    currentFrame: frameIndex,
    totalFrames: frameIndex,
    progressPercent: 95,
    status: 'generating_model'
  })

  // Determine keyframes (start, peak, return) based on primary angle movement
  let peakIndex = Math.floor(features.length / 2)
  if (config.repCounting?.primaryJoint && features.length > 2) {
    const joint = config.repCounting.primaryJoint
    let maxDiff = -1
    const baseAngle = features[0]?.angles[joint] ?? 0

    for (let i = 0; i < features.length; i++) {
      const angle = features[i]?.angles[joint]
      if (angle !== undefined) {
        const diff = Math.abs(angle - baseAngle)
        if (diff > maxDiff) {
          maxDiff = diff
          peakIndex = i
        }
      }
    }
  }

  const model: ReferenceMovementModel = {
    exerciseId: config.id,
    exerciseSlug,
    exerciseName,
    fps: targetFps,
    frameCount: features.length,
    durationSeconds: Number(duration.toFixed(2)),
    features,
    keyFrames: {
      start: 0,
      peak: peakIndex,
      end: Math.max(0, features.length - 1)
    },
    config
  }

  onProgress?.({
    currentFrame: frameIndex,
    totalFrames: frameIndex,
    progressPercent: 100,
    status: 'completed'
  })

  return model
}

/**
 * Aggregates multiple Reference Movement Models into a consensus Ground Truth Model.
 * This prevents the AI from overfitting to one individual demonstrator's body proportions.
 */
export function aggregateMultiVideoModels(
  models: ReferenceMovementModel[]
): ReferenceMovementModel {
  if (models.length === 0) {
    throw new Error('No models to aggregate')
  }
  if (models.length === 1) {
    return models[0]
  }

  const base = models[0]
  // Normalize frame counts using linear resampling to match base model length
  const targetLen = base.features.length

  const aggregatedFeatures: ExerciseFeatures[] = []

  for (let i = 0; i < targetLen; i++) {
    const normalizedLandmarksSum = Array.from({ length: 33 }, () => ({
      x: 0,
      y: 0,
      z: 0,
      visibility: 0
    }))
    const angleSums: Record<string, number> = {}
    const angleCounts: Record<string, number> = {}

    for (const m of models) {
      const idx = Math.min(
        m.features.length - 1,
        Math.floor((i / targetLen) * m.features.length)
      )
      const feat = m.features[idx]
      if (!feat) continue

      feat.normalizedLandmarks.forEach((lm, lmIdx) => {
        normalizedLandmarksSum[lmIdx].x += lm.x
        normalizedLandmarksSum[lmIdx].y += lm.y
        normalizedLandmarksSum[lmIdx].z += lm.z ?? 0
        normalizedLandmarksSum[lmIdx].visibility += lm.visibility ?? 1
      })

      Object.entries(feat.angles).forEach(([jName, val]) => {
        if (val !== undefined && Number.isFinite(val)) {
          angleSums[jName] = (angleSums[jName] || 0) + val
          angleCounts[jName] = (angleCounts[jName] || 0) + 1
        }
      })
    }

    const meanNormalizedLandmarks = normalizedLandmarksSum.map((pt) => ({
      x: Number((pt.x / models.length).toFixed(4)),
      y: Number((pt.y / models.length).toFixed(4)),
      z: Number((pt.z / models.length).toFixed(4)),
      visibility: Number((pt.visibility / models.length).toFixed(2))
    }))

    const meanAngles: Record<string, number> = {}
    Object.entries(angleSums).forEach(([jName, sum]) => {
      const count = angleCounts[jName] || 1
      meanAngles[jName] = Math.round(sum / count)
    })

    aggregatedFeatures.push({
      timestamp: base.features[i]?.timestamp ?? i * 33,
      landmarks: base.features[i]?.landmarks ?? [],
      normalizedLandmarks: meanNormalizedLandmarks,
      angles: meanAngles
    })
  }

  return {
    ...base,
    frameCount: aggregatedFeatures.length,
    features: aggregatedFeatures
  }
}
