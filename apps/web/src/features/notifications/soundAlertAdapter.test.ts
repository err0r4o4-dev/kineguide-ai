import { describe, expect, it, vi } from 'vitest'

import {
  createBrowserSoundAlertAdapter,
  formatSpeechText,
  type AudioContextLike,
  type OscillatorNodeLike,
  type SpeechSynthesisLike,
  type SpeechUtteranceLike
} from './soundAlertAdapter'

function createFakeAudioContext() {
  const oscillators: Array<
    OscillatorNodeLike & {
      startedAt?: number
      stoppedAt?: number
      disconnected: boolean
    }
  > = []

  const gainValues: number[] = []
  let closed = false
  let resumed = false

  const context: AudioContextLike = {
    state: 'suspended',
    currentTime: 10,
    destination: {},
    resume: vi.fn(async () => {
      resumed = true
    }),
    close: vi.fn(async () => {
      closed = true
    }),
    createOscillator: () => {
      const osc = {
        type: 'sine' as OscillatorType,
        frequency: { value: 440 },
        onended: null as (() => void) | null,
        disconnected: false,
        startedAt: undefined as number | undefined,
        stoppedAt: undefined as number | undefined,
        connect: vi.fn(),
        disconnect: vi.fn(() => {
          osc.disconnected = true
        }),
        start: vi.fn((when?: number) => {
          osc.startedAt = when
        }),
        stop: vi.fn((when?: number) => {
          osc.stoppedAt = when
        })
      }
      oscillators.push(osc)
      return osc
    },
    createGain: () => ({
      gain: {
        value: 0,
        setValueAtTime: vi.fn((val: number) => {
          gainValues.push(val)
        }),
        linearRampToValueAtTime: vi.fn((val: number) => {
          gainValues.push(val)
        }),
        exponentialRampToValueAtTime: vi.fn((val: number) => {
          gainValues.push(val)
        })
      },
      connect: vi.fn(),
      disconnect: vi.fn()
    })
  }

  return {
    context,
    oscillators,
    gainValues,
    isClosed: () => closed,
    isResumed: () => resumed
  }
}

function createFakeSpeechEnv(
  voices: Array<{ lang: string; name: string }> = []
) {
  const spoken: SpeechUtteranceLike[] = []
  const synth: SpeechSynthesisLike = {
    cancel: vi.fn(),
    getVoices: vi.fn(() => voices as SpeechSynthesisVoice[]),
    speak: vi.fn((utterance: SpeechUtteranceLike) => {
      spoken.push(utterance)
    })
  }
  const createUtterance = vi.fn((text: string): SpeechUtteranceLike => ({
    text,
    lang: '',
    volume: 1,
    rate: 1,
    pitch: 1,
    voice: null,
    onerror: null,
    onend: null
  }))

  return { synth, spoken, createUtterance }
}

describe('soundAlertAdapter', () => {
  it('formats slashes and dashes into natural spoken Thai and English phrasing', () => {
    expect(
      formatSpeechText(
        'สังเกตเห็นการโน้มศีรษะ/คอยื่นเข้าหาจอ — ลองดึงคอกลับ',
        'th'
      )
    ).toBe('สังเกตเห็นการโน้มศีรษะหรือคอยื่นเข้าหาจอ, ลองดึงคอกลับ')

    expect(
      formatSpeechText('Upper body (shoulders/head) — baseline ready', 'en')
    ).toBe('Upper body (shoulders or head), baseline ready')
  })

  it('speaks Thai text with preferred natural Thai voice, warms voices on init, and cancels prior speech', () => {
    const legacyThaiVoice = {
      lang: 'th_TH',
      name: 'Microsoft Pattara Desktop - Thai'
    }
    const naturalThaiVoice = {
      lang: 'th-TH',
      name: 'Microsoft Premwadee Online (Natural) - Thai (Thailand)'
    }
    const englishVoice = { lang: 'en-US', name: 'Aria' }
    const speech = createFakeSpeechEnv([
      englishVoice,
      legacyThaiVoice,
      naturalThaiVoice
    ])
    const audio = createFakeAudioContext()

    const adapter = createBrowserSoundAlertAdapter({
      getSpeechSynthesis: () => speech.synth,
      createUtterance: speech.createUtterance,
      createAudioContext: () => audio.context
    })

    // Eagerly warms browser voice enumeration upon creation
    expect(speech.synth.getVoices).toHaveBeenCalledTimes(1)

    expect(adapter.getCapabilities('th')).toEqual({
      speechStatus: 'supported',
      webAudioSupported: true
    })

    adapter.play({
      tone: 'posture',
      text: 'สังเกตเห็นการโน้มศีรษะ/คอยื่นเข้าหาจอ',
      language: 'th',
      mode: 'tts',
      volume: 0.75
    })

    expect(speech.synth.cancel).toHaveBeenCalledTimes(1)
    expect(speech.spoken).toHaveLength(1)
    expect(speech.spoken[0]?.text).toBe(
      'สังเกตเห็นการโน้มศีรษะหรือคอยื่นเข้าหาจอ'
    )
    expect(speech.spoken[0]?.lang).toBe('th-TH')
    expect(speech.spoken[0]?.voice).toEqual(naturalThaiVoice)
    expect(speech.spoken[0]?.volume).toBe(0.75)
    expect(audio.oscillators).toHaveLength(0)
  })

  it('falls back to Web Audio chime when speechSynthesis is unavailable', () => {
    const audio = createFakeAudioContext()
    const adapter = createBrowserSoundAlertAdapter({
      getSpeechSynthesis: () => null,
      createUtterance: () => null,
      createAudioContext: () => audio.context
    })

    expect(adapter.getCapabilities('th')).toEqual({
      speechStatus: 'unsupported',
      webAudioSupported: true
    })

    adapter.play({
      tone: 'break',
      text: 'ถึงเวลาพักสายตา',
      language: 'th',
      mode: 'tts',
      volume: 0.8
    })

    expect(audio.isResumed()).toBe(true)
    expect(audio.oscillators.length).toBeGreaterThanOrEqual(2)
  })

  it('falls back to Web Audio chime when populated voices lack the active language', () => {
    const speech = createFakeSpeechEnv([
      { lang: 'en-US', name: 'English Only' }
    ])
    const audio = createFakeAudioContext()

    const adapter = createBrowserSoundAlertAdapter({
      getSpeechSynthesis: () => speech.synth,
      createUtterance: speech.createUtterance,
      createAudioContext: () => audio.context
    })

    expect(adapter.getCapabilities('th').speechStatus).toBe('voice_unavailable')
    expect(adapter.getCapabilities('en').speechStatus).toBe('supported')

    adapter.play({
      tone: 'calibration_success',
      text: 'บันทึกค่ามาตรฐานส่วนบุคคลเรียบร้อยแล้ว',
      language: 'th',
      mode: 'tts',
      volume: 0.8
    })

    expect(speech.spoken).toHaveLength(0)
    expect(audio.oscillators.length).toBeGreaterThanOrEqual(2)
  })

  it('falls back to Web Audio chime when an utterance emits a synthesis error, but not when canceled', () => {
    const speech = createFakeSpeechEnv([])
    const audio = createFakeAudioContext()

    const adapter = createBrowserSoundAlertAdapter({
      getSpeechSynthesis: () => speech.synth,
      createUtterance: speech.createUtterance,
      createAudioContext: () => audio.context
    })

    adapter.play({
      tone: 'posture',
      text: 'Posture reminder',
      language: 'en',
      mode: 'tts',
      volume: 0.6
    })
    expect(speech.spoken).toHaveLength(1)

    speech.spoken[0]?.onerror?.({ error: 'canceled' })
    expect(audio.oscillators).toHaveLength(0)

    adapter.play({
      tone: 'posture',
      text: 'Second posture reminder',
      language: 'en',
      mode: 'tts',
      volume: 0.6
    })
    expect(speech.spoken).toHaveLength(2)

    speech.spoken[1]?.onerror?.({ error: 'synthesis-failed' })
    expect(audio.oscillators.length).toBeGreaterThanOrEqual(2)
  })

  it('plays gentle chimes directly in chime mode and cleans up resources on stop and dispose', () => {
    const speech = createFakeSpeechEnv([])
    const audio = createFakeAudioContext()

    const adapter = createBrowserSoundAlertAdapter({
      getSpeechSynthesis: () => speech.synth,
      createUtterance: speech.createUtterance,
      createAudioContext: () => audio.context
    })

    adapter.play({
      tone: 'preview',
      text: 'Test sound',
      language: 'en',
      mode: 'chime',
      volume: 0.5
    })

    expect(speech.spoken).toHaveLength(0)
    expect(audio.oscillators).toHaveLength(2)

    adapter.stop()
    expect(speech.synth.cancel).toHaveBeenCalled()

    adapter.dispose()
    expect(audio.isClosed()).toBe(true)
  })
})
