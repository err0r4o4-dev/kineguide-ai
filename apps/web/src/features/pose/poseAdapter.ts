import type { PoseLandmark } from './poseGeometry'

export interface PoseAdapter {
  detect(video: HTMLVideoElement, timestampMs: number): PoseLandmark[][]
  close(): void
}

export type PoseAdapterFactory = () => Promise<PoseAdapter>

const MEDIAPIPE_VERSION = '1.0.1'
const WASM_BASE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

export const createMediaPipePoseAdapter: PoseAdapterFactory = async () => {
  if (typeof WebAssembly === 'undefined') {
    throw new Error('POSE_UNSUPPORTED')
  }

  const { FilesetResolver, PoseLandmarker } =
    await import('@mediapipe/tasks-vision')
  const files = await FilesetResolver.forVisionTasks(WASM_BASE_URL)
  const landmarker = await PoseLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false
  })

  return {
    detect(video, timestampMs) {
      const result = landmarker.detectForVideo(video, timestampMs)
      return result.landmarks.map((pose) =>
        pose.map(({ x, y, z, visibility }) => ({ x, y, z, visibility }))
      )
    },
    close() {
      landmarker.close()
    }
  }
}
