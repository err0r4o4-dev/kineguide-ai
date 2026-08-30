import { render } from '@testing-library/react'

import { PoseOverlay } from './PoseOverlay'
import type { PoseTrackingSnapshot } from './usePoseTracking'

const landmarks = Array.from({ length: 33 }, (_, index) => ({
  x: 0.2 + (index % 6) * 0.1,
  y: 0.1 + Math.floor(index / 6) * 0.12,
  z: 0,
  visibility: 1
}))

const snapshot: PoseTrackingSnapshot = {
  status: 'ready',
  bounds: { x: 0.2, y: 0.1, width: 0.5, height: 0.7 },
  landmarks,
  unreliableLandmarks: [],
  faceLandmarks: Array.from({ length: 478 }, (_, index) => ({
    x: 0.35 + (index % 20) * 0.015,
    y: 0.1 + Math.floor(index / 20) * 0.008
  })),
  leftHandLandmarks: Array.from({ length: 21 }, (_, index) => ({
    x: 0.1 + (index % 5) * 0.02,
    y: 0.45 + Math.floor(index / 5) * 0.02
  })),
  rightHandLandmarks: Array.from({ length: 21 }, (_, index) => ({
    x: 0.75 + (index % 5) * 0.02,
    y: 0.45 + Math.floor(index / 5) * 0.02
  })),
  blink: { left: 0.8, right: 0.1, detected: true }
}

describe('PoseOverlay', () => {
  it('uses the camera frame as its native coordinate system', () => {
    const video = {
      videoWidth: 640,
      videoHeight: 480,
      clientWidth: 1280,
      clientHeight: 720
    } as HTMLVideoElement
    const { container } = render(
      <PoseOverlay snapshot={snapshot} video={video} />
    )
    const svg = container.querySelector('svg')

    expect(svg).toHaveAttribute('viewBox', '0 0 640 480')
    expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet')
    expect(svg).not.toHaveClass('[transform:scaleX(-1)]')
    expect(
      container.querySelector('[data-body-landmark="11"]')
    ).toHaveAttribute('cx', '448')
    expect(
      container.querySelector('[data-overlay-content="true"]')
    ).not.toBeInTheDocument()
  })

  it('draws the body with the same compact line style as face and hands', () => {
    const { container } = render(<PoseOverlay snapshot={snapshot} />)
    const svg = container.querySelector('svg')
    const lines = container.querySelectorAll('line')

    expect(svg).toHaveAttribute('viewBox', '0 0 100 100')
    expect(container.querySelector('rect')).not.toBeInTheDocument()
    expect(lines.length).toBeGreaterThan(40)
    expect(container.querySelector('[data-overlay="body"]')).toBeInTheDocument()
    expect(lines[0]).toHaveAttribute('stroke', '#5eead4')
    expect(lines[0]).toHaveAttribute('stroke-width', '0.72')
    expect(lines[0]).not.toHaveAttribute('vector-effect')
    expect(container.querySelector('[data-overlay="face"]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-overlay="hand"]')).toHaveLength(2)
    expect(
      container.querySelector('[data-blink="detected"]')
    ).toBeInTheDocument()
  })

  it('does not connect body landmarks that are unreliable in a side view', () => {
    const sideViewSnapshot = {
      ...snapshot,
      landmarks:
        snapshot.landmarks?.map((landmark, index) => ({
          ...landmark,
          visibility: index === 11 ? 0.4 : landmark.visibility
        })) ?? null
    }
    const { container } = render(<PoseOverlay snapshot={sideViewSnapshot} />)
    const body = container.querySelector('[data-overlay="body"]')

    expect(body?.querySelector('[data-body-connection="11-12"]')).toBeNull()
    expect(body?.querySelector('[data-body-connection="11-13"]')).toBeNull()
  })

  it('draws reliable partial landmarks while the camera needs adjustment', () => {
    const { container } = render(
      <PoseOverlay
        snapshot={{
          ...snapshot,
          status: 'adjust_camera',
          unreliableLandmarks: [11]
        }}
      />
    )
    const body = container.querySelector('[data-overlay="body"]')

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(body?.querySelector('[data-body-landmark="11"]')).toBeNull()
    expect(body?.querySelector('[data-body-landmark="12"]')).toBeInTheDocument()
    expect(body?.querySelector('[data-body-connection="11-12"]')).toBeNull()
  })

  it('does not draw coarse pose marks over the detailed face mesh', () => {
    const { container } = render(<PoseOverlay snapshot={snapshot} />)
    const body = container.querySelector('[data-overlay="body"]')

    expect(body?.querySelector('[data-body-landmark="0"]')).toBeNull()
    expect(body?.querySelector('[data-body-landmark="9"]')).toBeNull()
    expect(body?.querySelector('[data-body-landmark="10"]')).toBeNull()
    expect(body?.querySelector('[data-body-landmark="11"]')).toBeInTheDocument()
    expect(body?.querySelector('[data-body-connection="9-10"]')).toBeNull()
  })
})
