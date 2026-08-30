export type PoseFrameHandle =
  { kind: 'video'; id: number } | { kind: 'animation'; id: number }

export function schedulePoseFrame(
  video: HTMLVideoElement | null,
  callback: VideoFrameRequestCallback
): PoseFrameHandle {
  if (video?.requestVideoFrameCallback) {
    return { kind: 'video', id: video.requestVideoFrameCallback(callback) }
  }
  return {
    kind: 'animation',
    id: window.requestAnimationFrame((timestamp) =>
      callback(timestamp, {} as VideoFrameCallbackMetadata)
    )
  }
}

export function cancelPoseFrame(
  video: HTMLVideoElement | null,
  handle: PoseFrameHandle | null
) {
  if (!handle) return
  if (handle.kind === 'video') {
    video?.cancelVideoFrameCallback(handle.id)
    return
  }
  window.cancelAnimationFrame(handle.id)
}
