import { stopMediaStream } from './useCamera'

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
})
