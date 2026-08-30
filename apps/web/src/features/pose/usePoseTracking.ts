import { useEffect, useState, type RefObject } from 'react'

import type {
  BlinkEstimate,
  PoseAdapter,
  PoseAdapterFactory
} from './poseAdapter'
import type { PoseLandmark } from './poseGeometry'
import { classifyPoseFrame, type ClassifiedPoseFrame } from './poseGeometry'

export type PoseTrackingStatus =
  | 'idle'
  | 'loading_model'
  | 'ready'
  | 'adjust_camera'
  | 'no_pose'
  | 'multiple_poses'
  | 'unsupported_exercise'
  | 'unavailable'
  | 'error'

export interface PoseTrackingSnapshot extends Omit<
  ClassifiedPoseFrame,
  'status'
> {
  status: PoseTrackingStatus
  faceLandmarks: PoseLandmark[] | null
  leftHandLandmarks: PoseLandmark[] | null
  rightHandLandmarks: PoseLandmark[] | null
  blink: BlinkEstimate | null
}

const EMPTY_FRAME: ClassifiedPoseFrame = {
  status: 'no_pose',
  landmarks: null,
  bounds: null,
  unreliableLandmarks: []
}

const EMPTY_DETAILS = {
  faceLandmarks: null,
  leftHandLandmarks: null,
  rightHandLandmarks: null,
  blink: null
} as const

const INFERENCE_INTERVAL_MS = 125

export function usePoseTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  active: boolean,
  exerciseSlug: string,
  createAdapter: PoseAdapterFactory
) {
  const [snapshot, setSnapshot] = useState<PoseTrackingSnapshot>({
    ...EMPTY_FRAME,
    ...EMPTY_DETAILS,
    status: 'idle'
  })

  useEffect(() => {
    if (!active) {
      setSnapshot({ ...EMPTY_FRAME, ...EMPTY_DETAILS, status: 'idle' })
      return
    }

    let adapter: PoseAdapter | null = null
    let animationFrame = 0
    let cancelled = false
    let lastInference = 0

    const schedule = () => {
      animationFrame = window.requestAnimationFrame(processFrame)
    }
    const processFrame = (timestamp: number) => {
      if (cancelled) return
      const video = videoRef.current
      if (
        adapter &&
        video &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        timestamp - lastInference >= INFERENCE_INTERVAL_MS
      ) {
        lastInference = timestamp
        try {
          const result = adapter.detect(video, timestamp)
          setSnapshot({
            ...classifyPoseFrame(result.poses, exerciseSlug),
            faceLandmarks: result.faceLandmarks,
            leftHandLandmarks: result.leftHandLandmarks,
            rightHandLandmarks: result.rightHandLandmarks,
            blink: result.blink
          })
        } catch {
          adapter.close()
          adapter = null
          setSnapshot({ ...EMPTY_FRAME, ...EMPTY_DETAILS, status: 'error' })
          return
        }
      }
      schedule()
    }

    setSnapshot({
      ...EMPTY_FRAME,
      ...EMPTY_DETAILS,
      status: 'loading_model'
    })
    void createAdapter()
      .then((createdAdapter) => {
        if (cancelled) {
          createdAdapter.close()
          return
        }
        adapter = createdAdapter
        setSnapshot({ ...EMPTY_FRAME, ...EMPTY_DETAILS, status: 'no_pose' })
        schedule()
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot({
            ...EMPTY_FRAME,
            ...EMPTY_DETAILS,
            status: navigator.onLine ? 'error' : 'unavailable'
          })
        }
      })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationFrame)
      adapter?.close()
    }
  }, [active, createAdapter, exerciseSlug, videoRef])

  return snapshot
}
