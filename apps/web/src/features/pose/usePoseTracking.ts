import { useEffect, useState, type RefObject } from 'react'

import type {
  BlinkEstimate,
  PoseAdapter,
  PoseAdapterFactory
} from './poseAdapter'
import { HOLISTIC_INTERVAL_MS } from './poseAdapter'
import {
  cancelPoseFrame,
  schedulePoseFrame,
  type PoseFrameHandle
} from './poseFrameScheduler'
import type { PoseLandmark } from './poseGeometry'
import { classifyPoseFrame, type ClassifiedPoseFrame } from './poseGeometry'
import { smoothLandmarks } from './poseSmoothing'

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
    let scheduledFrame: PoseFrameHandle | null = null
    let scheduledVideo: HTMLVideoElement | null = null
    let cancelled = false
    let lastInference = Number.NEGATIVE_INFINITY
    let previousPose: PoseLandmark[] | null = null
    let previousFace: PoseLandmark[] | null = null
    let previousLeftHand: PoseLandmark[] | null = null
    let previousRightHand: PoseLandmark[] | null = null

    const clearSmoothingHistory = () => {
      previousPose = null
      previousFace = null
      previousLeftHand = null
      previousRightHand = null
    }

    const schedule = () => {
      scheduledVideo = videoRef.current
      scheduledFrame = schedulePoseFrame(scheduledVideo, processFrame)
    }
    const processFrame = (timestamp: number) => {
      if (cancelled) return
      const video = videoRef.current
      if (
        adapter &&
        video &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        timestamp - lastInference + 0.5 >= HOLISTIC_INTERVAL_MS
      ) {
        lastInference = timestamp
        try {
          const result = adapter.detect(video, timestamp)
          const classified = classifyPoseFrame(result.poses, exerciseSlug)
          if (!classified.landmarks) {
            clearSmoothingHistory()
            setSnapshot({ ...classified, ...EMPTY_DETAILS })
            schedule()
            return
          }
          previousPose = smoothLandmarks(previousPose, classified.landmarks)
          previousFace = smoothLandmarks(previousFace, result.faceLandmarks)
          previousLeftHand = smoothLandmarks(
            previousLeftHand,
            result.leftHandLandmarks
          )
          previousRightHand = smoothLandmarks(
            previousRightHand,
            result.rightHandLandmarks
          )
          setSnapshot({
            ...classified,
            landmarks: previousPose,
            faceLandmarks: previousFace,
            leftHandLandmarks: previousLeftHand,
            rightHandLandmarks: previousRightHand,
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
      clearSmoothingHistory()
      cancelPoseFrame(scheduledVideo, scheduledFrame)
      adapter?.close()
    }
  }, [active, createAdapter, exerciseSlug, videoRef])

  return snapshot
}
