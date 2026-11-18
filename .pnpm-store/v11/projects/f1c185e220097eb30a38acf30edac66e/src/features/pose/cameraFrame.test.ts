import { drawMirroredCameraFrame } from './cameraFrame'

describe('drawMirroredCameraFrame', () => {
  it('draws the camera into a same-sized canvas with one horizontal mirror', () => {
    const video = document.createElement('video')
    Object.defineProperties(video, {
      videoWidth: { value: 640 },
      videoHeight: { value: 480 }
    })
    const canvas = document.createElement('canvas')
    const context = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn()
    }
    vi.spyOn(canvas, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D
    )

    expect(drawMirroredCameraFrame(video, canvas)).toBe(true)
    expect(canvas.width).toBe(640)
    expect(canvas.height).toBe(480)
    expect(context.setTransform).toHaveBeenNthCalledWith(1, 1, 0, 0, 1, 0, 0)
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 640, 480)
    expect(context.setTransform).toHaveBeenNthCalledWith(2, -1, 0, 0, 1, 640, 0)
    expect(context.drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 480)
  })
})
