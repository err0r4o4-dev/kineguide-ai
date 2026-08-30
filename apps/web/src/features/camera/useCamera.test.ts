import { CAMERA_CONSTRAINTS, stopMediaStream } from './useCamera'

describe('stopMediaStream', () => {
  it('stops every media track without retaining a raw stream', () => {
    const first = { stop: vi.fn() }
    const second = { stop: vi.fn() }
    const stream = {
      getTracks: () => [first, second]
    } as unknown as MediaStream

    stopMediaStream(stream)

    expect(first.stop).toHaveBeenCalledOnce()
    expect(second.stop).toHaveBeenCalledOnce()
  })

  it('requests a balanced 30 FPS camera stream', () => {
    expect(CAMERA_CONSTRAINTS).toEqual({
      facingMode: 'user',
      width: { ideal: 960 },
      height: { ideal: 540 },
      frameRate: { ideal: 30, max: 30 }
    })
  })
})
