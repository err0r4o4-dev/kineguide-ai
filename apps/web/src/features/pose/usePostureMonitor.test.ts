import { renderHook, act } from '@testing-library/react'
import type { PoseTrackingSnapshot } from './usePoseTracking'
import type { PoseLandmark } from './poseGeometry'
import {
  CALIBRATION_SAMPLE_TARGET,
  usePostureMonitor
} from './usePostureMonitor'

function createSyntheticPose(
  overrides: Partial<Record<number, Partial<PoseLandmark>>> = {}
): PoseLandmark[] {
  const base: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.95
  }))
  base[0] = { x: 0.5, y: 0.2, z: 0, visibility: 0.95 }
  base[2] = { x: 0.48, y: 0.18, z: 0, visibility: 0.95 }
  base[5] = { x: 0.52, y: 0.18, z: 0, visibility: 0.95 }
  base[7] = { x: 0.45, y: 0.19, z: 0, visibility: 0.95 }
  base[8] = { x: 0.55, y: 0.19, z: 0, visibility: 0.95 }
  base[11] = { x: 0.4, y: 0.35, z: 0, visibility: 0.95 }
  base[12] = { x: 0.6, y: 0.35, z: 0, visibility: 0.95 }
  base[23] = { x: 0.42, y: 0.65, z: 0, visibility: 0.95 }
  base[24] = { x: 0.58, y: 0.65, z: 0, visibility: 0.95 }
  for (const [indexStr, override] of Object.entries(overrides)) {
    base[Number(indexStr)] = { ...base[Number(indexStr)], ...override }
  }
  return base
}

function makeSnapshot(
  landmarks: PoseLandmark[] | null,
  status: PoseTrackingSnapshot['status'] = 'ready'
): PoseTrackingSnapshot {
  return {
    status,
    landmarks,
    bounds: null,
    unreliableLandmarks: [],
    faceLandmarks: null,
    leftHandLandmarks: null,
    rightHandLandmarks: null,
    blink: null
  }
}

describe('usePostureMonitor', () => {
  it('samples current metrics and clears unavailable or stale readings', () => {
    vi.useFakeTimers()
    try {
      const pose = createSyntheticPose({
        23: { visibility: 0 },
        24: { visibility: 0 }
      })
      const { result, rerender, unmount } = renderHook(
        ({ s, p }: { s: PoseTrackingSnapshot; p: boolean }) =>
          usePostureMonitor(s, p),
        { initialProps: { s: makeSnapshot(pose), p: false } }
      )
      expect(result.current.observedMetrics).toBeNull()
      act(() => result.current.startCalibration())
      for (let frame = 0; frame < CALIBRATION_SAMPLE_TARGET; frame++) {
        rerender({ s: makeSnapshot(pose), p: false })
      }
      act(() => vi.advanceTimersByTime(500))
      expect(result.current.observedMetrics?.headTiltDegrees).toBe(0)
      expect(result.current.observedMetrics?.torsoInclinationDegrees).toBeNull()

      const tilted = createSyntheticPose({
        8: { y: 0.21 },
        23: { visibility: 0 },
        24: { visibility: 0 }
      })
      rerender({ s: makeSnapshot(tilted), p: false })
      expect(result.current.observedMetrics?.headTiltDegrees).toBe(0)
      act(() => vi.advanceTimersByTime(500))
      expect(result.current.observedMetrics?.headTiltDegrees).toBeCloseTo(11.31)

      const unavailable = [
        makeSnapshot(null, 'no_pose'),
        makeSnapshot(tilted, 'multiple_poses'),
        makeSnapshot(tilted, 'error'),
        makeSnapshot(createSyntheticPose({ 2: { visibility: 0 } })),
        makeSnapshot(createSyntheticPose({ 12: { x: 0.48 } })),
        makeSnapshot(createSyntheticPose())
      ]
      for (const snapshot of unavailable) {
        rerender({ s: snapshot, p: false })
        expect(result.current.observedMetrics).toBeNull()
        act(() => vi.advanceTimersByTime(500))
        expect(result.current.observedMetrics).toBeNull()
        rerender({ s: makeSnapshot(pose), p: false })
        act(() => vi.advanceTimersByTime(500))
        expect(result.current.observedMetrics).not.toBeNull()
      }
      rerender({ s: makeSnapshot(pose), p: true })
      expect(result.current.observedMetrics).toBeNull()
      rerender({ s: makeSnapshot(pose), p: false })
      act(() => vi.advanceTimersByTime(500))
      expect(result.current.observedMetrics).not.toBeNull()
      act(() => vi.advanceTimersByTime(2000))
      expect(result.current.observedMetrics).toBeNull()
      vi.setSystemTime(Date.now() + 9 * 60 * 60 * 1000)
      rerender({ s: makeSnapshot(pose), p: false })
      expect(result.current.feedback.state).toBe('recalibration_recommended')
      act(() => vi.advanceTimersByTime(500))
      expect(result.current.observedMetrics).toBeNull()
      rerender({ s: makeSnapshot(pose), p: false })
      act(() => vi.advanceTimersByTime(500))
      act(() => result.current.startCalibration())
      expect(result.current.observedMetrics).toBeNull()
      act(() => result.current.cancelCalibration())
      act(() => vi.advanceTimersByTime(500))
      expect(result.current.observedMetrics).toBeNull()
      act(() => result.current.reset())
      expect(result.current.observedMetrics).toBeNull()
      unmount()
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('starts uncalibrated with an unable_to_assess posture state', () => {
    const { result } = renderHook(() =>
      usePostureMonitor(makeSnapshot(createSyntheticPose()), false)
    )

    expect(result.current.calibrationState.status).toBe('idle')
    expect(result.current.feedback.state).toBe('unable_to_assess')
    expect(result.current.feedback.feedbackMessageKey).toBe(
      'session.noBaseline'
    )
  })

  it('runs calibration, produces a baseline, and transitions to good_alignment', () => {
    const pose = createSyntheticPose()
    let snapshot = makeSnapshot(pose)

    const { result, rerender } = renderHook(
      ({ s, p }: { s: PoseTrackingSnapshot; p: boolean }) =>
        usePostureMonitor(s, p),
      { initialProps: { s: snapshot, p: false } }
    )

    act(() => {
      result.current.startCalibration()
    })

    expect(result.current.calibrationState.status).toBe('calibrating')

    // Feed enough frames to reach the calibration threshold
    for (let i = 0; i < CALIBRATION_SAMPLE_TARGET; i++) {
      snapshot = makeSnapshot(pose)
      rerender({ s: snapshot, p: false })
    }

    expect(result.current.calibrationState.status).toBe('calibrated')
    if (result.current.calibrationState.status === 'calibrated') {
      expect(result.current.calibrationState.baseline.framing.mode).toBe(
        'full_torso'
      )
    }
    expect(result.current.feedback.state).toBe('good_alignment')
  })

  it('reports failure when calibration cannot collect enough valid samples', () => {
    const { result } = renderHook(() =>
      usePostureMonitor(makeSnapshot(null, 'no_pose'), false)
    )

    act(() => {
      result.current.startCalibration()
    })
    act(() => {
      result.current.cancelCalibration('not_enough_samples')
    })

    expect(result.current.calibrationState.status).toBe('failed')
  })

  it('aborts calibration with specific error reason if user is too close to camera', () => {
    const tooClosePose = createSyntheticPose({
      11: { x: 0.1, y: 0.35 },
      12: { x: 0.9, y: 0.35 } // shoulder width = 0.8
    })

    const { result, rerender } = renderHook(
      ({ s }: { s: PoseTrackingSnapshot }) => usePostureMonitor(s, false),
      { initialProps: { s: makeSnapshot(createSyntheticPose()) } }
    )

    act(() => {
      result.current.startCalibration()
    })
    expect(result.current.calibrationState.status).toBe('calibrating')

    // Feed a frame where user moved too close
    rerender({ s: makeSnapshot(tooClosePose) })

    expect(result.current.calibrationState.status).toBe('failed')
    if (result.current.calibrationState.status === 'failed') {
      expect(result.current.calibrationState.reason).toBe('too_close')
    }
  })

  it('produces a null summary input before calibration and real totals after', () => {
    const pose = createSyntheticPose()
    const { result, rerender } = renderHook(
      ({ s, p }: { s: PoseTrackingSnapshot; p: boolean }) =>
        usePostureMonitor(s, p),
      { initialProps: { s: makeSnapshot(pose), p: false } }
    )

    expect(result.current.getSummaryInput()).toBeNull()

    act(() => {
      result.current.startCalibration()
    })
    for (let i = 0; i < CALIBRATION_SAMPLE_TARGET; i++) {
      rerender({ s: makeSnapshot(pose), p: false })
    }

    const summary = result.current.getSummaryInput()
    expect(summary).not.toBeNull()
    expect(summary?.framing_mode).toBe('full_torso')
    expect(summary?.method_version).toBe('seated-baseline-v1')
  })
})
