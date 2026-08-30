import { act, renderHook, waitFor } from '@testing-library/react'
import type { RefObject } from 'react'

import type { PoseAdapter } from './poseAdapter'
import { usePoseTracking } from './usePoseTracking'

function visiblePose() {
  return Array.from({ length: 33 }, (_, index) => ({
    x: 0.25 + (index % 6) * 0.1,
    y: 0.15 + Math.floor(index / 6) * 0.12,
    visibility: 0.95
  }))
}

describe('usePoseTracking', () => {
  it('bounds inference and disposes the adapter and animation frame', async () => {
    let nextFrame: FrameRequestCallback | undefined
    const requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        nextFrame = callback
        return 17
      })
    const cancelFrame = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => undefined)
    const video = document.createElement('video')
    Object.defineProperty(video, 'readyState', { value: 2 })
    const adapter: PoseAdapter = {
      detect: vi.fn(() => ({
        poses: [visiblePose()],
        faceLandmarks: null,
        leftHandLandmarks: null,
        rightHandLandmarks: null,
        blink: null
      })),
      close: vi.fn()
    }
    const createAdapter = vi.fn(async () => adapter)
    const videoRef = { current: video } as RefObject<HTMLVideoElement>

    const { result, unmount } = renderHook(() =>
      usePoseTracking(videoRef, true, 'sit-to-stand-demo', createAdapter)
    )

    await waitFor(() => expect(result.current.status).toBe('no_pose'))
    expect(nextFrame).toBeDefined()
    act(() => nextFrame?.(125))
    expect(result.current.status).toBe('ready')
    expect(adapter.detect).toHaveBeenCalledOnce()

    unmount()
    expect(cancelFrame).toHaveBeenCalledWith(17)
    expect(adapter.close).toHaveBeenCalledOnce()
    requestFrame.mockRestore()
    cancelFrame.mockRestore()
  })

  it('closes an adapter that resolves after unmount', async () => {
    let resolveAdapter: ((adapter: PoseAdapter) => void) | undefined
    const adapter: PoseAdapter = {
      detect: vi.fn(() => ({
        poses: [],
        faceLandmarks: null,
        leftHandLandmarks: null,
        rightHandLandmarks: null,
        blink: null
      })),
      close: vi.fn()
    }
    const createAdapter = () =>
      new Promise<PoseAdapter>((resolve) => {
        resolveAdapter = resolve
      })
    const videoRef = {
      current: document.createElement('video')
    } as RefObject<HTMLVideoElement>
    const { unmount } = renderHook(() =>
      usePoseTracking(videoRef, true, 'seated-knee-demo', createAdapter)
    )

    unmount()
    await act(async () => resolveAdapter?.(adapter))

    expect(adapter.close).toHaveBeenCalledOnce()
  })
})
