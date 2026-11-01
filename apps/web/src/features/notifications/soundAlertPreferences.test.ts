import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  clearSoundAlertPreferences,
  DEFAULT_SOUND_ALERT_PREFERENCES,
  getSoundAlertPreferences,
  resetSoundAlertPreferencesStoreForTests,
  sanitizeSoundAlertPreferences,
  SOUND_ALERT_STORAGE_KEY,
  updateSoundAlertPreferences,
  useSoundAlertPreferences
} from './soundAlertPreferences'

describe('soundAlertPreferences', () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(
    window,
    'localStorage'
  )

  beforeEach(() => {
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', originalLocalStorage)
    }
    window.localStorage.clear()
    resetSoundAlertPreferencesStoreForTests()
  })

  afterEach(() => {
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', originalLocalStorage)
    }
    window.localStorage.clear()
    resetSoundAlertPreferencesStoreForTests()
  })

  it('returns TTS-first defaults with all four session events enabled', () => {
    expect(getSoundAlertPreferences()).toEqual(DEFAULT_SOUND_ALERT_PREFERENCES)
    expect(DEFAULT_SOUND_ALERT_PREFERENCES).toEqual({
      enabled: true,
      mode: 'tts',
      volume: 0.8,
      events: {
        postureAlert: true,
        breakReminder: true,
        calibrationStatus: true,
        cameraFraming: true
      }
    })
  })

  it('persists updates to localStorage and hydrates them on reload', () => {
    updateSoundAlertPreferences({
      enabled: false,
      mode: 'chime',
      volume: 0.5,
      events: {
        ...DEFAULT_SOUND_ALERT_PREFERENCES.events,
        cameraFraming: false
      }
    })

    const raw = window.localStorage.getItem(SOUND_ALERT_STORAGE_KEY)
    expect(raw).not.toBeNull()

    resetSoundAlertPreferencesStoreForTests()

    expect(getSoundAlertPreferences()).toEqual({
      enabled: false,
      mode: 'chime',
      volume: 0.5,
      events: {
        postureAlert: true,
        breakReminder: true,
        calibrationStatus: true,
        cameraFraming: false
      }
    })
  })

  it('sanitizes malformed or out-of-range payloads safely', () => {
    expect(sanitizeSoundAlertPreferences(null)).toEqual(
      DEFAULT_SOUND_ALERT_PREFERENCES
    )
    expect(
      sanitizeSoundAlertPreferences({
        enabled: 'yes',
        mode: 'loudhorn',
        volume: 99,
        events: { postureAlert: false, breakReminder: 'invalid' }
      })
    ).toEqual({
      enabled: true,
      mode: 'tts',
      volume: 1,
      events: {
        postureAlert: false,
        breakReminder: true,
        calibrationStatus: true,
        cameraFraming: true
      }
    })
    expect(sanitizeSoundAlertPreferences({ volume: -2 }).volume).toBe(0.1)

    window.localStorage.setItem(SOUND_ALERT_STORAGE_KEY, '{corrupt-json')
    resetSoundAlertPreferencesStoreForTests()
    expect(getSoundAlertPreferences()).toEqual(DEFAULT_SOUND_ALERT_PREFERENCES)
  })

  it('continues working in memory when localStorage access throws SecurityError', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new DOMException('Storage denied', 'SecurityError')
      }
    })
    resetSoundAlertPreferencesStoreForTests()

    expect(getSoundAlertPreferences()).toEqual(DEFAULT_SOUND_ALERT_PREFERENCES)

    const updated = updateSoundAlertPreferences({ enabled: false })
    expect(updated.enabled).toBe(false)
    expect(getSoundAlertPreferences().enabled).toBe(false)

    expect(() => clearSoundAlertPreferences()).not.toThrow()
    expect(getSoundAlertPreferences().enabled).toBe(true)
  })

  it('synchronizes multiple hook consumers and clears persisted data', () => {
    const first = renderHook(() => useSoundAlertPreferences())
    const second = renderHook(() => useSoundAlertPreferences())

    act(() => {
      first.result.current.toggleEnabled()
      first.result.current.setMode('chime')
      first.result.current.setVolume(0.4)
      first.result.current.toggleEvent('postureAlert')
    })

    expect(second.result.current.preferences).toEqual({
      enabled: false,
      mode: 'chime',
      volume: 0.4,
      events: {
        postureAlert: false,
        breakReminder: true,
        calibrationStatus: true,
        cameraFraming: true
      }
    })

    act(() => {
      second.result.current.resetPreferences()
    })

    expect(first.result.current.preferences).toEqual(
      DEFAULT_SOUND_ALERT_PREFERENCES
    )
    expect(window.localStorage.getItem(SOUND_ALERT_STORAGE_KEY)).toBeNull()
  })
})
