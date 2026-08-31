import type { PoseLandmark } from './poseGeometry'

// Display-only adaptive smoothing. Small changes are damped while larger real
// movements are followed quickly. Classification continues to use raw frames.
const MIN_DISPLAY_ALPHA = 0.35
const MAX_DISPLAY_ALPHA = 0.85
const MOTION_GAIN = 6.25

function blend(previous: number, current: number, alpha: number) {
  return Number((previous * (1 - alpha) + current * alpha).toFixed(4))
}

export function smoothLandmarks(
  previous: readonly PoseLandmark[] | null,
  current: readonly PoseLandmark[] | null
): PoseLandmark[] | null {
  if (!current) return null
  if (!previous || previous.length !== current.length) {
    return current.map((landmark) => ({ ...landmark }))
  }

  return current.map((landmark, index) => {
    const before = previous[index]
    if (!before) return { ...landmark }
    const displacement = Math.hypot(
      landmark.x - before.x,
      landmark.y - before.y
    )
    const alpha = Math.min(
      MAX_DISPLAY_ALPHA,
      Math.max(
        MIN_DISPLAY_ALPHA,
        MIN_DISPLAY_ALPHA + displacement * MOTION_GAIN
      )
    )
    return {
      ...landmark,
      x: blend(before.x, landmark.x, alpha),
      y: blend(before.y, landmark.y, alpha),
      z:
        before.z === undefined || landmark.z === undefined
          ? landmark.z
          : blend(before.z, landmark.z, alpha)
    }
  })
}
