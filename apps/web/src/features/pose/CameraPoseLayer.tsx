import type { RefObject } from 'react'

import { PoseOverlay } from './PoseOverlay'
import type { PoseTrackingSnapshot } from './usePoseTracking'

export function CameraPoseLayer({
  label,
  snapshot,
  videoRef
}: {
  label: string
  snapshot: PoseTrackingSnapshot
  videoRef: RefObject<HTMLVideoElement | null>
}) {
  return (
    <div
      className="absolute inset-0 [transform:scaleX(-1)]"
      data-camera-pose-layer="true"
    >
      <video
        aria-label={label}
        className="h-full w-full object-contain"
        muted
        playsInline
        ref={videoRef}
      />
      <PoseOverlay snapshot={snapshot} video={videoRef.current} />
    </div>
  )
}
