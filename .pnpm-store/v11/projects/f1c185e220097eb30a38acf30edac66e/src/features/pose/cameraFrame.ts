export function drawMirroredCameraFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
) {
  // This canvas is the canonical coordinate space for both display and
  // MediaPipe inference. Mirroring pixels here avoids any later CSS/SVG flip.
  const width = video.videoWidth
  const height = video.videoHeight
  if (width <= 0 || height <= 0) return false

  const context = canvas.getContext('2d', { alpha: false })
  if (!context) return false

  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, width, height)
  context.setTransform(-1, 0, 0, 1, width, 0)
  context.drawImage(video, 0, 0, width, height)
  return true
}
