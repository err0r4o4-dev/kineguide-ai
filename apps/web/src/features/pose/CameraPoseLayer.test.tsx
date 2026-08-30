import { createRef } from 'react'
import { render } from '@testing-library/react'

import { CameraPoseLayer } from './CameraPoseLayer'
import type { PoseTrackingSnapshot } from './usePoseTracking'

const snapshot: PoseTrackingSnapshot = {
  status: 'ready',
  bounds: { x: 0.2, y: 0.1, width: 0.5, height: 0.7 },
  landmarks: Array.from({ length: 33 }, () => ({
    x: 0.3,
    y: 0.4,
    visibility: 1
  })),
  unreliableLandmarks: [],
  faceLandmarks: null,
  leftHandLandmarks: null,
  rightHandLandmarks: null,
  blink: null
}

describe('CameraPoseLayer', () => {
  it('mirrors the video and pose overlay together exactly once', () => {
    const { container } = render(
      <CameraPoseLayer
        label="Camera preview"
        snapshot={snapshot}
        videoRef={createRef<HTMLVideoElement>()}
      />
    )
    const layer = container.querySelector('[data-camera-pose-layer]')
    const video = layer?.querySelector('video')
    const overlay = layer?.querySelector('svg')

    expect(layer).toHaveClass('[transform:scaleX(-1)]')
    expect(video).not.toHaveClass('[transform:scaleX(-1)]')
    expect(overlay).not.toHaveClass('[transform:scaleX(-1)]')
    expect(video?.parentElement).toBe(layer)
    expect(overlay?.parentElement).toBe(layer)
  })
})
