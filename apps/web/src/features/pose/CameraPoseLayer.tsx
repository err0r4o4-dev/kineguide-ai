import type { RefObject } from 'react'

import { PoseOverlay } from './PoseOverlay'
import type { PoseTrackingSnapshot } from './usePoseTracking'
import type { JointError } from './exerciseFeatures'

export function CameraPoseLayer({
  canvasRef,
  label,
  snapshot,
  videoRef,
  jointErrors = []
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>
  label: string
  snapshot: PoseTrackingSnapshot
  videoRef: RefObject<HTMLVideoElement | null>
  jointErrors?: JointError[]
}) {
  return (
    <div className="absolute inset-0" data-camera-pose-layer="true">
      <video
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px opacity-0"
        muted
        playsInline
        ref={videoRef}
      />
      <canvas
        aria-label={label}
        className="h-full w-full object-contain"
        ref={canvasRef}
        role="img"
      />
      <PoseOverlay
        jointErrors={jointErrors}
        snapshot={snapshot}
        video={videoRef.current}
      />
    </div>
  )
}
