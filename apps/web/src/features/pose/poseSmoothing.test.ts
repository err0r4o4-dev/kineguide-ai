import { smoothLandmarks } from './poseSmoothing'

describe('smoothLandmarks', () => {
  it('dampens frame-to-frame jumps without retaining missing landmarks', () => {
    const previous = [{ x: 0.2, y: 0.4, z: 0.1, visibility: 0.9 }]
    const current = [{ x: 0.8, y: 0.6, z: 0.3, visibility: 0.7 }]

    expect(smoothLandmarks(previous, current)).toEqual([
      { x: 0.47, y: 0.49, z: 0.19, visibility: 0.7 }
    ])
    expect(smoothLandmarks(previous, null)).toBeNull()
  })

  it('does not reuse a previous point when landmark counts change', () => {
    expect(
      smoothLandmarks(
        [{ x: 0.2, y: 0.4 }],
        [
          { x: 0.8, y: 0.6 },
          { x: 0.5, y: 0.5 }
        ]
      )
    ).toEqual([
      { x: 0.8, y: 0.6 },
      { x: 0.5, y: 0.5 }
    ])
  })
})
