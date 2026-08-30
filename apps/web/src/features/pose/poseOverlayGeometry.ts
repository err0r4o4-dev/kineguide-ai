export interface OverlayRect {
  x: number
  y: number
  width: number
  height: number
}

export function calculateContainRect(
  sourceWidth: number,
  sourceHeight: number,
  containerWidth: number,
  containerHeight: number
): OverlayRect {
  if (
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    containerWidth <= 0 ||
    containerHeight <= 0
  ) {
    return { x: 0, y: 0, width: 100, height: 100 }
  }

  const sourceAspect = sourceWidth / sourceHeight
  const containerAspect = containerWidth / containerHeight

  if (sourceAspect > containerAspect) {
    const height = (containerAspect / sourceAspect) * 100
    return { x: 0, y: (100 - height) / 2, width: 100, height }
  }

  const width = (sourceAspect / containerAspect) * 100
  return { x: (100 - width) / 2, y: 0, width, height: 100 }
}
