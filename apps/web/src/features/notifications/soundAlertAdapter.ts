import type { SoundAlertMode } from './soundAlertPreferences'

export type SoundAlertTone =
  | 'posture'
  | 'break'
  | 'calibration_success'
  | 'calibration_failed'
  | 'camera_framing'
  | 'preview'

export type SoundAlertLanguage = 'th' | 'en'

export interface SoundAlertPlayInput {
  readonly tone: SoundAlertTone
  readonly text: string
  readonly language: SoundAlertLanguage
  readonly mode: SoundAlertMode
  readonly volume: number
}

export type SpeechCapabilityStatus =
  'supported' | 'voice_unavailable' | 'unsupported'

export interface SoundAlertCapabilities {
  readonly speechStatus: SpeechCapabilityStatus
  readonly webAudioSupported: boolean
}

export interface SoundAlertAdapter {
  play(input: SoundAlertPlayInput): void
  stop(): void
  dispose(): void
  getCapabilities(language: SoundAlertLanguage): SoundAlertCapabilities
}

export interface SpeechUtteranceErrorLike {
  readonly error?: string
}

export interface SpeechUtteranceLike {
  text: string
  lang: string
  volume: number
  rate: number
  pitch: number
  voice: SpeechSynthesisVoice | null
  onerror: ((event: SpeechUtteranceErrorLike) => void) | null
  onend: (() => void) | null
}

export interface SpeechSynthesisLike {
  cancel(): void
  getVoices(): SpeechSynthesisVoice[]
  speak(utterance: SpeechUtteranceLike): void
}

export interface OscillatorNodeLike {
  type: OscillatorType
  readonly frequency: { value: number }
  onended: (() => void) | null
  connect(destination: unknown): void
  disconnect(): void
  start(when?: number): void
  stop(when?: number): void
}

export interface GainNodeLike {
  readonly gain: {
    value: number
    setValueAtTime(value: number, startTime: number): void
    linearRampToValueAtTime(value: number, endTime: number): void
    exponentialRampToValueAtTime(value: number, endTime: number): void
  }
  connect(destination: unknown): void
  disconnect(): void
}

export interface AudioContextLike {
  readonly state: AudioContextState
  readonly currentTime: number
  readonly destination: unknown
  resume(): Promise<void>
  close(): Promise<void>
  createOscillator(): OscillatorNodeLike
  createGain(): GainNodeLike
}

export interface BrowserSoundEnvironment {
  readonly getSpeechSynthesis?: () => SpeechSynthesisLike | null
  readonly createUtterance?: (text: string) => SpeechUtteranceLike | null
  readonly createAudioContext?: () => AudioContextLike | null
}

interface ChimeNote {
  readonly freq: number
  readonly offset: number
  readonly duration: number
  readonly wave?: OscillatorType
}

const CHIME_PATTERNS: Readonly<Record<SoundAlertTone, readonly ChimeNote[]>> = {
  break: [
    { freq: 523.25, offset: 0, duration: 0.14 },
    { freq: 659.25, offset: 0.16, duration: 0.14 },
    { freq: 783.99, offset: 0.32, duration: 0.22 }
  ],
  posture: [
    { freq: 659.25, offset: 0, duration: 0.14 },
    { freq: 587.33, offset: 0.18, duration: 0.18 }
  ],
  calibration_success: [
    { freq: 587.33, offset: 0, duration: 0.12 },
    { freq: 880, offset: 0.14, duration: 0.2 }
  ],
  calibration_failed: [
    { freq: 587.33, offset: 0, duration: 0.14 },
    { freq: 440, offset: 0.18, duration: 0.2 }
  ],
  camera_framing: [
    { freq: 523.25, offset: 0, duration: 0.12 },
    { freq: 523.25, offset: 0.18, duration: 0.15 }
  ],
  preview: [
    { freq: 523.25, offset: 0, duration: 0.14 },
    { freq: 783.99, offset: 0.16, duration: 0.2 }
  ]
}

export function formatSpeechText(
  text: string,
  language: SoundAlertLanguage
): string {
  const conjunction = language === 'th' ? 'หรือ' : ' or '
  return text
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s*\/\s*/g, conjunction)
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function defaultGetSpeechSynthesis(): SpeechSynthesisLike | null {
  try {
    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis
    ) {
      return window.speechSynthesis as unknown as SpeechSynthesisLike
    }
  } catch {
    return null
  }
  return null
}

function defaultCreateUtterance(text: string): SpeechUtteranceLike | null {
  try {
    if (
      typeof window !== 'undefined' &&
      typeof window.SpeechSynthesisUtterance === 'function'
    ) {
      return new window.SpeechSynthesisUtterance(
        text
      ) as unknown as SpeechUtteranceLike
    }
  } catch {
    return null
  }
  return null
}

function hasBrowserAudioContextConstructor(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const win = window as Window & {
      webkitAudioContext?: typeof AudioContext
    }
    return (
      typeof window.AudioContext === 'function' ||
      typeof win.webkitAudioContext === 'function'
    )
  } catch {
    return false
  }
}

function defaultCreateAudioContext(): AudioContextLike | null {
  try {
    if (typeof window === 'undefined') return null
    const win = window as Window & {
      webkitAudioContext?: typeof AudioContext
    }
    const Ctor = window.AudioContext ?? win.webkitAudioContext
    return Ctor ? (new Ctor() as unknown as AudioContextLike) : null
  } catch {
    return null
  }
}

function safeGetVoices(synth: SpeechSynthesisLike): SpeechSynthesisVoice[] {
  try {
    const voices = synth.getVoices()
    return Array.isArray(voices) ? voices : []
  } catch {
    return []
  }
}

function findVoiceForLanguage(
  voices: readonly SpeechSynthesisVoice[],
  language: SoundAlertLanguage
): SpeechSynthesisVoice | null {
  const prefix = language.toLowerCase()
  const exactLocale = language === 'th' ? 'th-th' : 'en-us'

  const exact = voices.find(
    (voice) => voice.lang?.toLowerCase() === exactLocale
  )
  if (exact) return exact

  return (
    voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefix)) ?? null
  )
}

export function createBrowserSoundAlertAdapter(
  env: BrowserSoundEnvironment = {}
): SoundAlertAdapter {
  const getSpeechSynthesis = env.getSpeechSynthesis ?? defaultGetSpeechSynthesis
  const createUtterance = env.createUtterance ?? defaultCreateUtterance
  const createAudioContext = env.createAudioContext ?? defaultCreateAudioContext
  const hasInjectedAudioContext = env.createAudioContext !== undefined

  let disposed = false
  let audioContext: AudioContextLike | null = null
  let activeUtterance: SpeechUtteranceLike | null = null
  const activeOscillators = new Set<OscillatorNodeLike>()

  function stopActiveOscillators(): void {
    for (const oscillator of activeOscillators) {
      try {
        oscillator.stop()
      } catch {
        // Oscillator may already have completed.
      }
      try {
        oscillator.disconnect()
      } catch {
        // Ignore disconnect error on stopped node.
      }
    }
    activeOscillators.clear()
  }

  function stop(): void {
    activeUtterance = null
    const synth = getSpeechSynthesis()
    if (synth) {
      try {
        synth.cancel()
      } catch {
        // Ignore speech synthesis cancel errors on unsupported hosts.
      }
    }
    stopActiveOscillators()
  }

  function ensureAudioContext(): AudioContextLike | null {
    if (disposed) return null
    if (!audioContext) {
      audioContext = createAudioContext()
    }
    return audioContext
  }

  function playChime(tone: SoundAlertTone, volume: number): void {
    if (disposed) return
    const ctx = ensureAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {})
    }

    const pattern = CHIME_PATTERNS[tone]
    const peakGain = Math.max(0.03, Math.min(0.35, volume * 0.35))
    const baseTime = ctx.currentTime

    for (const note of pattern) {
      try {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()
        const startAt = baseTime + note.offset
        const stopAt = startAt + note.duration

        osc.type = note.wave ?? 'sine'
        osc.frequency.value = note.freq

        gainNode.gain.setValueAtTime(0.0001, startAt)
        gainNode.gain.linearRampToValueAtTime(peakGain, startAt + 0.015)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt)

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)

        activeOscillators.add(osc)
        osc.onended = () => {
          activeOscillators.delete(osc)
          try {
            osc.disconnect()
            gainNode.disconnect()
          } catch {
            // Ignore cleanup failure after playback completion.
          }
        }

        osc.start(startAt)
        osc.stop(stopAt)
      } catch {
        // Ignore audio scheduling errors in restricted browser contexts.
      }
    }
  }

  function getCapabilities(
    language: SoundAlertLanguage
  ): SoundAlertCapabilities {
    const webAudioSupported = hasInjectedAudioContext
      ? Boolean(ensureAudioContext())
      : hasBrowserAudioContextConstructor()

    const synth = getSpeechSynthesis()
    const probeUtterance = synth ? createUtterance('') : null
    if (!synth || !probeUtterance) {
      return {
        speechStatus: 'unsupported',
        webAudioSupported
      }
    }

    const voices = safeGetVoices(synth)
    if (voices.length > 0 && !findVoiceForLanguage(voices, language)) {
      return {
        speechStatus: 'voice_unavailable',
        webAudioSupported
      }
    }

    return {
      speechStatus: 'supported',
      webAudioSupported
    }
  }

  function play(input: SoundAlertPlayInput): void {
    if (disposed) return

    const volume = Number.isFinite(input.volume)
      ? Math.min(1, Math.max(0.1, input.volume))
      : 0.8

    stop()

    if (input.mode === 'tts' && input.text.trim().length > 0) {
      const synth = getSpeechSynthesis()
      if (synth) {
        const voices = safeGetVoices(synth)
        const matchedVoice = findVoiceForLanguage(voices, input.language)
        if (voices.length > 0 && !matchedVoice) {
          playChime(input.tone, volume)
          return
        }

        const spokenText = formatSpeechText(input.text, input.language)
        const utterance = createUtterance(spokenText)
        if (utterance) {
          utterance.lang =
            matchedVoice?.lang ?? (input.language === 'th' ? 'th-TH' : 'en-US')
          if (matchedVoice) {
            utterance.voice = matchedVoice
          }
          utterance.volume = volume
          utterance.rate = 1
          utterance.pitch = 1

          activeUtterance = utterance
          utterance.onend = () => {
            if (activeUtterance === utterance) {
              activeUtterance = null
            }
          }
          utterance.onerror = (event) => {
            if (disposed || activeUtterance !== utterance) return
            activeUtterance = null
            const errorCode = event?.error
            if (errorCode === 'canceled' || errorCode === 'interrupted') {
              return
            }
            playChime(input.tone, volume)
          }

          try {
            synth.speak(utterance)
            return
          } catch {
            activeUtterance = null
          }
        }
      }
    }

    playChime(input.tone, volume)
  }

  function dispose(): void {
    if (disposed) return
    stop()
    disposed = true
    if (audioContext) {
      const ctx = audioContext
      audioContext = null
      void ctx.close().catch(() => {})
    }
  }

  return {
    play,
    stop,
    dispose,
    getCapabilities
  }
}
