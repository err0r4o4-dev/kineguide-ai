import { smoothLandmarks } from './poseSmoothing'

describe('smoothLandmarks', () => {
  it('follows large movements quickly without retaining missing landmarks', () => {
    const previous = [{ x: 0.2, y: 0.4, z: 0.1, visibility: 0.9 }]
    const current = [{ x: 0.8, y: 0.6, z: 0.3, visibility: 0.7 }]

    expect(smoothLandmarks(previous, current)).toEqual([
      { x: 0.71, y: 0.57, z: 0.27, visibility: 0.7 }
    ])
    expect(smoothLandmarks(previous, null)).toBeNull()
  })

  it('strongly dampens small stationary jitter', () => {
    expect(
      smoothLandmarks([{ x: 0.2, y: 0.4 }], [{ x: 0.21, y: 0.4 }])
    ).toEqual([{ x: 0.2041, y: 0.4 }])
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
