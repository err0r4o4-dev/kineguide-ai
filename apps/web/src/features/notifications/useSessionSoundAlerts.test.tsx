import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CameraState } from '@/features/camera/useCamera'
import type { PostureFeedbackUpdate } from '@/features/pose/postureFeedbackEngine'
import type { PersonalBaseline } from '@/features/pose/seatedCalibration'
import type { CalibrationState } from '@/features/pose/usePostureMonitor'
import i18n from '@/lib/i18n'
import {
  DEFAULT_SOUND_ALERT_PREFERENCES,
  type SoundAlertPreferences
} from './soundAlertPreferences'
import type {
  SoundAlertAdapter,
  SoundAlertPlayInput
} from './soundAlertAdapter'
import {
  CAMERA_FRAMING_SOUND_COOLDOWN_MS,
  CAMERA_FRAMING_SOUND_DEBOUNCE_MS,
  POSTURE_SOUND_COOLDOWN_MS,
  useSessionSoundAlerts,
  type SessionSoundAlertsInput
} from './useSessionSoundAlerts'

const SYNTHETIC_BASELINE: PersonalBaseline = {
  id: 'baseline-test-1',
  calibratedAt: 1_000,
  sampleCount: 30,
  metrics: {
    headTiltDegrees: { mean: 0, stdDev: 0.5 },
    shoulderSlopeDegrees: { mean: 0, stdDev: 0.5 },
    torsoInclinationDegrees: null,
    eyeShoulderDistanceRatio: { mean: 0.72, stdDev: 0.02 },
    forwardHeadRatio: { mean: 0.28, stdDev: 0.01 }
  },
  framing: {
    mode: 'upper_body',
    shoulderWidth: 0.24
  }
}

function createSpyAdapter() {
  const calls: SoundAlertPlayInput[] = []
  const adapter: SoundAlertAdapter = {
    play: vi.fn((input: SoundAlertPlayInput) => {
      calls.push(input)
    }),
    stop: vi.fn(),
    dispose: vi.fn(),
    getCapabilities: vi.fn(() => ({
      speechStatus: 'supported' as const,
      webAudioSupported: true
    }))
  }
  return { adapter, calls }
}

function baseProps(
  overrides: Partial<SessionSoundAlertsInput> = {}
): SessionSoundAlertsInput {
  return {
    cameraState: 'ready' as CameraState,
    paused: false,
    isFinishing: false,
    breakDue: false,
    breakIntervalMinutes: 25,
    feedback: {
      state: 'unable_to_assess',
      feedbackMessageKey: 'session.noBaseline'
    } as PostureFeedbackUpdate,
    calibrationState: { status: 'idle' } as CalibrationState,
    preferences: DEFAULT_SOUND_ALERT_PREFERENCES as SoundAlertPreferences,
    tThai: (key, options) => String(i18n.getFixedT('th')(key, options)),
    ...overrides
  }
}

describe('useSessionSoundAlerts', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-01T09:00:00Z'))
    await i18n.changeLanguage('th')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stays silent on initial idle render and disposes adapter on unmount', () => {
    const spy = createSpyAdapter()
    const { unmount } = renderHook(
      (props: SessionSoundAlertsInput) => useSessionSoundAlerts(props),
      {
        initialProps: baseProps({ createAdapter: () => spy.adapter })
      }
    )

    expect(spy.calls).toHaveLength(0)

    unmount()
    expect(spy.adapter.dispose).toHaveBeenCalledOnce()
  })

  it('plays break reminder once per due transition and stops active sound on pause', () => {
    const spy = createSpyAdapter()
    const createAdapter = () => spy.adapter
    const { rerender } = renderHook(
      (props: SessionSoundAlertsInput) => useSessionSoundAlerts(props),
      {
        initialProps: baseProps({ createAdapter })
      }
    )

    rerender(baseProps({ createAdapter, breakDue: true }))
    expect(spy.calls).toHaveLength(1)
    expect(spy.calls[0]?.tone).toBe('break')
    expect(spy.calls[0]?.text).toContain('25')

    // Pausing stops audio; resuming while breakDue is still true does not re-announce
    rerender(baseProps({ createAdapter, breakDue: true, paused: true }))
    expect(spy.adapter.stop).toHaveBeenCalled()

    rerender(baseProps({ createAdapter, breakDue: true, paused: false }))
    expect(spy.calls).toHaveLength(1)

    // After acknowledging/snoozing and becoming due again, it announces again
    rerender(baseProps({ createAdapter, breakDue: false }))
    rerender(baseProps({ createAdapter, breakDue: true }))
    expect(spy.calls).toHaveLength(2)
  })

  it('plays posture alert only on debounced entry into needs_adjustment and respects cooldown', () => {
    const spy = createSpyAdapter()
    const createAdapter = () => spy.adapter
    const { rerender } = renderHook(
      (props: SessionSoundAlertsInput) => useSessionSoundAlerts(props),
      {
        initialProps: baseProps({
          createAdapter,
          calibrationState: {
            status: 'calibrated',
            baseline: SYNTHETIC_BASELINE
          },
          feedback: {
            state: 'good_alignment',
            feedbackMessageKey: 'session.goodAlignment'
          }
        })
      }
    )

    const alertFeedback: PostureFeedbackUpdate = {
      state: 'needs_adjustment',
      feedbackMessageKey: 'session.feedback.slouching',
      deviatedMetric: 'slouching',
      alertTriggered: true
    }

    rerender(
      baseProps({
        createAdapter,
        calibrationState: {
          status: 'calibrated',
          baseline: SYNTHETIC_BASELINE
        },
        feedback: alertFeedback
      })
    )
    expect(spy.calls).toHaveLength(1)
    expect(spy.calls[0]?.tone).toBe('posture')
    expect(spy.calls[0]?.text).toContain('หลังค่อม')

    // Re-rendering with the same memoized alertTriggered object must NOT re-fire
    rerender(
      baseProps({
        createAdapter,
        breakIntervalMinutes: 30,
        calibrationState: {
          status: 'calibrated',
          baseline: SYNTHETIC_BASELINE
        },
        feedback: alertFeedback
      })
    )
    expect(spy.calls).toHaveLength(1)

    // Returning to good alignment and immediately re-entering within cooldown is suppressed
    rerender(
      baseProps({
        createAdapter,
        calibrationState: {
          status: 'calibrated',
          baseline: SYNTHETIC_BASELINE
        },
        feedback: {
          state: 'good_alignment',
          feedbackMessageKey: 'session.goodAlignment'
        }
      })
    )
    act(() => {
      vi.advanceTimersByTime(POSTURE_SOUND_COOLDOWN_MS - 1_000)
    })
    rerender(
      baseProps({
        createAdapter,
        calibrationState: {
          status: 'calibrated',
          baseline: SYNTHETIC_BASELINE
        },
        feedback: alertFeedback
      })
    )
    expect(spy.calls).toHaveLength(1)

    // After cooldown expires, a fresh transition into needs_adjustment speaks again
    rerender(
      baseProps({
        createAdapter,
        calibrationState: {
          status: 'calibrated',
          baseline: SYNTHETIC_BASELINE
        },
        feedback: {
          state: 'good_alignment',
          feedbackMessageKey: 'session.goodAlignment'
        }
      })
    )
    act(() => {
      vi.advanceTimersByTime(2_000)
    })
    rerender(
      baseProps({
        createAdapter,
        calibrationState: {
          status: 'calibrated',
          baseline: SYNTHETIC_BASELINE
        },
        feedback: alertFeedback
      })
    )
    expect(spy.calls).toHaveLength(2)
  })

  it('announces calibration success and failure transitions only from calibrating state', () => {
    const spy = createSpyAdapter()
    const createAdapter = () => spy.adapter
    const { rerender } = renderHook(
      (props: SessionSoundAlertsInput) => useSessionSoundAlerts(props),
      {
        initialProps: baseProps({ createAdapter })
      }
    )

    rerender(
      baseProps({
        createAdapter,
        calibrationState: {
          status: 'calibrating',
          samplesCollected: 10,
          targetSamples: 30
        }
      })
    )
    expect(spy.calls).toHaveLength(0)

    rerender(
      baseProps({
        createAdapter,
        calibrationState: {
          status: 'calibrated',
          baseline: SYNTHETIC_BASELINE
        }
      })
    )
    expect(spy.calls).toHaveLength(1)
    expect(spy.calls[0]?.tone).toBe('calibration_success')

    // Recalibrate -> fail
    rerender(
      baseProps({
        createAdapter,
        calibrationState: {
          status: 'calibrating',
          samplesCollected: 5,
          targetSamples: 30
        }
      })
    )
    rerender(
      baseProps({
        createAdapter,
        calibrationState: {
          status: 'failed',
          reason: 'too_close'
        }
      })
    )
    expect(spy.calls).toHaveLength(2)
    expect(spy.calls[1]?.tone).toBe('calibration_failed')
    expect(spy.calls[1]?.text).toContain('ใกล้กล้องเกินไป')
  })

  it('debounces transient camera framing errors and enforces framing cooldown', () => {
    const spy = createSpyAdapter()
    const createAdapter = () => spy.adapter
    const framingFeedback: PostureFeedbackUpdate = {
      state: 'camera_framing_error',
      feedbackMessageKey: 'camera.tooClose',
      framingError: 'too_close'
    }

    const { rerender } = renderHook(
      (props: SessionSoundAlertsInput) => useSessionSoundAlerts(props),
      {
        initialProps: baseProps({ createAdapter })
      }
    )

    // Transient 1.5s framing error recovers before 3s debounce -> silent
    rerender(baseProps({ createAdapter, feedback: framingFeedback }))
    act(() => {
      vi.advanceTimersByTime(CAMERA_FRAMING_SOUND_DEBOUNCE_MS - 1_500)
    })
    rerender(baseProps({ createAdapter }))
    act(() => {
      vi.advanceTimersByTime(3_000)
    })
    expect(spy.calls).toHaveLength(0)

    // Sustained 3s framing error -> speaks once
    rerender(baseProps({ createAdapter, feedback: framingFeedback }))
    act(() => {
      vi.advanceTimersByTime(CAMERA_FRAMING_SOUND_DEBOUNCE_MS)
    })
    expect(spy.calls).toHaveLength(1)
    expect(spy.calls[0]?.tone).toBe('camera_framing')
    expect(spy.calls[0]?.text).toContain('ใกล้กล้องเกินไป')

    // Recover and re-enter before cooldown -> suppressed; after cooldown -> speaks
    rerender(baseProps({ createAdapter }))
    act(() => {
      vi.advanceTimersByTime(2_000)
    })
    rerender(baseProps({ createAdapter, feedback: framingFeedback }))
    act(() => {
      vi.advanceTimersByTime(CAMERA_FRAMING_SOUND_DEBOUNCE_MS)
    })
    expect(spy.calls).toHaveLength(1)

    rerender(baseProps({ createAdapter }))
    act(() => {
      vi.advanceTimersByTime(CAMERA_FRAMING_SOUND_COOLDOWN_MS)
    })
    rerender(baseProps({ createAdapter, feedback: framingFeedback }))
    act(() => {
      vi.advanceTimersByTime(CAMERA_FRAMING_SOUND_DEBOUNCE_MS)
    })
    expect(spy.calls).toHaveLength(2)
  })

  it('always speaks pure Thai alerts with th language even when UI language is English', async () => {
    await i18n.changeLanguage('en')
    const spy = createSpyAdapter()
    const createAdapter = () => spy.adapter
    const { rerender } = renderHook(
      (props: SessionSoundAlertsInput) => useSessionSoundAlerts(props),
      {
        initialProps: baseProps({
          createAdapter,
          calibrationState: {
            status: 'calibrating',
            samplesCollected: 29,
            targetSamples: 30
          }
        })
      }
    )

    rerender(
      baseProps({
        createAdapter,
        breakDue: true,
        calibrationState: {
          status: 'calibrated',
          baseline: SYNTHETIC_BASELINE
        },
        feedback: {
          state: 'needs_adjustment',
          feedbackMessageKey: 'session.feedback.headTiltDegrees',
          deviatedMetric: 'headTiltDegrees',
          alertTriggered: true
        }
      })
    )

    expect(spy.calls).toHaveLength(3)
    for (const call of spy.calls) {
      expect(call.language).toBe('th')
      expect(call.text).toMatch(/[฀-๿]/)
      expect(call.text).not.toMatch(/Baseline|Time for|Sustained/i)
    }
  })
})
