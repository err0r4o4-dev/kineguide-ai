import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraState =
  'idle' | 'requesting' | 'ready' | 'denied' | 'unsupported' | 'error'

export const CAMERA_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: 'user',
  width: { ideal: 960 },
  height: { ideal: 540 },
  frameRate: { ideal: 30, max: 30 }
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<CameraState>('idle')

  const releaseStream = useCallback(() => {
    stopMediaStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const stop = useCallback(() => {
    releaseStream()
    setState('idle')
  }, [releaseStream])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported')
      return false
    }
    releaseStream()
    setState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: CAMERA_CONSTRAINTS
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState('ready')
      return true
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      releaseStream()
      setState(name === 'NotAllowedError' ? 'denied' : 'error')
      return false
    }
  }, [releaseStream])

  useEffect(() => {
    if (state !== 'ready') return

    const video = videoRef.current
    const stream = streamRef.current
    if (!video || !stream || video.srcObject === stream) return

    let cancelled = false
    video.srcObject = stream
    void video.play().catch(() => {
      if (cancelled) return
      releaseStream()
      setState('error')
    })

    return () => {
      cancelled = true
    }
  }, [releaseStream, state])

  useEffect(() => stop, [stop])

  return { videoRef, state, start, stop }
}
