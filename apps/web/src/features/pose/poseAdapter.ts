import type { PoseLandmark } from './poseGeometry'

export interface PoseAdapter {
  detect(video: HTMLVideoElement, timestampMs: number): PoseDetectionResult
  close(): void
}

export interface BlinkEstimate {
  left: number
  right: number
  detected: boolean
}

export interface PoseDetectionResult {
  poses: PoseLandmark[][]
  faceLandmarks: PoseLandmark[] | null
  leftHandLandmarks: PoseLandmark[] | null
  rightHandLandmarks: PoseLandmark[] | null
  blink: BlinkEstimate | null
}

export type PoseAdapterFactory = () => Promise<PoseAdapter>

const MEDIAPIPE_VERSION = '1.0.1'
const WASM_BASE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
const POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
const HOLISTIC_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task'

// Technical visualization heuristic only; this is not a health measurement.
const BLINK_VISUALIZATION_GATE = 0.5

function copyLandmarks(
  landmarks: readonly PoseLandmark[] | undefined
): PoseLandmark[] | null {
  return (
    landmarks?.map(({ x, y, z, visibility }) => ({
      x,
      y,
      z,
      visibility
    })) ?? null
  )
}

export const createMediaPipePoseAdapter: PoseAdapterFactory = async () => {
  if (typeof WebAssembly === 'undefined') {
    throw new Error('POSE_UNSUPPORTED')
  }

  const { FilesetResolver, HolisticLandmarker, PoseLandmarker } =
    await import('@mediapipe/tasks-vision')
  const files = await FilesetResolver.forVisionTasks(WASM_BASE_URL)
  const poseLandmarker = await PoseLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: POSE_MODEL_URL },
    runningMode: 'VIDEO',
    // A second pose is detected only so the UI can refuse an ambiguous frame.
    // KineGuide never selects or assesses one person from a group.
    numPoses: 2,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false
  })
  let holisticLandmarker: Awaited<
    ReturnType<typeof HolisticLandmarker.createFromOptions>
  >
  try {
    holisticLandmarker = await HolisticLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: HOLISTIC_MODEL_URL },
      runningMode: 'VIDEO',
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minHandLandmarksConfidence: 0.5,
      outputFaceBlendshapes: true,
      outputPoseSegmentationMasks: false
    })
  } catch (error) {
    poseLandmarker.close()
    throw error
  }

  return {
    detect(video, timestampMs) {
      const poseResult = poseLandmarker.detectForVideo(video, timestampMs)
      const holisticResult = holisticLandmarker.detectForVideo(
        video,
        timestampMs
      )
      const blendshapes = holisticResult.faceBlendshapes[0]?.categories ?? []
      const left =
        blendshapes.find(({ categoryName }) => categoryName === 'eyeBlinkLeft')
          ?.score ?? 0
      const right =
        blendshapes.find(({ categoryName }) => categoryName === 'eyeBlinkRight')
          ?.score ?? 0

      return {
        poses: poseResult.landmarks.map((pose) =>
          pose.map(({ x, y, z, visibility }) => ({ x, y, z, visibility }))
        ),
        faceLandmarks: copyLandmarks(holisticResult.faceLandmarks[0]),
        leftHandLandmarks: copyLandmarks(holisticResult.leftHandLandmarks[0]),
        rightHandLandmarks: copyLandmarks(holisticResult.rightHandLandmarks[0]),
        blink: holisticResult.faceLandmarks[0]
          ? {
              left,
              right,
              detected:
                left >= BLINK_VISUALIZATION_GATE ||
                right >= BLINK_VISUALIZATION_GATE
            }
          : null
      }
    },
    close() {
      poseLandmarker.close()
      holisticLandmarker.close()
    }
  }
}
