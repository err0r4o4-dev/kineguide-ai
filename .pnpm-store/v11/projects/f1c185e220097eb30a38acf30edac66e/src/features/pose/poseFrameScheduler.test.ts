import { cancelPoseFrame, schedulePoseFrame } from './poseFrameScheduler'

describe('pose frame scheduler', () => {
  it('prefers camera frame callbacks and cancels the scheduled frame', () => {
    const video = document.createElement('video')
    const requestVideoFrameCallback = vi.fn(() => 23)
    const cancelVideoFrameCallback = vi.fn()
    Object.defineProperties(video, {
      requestVideoFrameCallback: { value: requestVideoFrameCallback },
      cancelVideoFrameCallback: { value: cancelVideoFrameCallback }
    })
    const callback = vi.fn()

    const handle = schedulePoseFrame(video, callback)
    cancelPoseFrame(video, handle)

    expect(handle).toEqual({ kind: 'video', id: 23 })
    expect(requestVideoFrameCallback).toHaveBeenCalledWith(callback)
    expect(cancelVideoFrameCallback).toHaveBeenCalledWith(23)
  })
})
