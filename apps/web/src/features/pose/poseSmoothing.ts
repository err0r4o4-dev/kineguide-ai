import type { PoseLandmark } from './poseGeometry'

// Display-only exponential smoothing. Classification continues to use the raw
// current frame so visual history cannot become a clinical or safety decision.
const DISPLAY_SMOOTHING_ALPHA = 0.45

function blend(previous: number, current: number) {
  return Number(
    (
      previous * (1 - DISPLAY_SMOOTHING_ALPHA) +
      current * DISPLAY_SMOOTHING_ALPHA
    ).toFixed(4)
  )
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
    return {
      ...landmark,
      x: blend(before.x, landmark.x),
      y: blend(before.y, landmark.y),
      z:
        before.z === undefined || landmark.z === undefined
          ? landmark.z
          : blend(before.z, landmark.z)
    }
  })
}
