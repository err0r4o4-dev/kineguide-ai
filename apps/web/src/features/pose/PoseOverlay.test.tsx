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
  unreliableLandmarks: []
}

describe('PoseOverlay', () => {
  it('draws connected joints as clearly visible skeleton lines', () => {
    const { container } = render(<PoseOverlay snapshot={snapshot} />)
    const svg = container.querySelector('svg')
    const lines = container.querySelectorAll('line')

    expect(svg).toHaveAttribute('viewBox', '0 0 100 100')
    expect(lines.length).toBeGreaterThan(20)
    expect(lines[0]).toHaveAttribute('stroke-width', '2')
    expect(lines[0]).not.toHaveAttribute('vector-effect')
  })
})
