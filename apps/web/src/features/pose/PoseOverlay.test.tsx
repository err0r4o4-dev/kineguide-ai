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
  it('draws layered skeleton lines without a body bounding box', () => {
    const { container } = render(<PoseOverlay snapshot={snapshot} />)
    const svg = container.querySelector('svg')
    const lines = container.querySelectorAll('line')

    expect(svg).toHaveAttribute('viewBox', '0 0 100 100')
    expect(container.querySelector('rect')).not.toBeInTheDocument()
    expect(lines.length).toBeGreaterThan(40)
    expect(lines[0]).toHaveAttribute('stroke-width', '2.6')
    expect(lines[1]).toHaveAttribute('stroke-width', '1.35')
    expect(lines[0]).not.toHaveAttribute('vector-effect')
    expect(container.querySelector('[data-overlay="face"]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-overlay="hand"]')).toHaveLength(2)
    expect(
      container.querySelector('[data-blink="detected"]')
    ).toBeInTheDocument()
  })
})
