import { createElement } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CAMERA_CONSTRAINTS, stopMediaStream, useCamera } from './useCamera'

const originalMediaDevices = Object.getOwnPropertyDescriptor(
  navigator,
  'mediaDevices'
)

afterEach(() => {
  vi.restoreAllMocks()
  if (originalMediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', originalMediaDevices)
  } else {
    Reflect.deleteProperty(navigator, 'mediaDevices')
  }
})

function CameraHarness() {
  const camera = useCamera()

  return createElement(
    'div',
    null,
    createElement(
      'button',
      { onClick: () => void camera.start(), type: 'button' },
      'start camera'
    ),
    createElement('span', null, camera.state),
    camera.state === 'ready'
      ? createElement('video', {
          'data-testid': 'camera-preview',
          muted: true,
          playsInline: true,
          ref: camera.videoRef
        })
      : null
  )
}

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

describe('useCamera', () => {
  it('attaches the stream when the video mounts after permission resolves', async () => {
    const track = { stop: vi.fn() }
    const stream = {
      getTracks: () => [track]
    } as unknown as MediaStream
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia }
    })
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue()
    const user = userEvent.setup()

    const view = render(createElement(CameraHarness))
    await user.click(screen.getByRole('button', { name: 'start camera' }))

    const video = await screen.findByTestId('camera-preview')
    await waitFor(() => expect(video).toHaveProperty('srcObject', stream))
    expect(play).toHaveBeenCalledOnce()

    view.unmount()
    expect(track.stop).toHaveBeenCalledOnce()
  })

  it('reports playback failure and releases the late-attached stream', async () => {
    const track = { stop: vi.fn() }
    const stream = {
      getTracks: () => [track]
    } as unknown as MediaStream
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) }
    })
    let rejectPlayback: (reason?: unknown) => void = () => undefined
    const playback = new Promise<void>((_resolve, reject) => {
      rejectPlayback = reject
    })
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockReturnValue(playback)
    const user = userEvent.setup()

    render(createElement(CameraHarness))
    await user.click(screen.getByRole('button', { name: 'start camera' }))

    const video = await screen.findByTestId('camera-preview')
    act(() => rejectPlayback(new Error('playback failed')))
    expect(await screen.findByText('error')).toBeVisible()
    expect(play).toHaveBeenCalledOnce()
    expect(track.stop).toHaveBeenCalledOnce()
    expect(video).toHaveProperty('srcObject', null)
  })
})

it('releases a camera stream that arrives after navigation', async () => {
  let resolveStream: (stream: MediaStream) => void = () => undefined
  const pending = new Promise<MediaStream>((resolve) => {
    resolveStream = resolve
  })
  const track = { stop: vi.fn() }
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: vi.fn().mockReturnValue(pending) }
  })
  const user = userEvent.setup()
  const view = render(createElement(CameraHarness))
  await user.click(screen.getByRole('button', { name: 'start camera' }))
  view.unmount()
  await act(async () =>
    resolveStream({ getTracks: () => [track] } as unknown as MediaStream)
  )
  expect(track.stop).toHaveBeenCalledOnce()
})

it('reports an ended camera track and releases the stream', async () => {
  const track: {
    stop: ReturnType<typeof vi.fn>
    onended: (() => void) | null
  } = { stop: vi.fn(), onended: null }
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] })
    }
  })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  const user = userEvent.setup()
  render(createElement(CameraHarness))
  await user.click(screen.getByRole('button', { name: 'start camera' }))
  await screen.findByTestId('camera-preview')
  act(() => track.onended?.())
  expect(await screen.findByText('error')).toBeVisible()
  expect(track.stop).toHaveBeenCalledOnce()
})

it('keeps camera stopped if playback resolves after cancellation', async () => {
  const track = { stop: vi.fn() }
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] })
    }
  })
  let resolvePlayback: () => void = () => undefined
  const playback = new Promise<void>((resolve) => {
    resolvePlayback = resolve
  })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockReturnValue(playback)
  function Harness() {
    const camera = useCamera()
    return createElement(
      'div',
      null,
      createElement('video', { ref: camera.videoRef }),
      createElement('button', { onClick: () => void camera.start() }, 'start'),
      createElement('button', { onClick: camera.stop }, 'stop'),
      createElement('span', null, camera.state)
    )
  }
  const user = userEvent.setup()
  render(createElement(Harness))
  await user.click(screen.getByRole('button', { name: 'start' }))
  await user.click(screen.getByRole('button', { name: 'stop' }))
  await act(async () => resolvePlayback())
  expect(screen.getByText('idle')).toBeVisible()
  expect(track.stop).toHaveBeenCalledOnce()
})
