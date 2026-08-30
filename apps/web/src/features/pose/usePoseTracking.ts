import { useEffect, useState, type RefObject } from 'react'

import type { PoseAdapter, PoseAdapterFactory } from './poseAdapter'
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
}

const EMPTY_FRAME: ClassifiedPoseFrame = {
  status: 'no_pose',
  landmarks: null,
  bounds: null,
  unreliableLandmarks: []
}

const INFERENCE_INTERVAL_MS = 125

export function usePoseTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  active: boolean,
  exerciseSlug: string,
  createAdapter: PoseAdapterFactory
) {
  const [snapshot, setSnapshot] = useState<PoseTrackingSnapshot>({
    ...EMPTY_FRAME,
    status: 'idle'
  })

  useEffect(() => {
    if (!active) {
      setSnapshot({ ...EMPTY_FRAME, status: 'idle' })
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
          setSnapshot(
            classifyPoseFrame(adapter.detect(video, timestamp), exerciseSlug)
          )
        } catch {
          adapter.close()
          adapter = null
          setSnapshot({ ...EMPTY_FRAME, status: 'error' })
          return
        }
      }
      schedule()
    }

    setSnapshot({ ...EMPTY_FRAME, status: 'loading_model' })
    void createAdapter()
      .then((createdAdapter) => {
        if (cancelled) {
          createdAdapter.close()
          return
        }
        adapter = createdAdapter
        setSnapshot({ ...EMPTY_FRAME, status: 'no_pose' })
        schedule()
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot({
            ...EMPTY_FRAME,
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
