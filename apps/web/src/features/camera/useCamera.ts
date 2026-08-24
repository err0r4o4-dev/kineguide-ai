import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraState =
  'idle' | 'requesting' | 'ready' | 'denied' | 'unsupported' | 'error'

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<CameraState>('idle')

  const stop = useCallback(() => {
    stopMediaStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setState('idle')
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported')
      return false
    }
    stopMediaStream(streamRef.current)
    setState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
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
      setState(name === 'NotAllowedError' ? 'denied' : 'error')
      stopMediaStream(streamRef.current)
      streamRef.current = null
      return false
    }
  }, [])

  useEffect(() => stop, [stop])

  return { videoRef, state, start, stop }
}
