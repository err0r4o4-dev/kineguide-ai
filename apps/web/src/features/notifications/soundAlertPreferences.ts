import { useCallback, useSyncExternalStore } from 'react'

export const SOUND_ALERT_STORAGE_KEY = 'kineguide:sound-alerts:v1'

export type SoundAlertMode = 'tts' | 'chime'

export type SoundAlertEventKey =
  'postureAlert' | 'breakReminder' | 'calibrationStatus' | 'cameraFraming'

export interface SoundAlertPreferences {
  readonly enabled: boolean
  readonly mode: SoundAlertMode
  readonly volume: number
  readonly events: Readonly<Record<SoundAlertEventKey, boolean>>
}

export const DEFAULT_SOUND_ALERT_PREFERENCES: SoundAlertPreferences = {
  enabled: true,
  mode: 'tts',
  volume: 0.8,
  events: {
    postureAlert: true,
    breakReminder: true,
    calibrationStatus: true,
    cameraFraming: true
  }
}

export function sanitizeSoundAlertPreferences(
  raw: unknown
): SoundAlertPreferences {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_SOUND_ALERT_PREFERENCES
  }

  const record = raw as Record<string, unknown>
  const enabled =
    typeof record.enabled === 'boolean'
      ? record.enabled
      : DEFAULT_SOUND_ALERT_PREFERENCES.enabled

  const mode: SoundAlertMode =
    record.mode === 'tts' || record.mode === 'chime'
      ? record.mode
      : DEFAULT_SOUND_ALERT_PREFERENCES.mode

  const volume =
    typeof record.volume === 'number' && Number.isFinite(record.volume)
      ? Math.round(Math.min(1, Math.max(0.1, record.volume)) * 100) / 100
      : DEFAULT_SOUND_ALERT_PREFERENCES.volume

  const rawEvents =
    record.events && typeof record.events === 'object'
      ? (record.events as Record<string, unknown>)
      : {}

  const events: Record<SoundAlertEventKey, boolean> = {
    postureAlert:
      typeof rawEvents.postureAlert === 'boolean'
        ? rawEvents.postureAlert
        : DEFAULT_SOUND_ALERT_PREFERENCES.events.postureAlert,
    breakReminder:
      typeof rawEvents.breakReminder === 'boolean'
        ? rawEvents.breakReminder
        : DEFAULT_SOUND_ALERT_PREFERENCES.events.breakReminder,
    calibrationStatus:
      typeof rawEvents.calibrationStatus === 'boolean'
        ? rawEvents.calibrationStatus
        : DEFAULT_SOUND_ALERT_PREFERENCES.events.calibrationStatus,
    cameraFraming:
      typeof rawEvents.cameraFraming === 'boolean'
        ? rawEvents.cameraFraming
        : DEFAULT_SOUND_ALERT_PREFERENCES.events.cameraFraming
  }

  return {
    enabled,
    mode,
    volume,
    events
  }
}

function readStoredPreferences(): SoundAlertPreferences {
  try {
    if (typeof window === 'undefined') {
      return DEFAULT_SOUND_ALERT_PREFERENCES
    }
    const raw = window.localStorage.getItem(SOUND_ALERT_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_SOUND_ALERT_PREFERENCES
    }
    return sanitizeSoundAlertPreferences(JSON.parse(raw))
  } catch {
    return DEFAULT_SOUND_ALERT_PREFERENCES
  }
}

function writeStoredPreferences(preferences: SoundAlertPreferences): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      SOUND_ALERT_STORAGE_KEY,
      JSON.stringify(preferences)
    )
  } catch {
    // Keep session-memory preferences active when browser storage is blocked.
  }
}

function removeStoredPreferences(): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(SOUND_ALERT_STORAGE_KEY)
  } catch {
    // Ignore storage denial while clearing in-memory preferences.
  }
}

let cachedPreferences: SoundAlertPreferences | null = null
const listeners = new Set<() => void>()

function emitChange(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function getSoundAlertPreferences(): SoundAlertPreferences {
  if (cachedPreferences === null) {
    cachedPreferences = readStoredPreferences()
  }
  return cachedPreferences
}

export function updateSoundAlertPreferences(
  updater:
    | Partial<SoundAlertPreferences>
    | ((current: SoundAlertPreferences) => SoundAlertPreferences)
): SoundAlertPreferences {
  const current = getSoundAlertPreferences()
  const candidate =
    typeof updater === 'function'
      ? updater(current)
      : {
          ...current,
          ...updater,
          events: updater.events
            ? { ...current.events, ...updater.events }
            : current.events
        }

  const next = sanitizeSoundAlertPreferences(candidate)
  cachedPreferences = next
  writeStoredPreferences(next)
  emitChange()
  return next
}

export function clearSoundAlertPreferences(): void {
  cachedPreferences = DEFAULT_SOUND_ALERT_PREFERENCES
  removeStoredPreferences()
  emitChange()
}

export function resetSoundAlertPreferencesStoreForTests(): void {
  cachedPreferences = null
  emitChange()
}

export function subscribeSoundAlertPreferences(
  listener: () => void
): () => void {
  listeners.add(listener)

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SOUND_ALERT_STORAGE_KEY || event.key === null) {
      cachedPreferences = readStoredPreferences()
      listener()
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage)
  }

  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage)
    }
  }
}

export interface UseSoundAlertPreferencesResult {
  readonly preferences: SoundAlertPreferences
  readonly setEnabled: (enabled: boolean) => void
  readonly toggleEnabled: () => void
  readonly setMode: (mode: SoundAlertMode) => void
  readonly setVolume: (volume: number) => void
  readonly toggleEvent: (key: SoundAlertEventKey) => void
  readonly resetPreferences: () => void
}

export function useSoundAlertPreferences(): UseSoundAlertPreferencesResult {
  const preferences = useSyncExternalStore(
    subscribeSoundAlertPreferences,
    getSoundAlertPreferences,
    () => DEFAULT_SOUND_ALERT_PREFERENCES
  )

  const setEnabled = useCallback((enabled: boolean) => {
    updateSoundAlertPreferences({ enabled })
  }, [])

  const toggleEnabled = useCallback(() => {
    updateSoundAlertPreferences((current) => ({
      ...current,
      enabled: !current.enabled
    }))
  }, [])

  const setMode = useCallback((mode: SoundAlertMode) => {
    updateSoundAlertPreferences({ mode })
  }, [])

  const setVolume = useCallback((volume: number) => {
    updateSoundAlertPreferences({ volume })
  }, [])

  const toggleEvent = useCallback((key: SoundAlertEventKey) => {
    updateSoundAlertPreferences((current) => ({
      ...current,
      events: {
        ...current.events,
        [key]: !current.events[key]
      }
    }))
  }, [])

  const resetPreferences = useCallback(() => {
    clearSoundAlertPreferences()
  }, [])

  return {
    preferences,
    setEnabled,
    toggleEnabled,
    setMode,
    setVolume,
    toggleEvent,
    resetPreferences
  }
}
