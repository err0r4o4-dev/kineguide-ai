import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import * as camera from '@/features/camera/useCamera'
import { resetSoundAlertPreferencesStoreForTests } from '@/features/notifications/soundAlertPreferences'
import type { PoseLandmark } from '@/features/pose/poseGeometry'
import type {
  PoseTrackingSnapshot,
  PoseTrackingStatus
} from '@/features/pose/usePoseTracking'
import * as poseTracking from '@/features/pose/usePoseTracking'
import { CALIBRATION_SAMPLE_TARGET } from '@/features/pose/usePostureMonitor'
import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { LiveSessionPage } from './LiveSessionPage'

vi.mock('@/services/product', () => ({
  getSession: vi.fn(),
  updateSession: vi.fn().mockResolvedValue({})
}))

vi.mock('@/features/camera/useCamera', () => ({
  useCamera: vi.fn()
}))

vi.mock('@/features/pose/usePoseTracking', () => ({
  usePoseTracking: vi.fn()
}))

vi.mock('@/features/pose/CameraPoseLayer', () => ({
  CameraPoseLayer: () => <div data-testid="pose-layer" />
}))

function poseSnapshot(
  status: PoseTrackingStatus,
  landmarks: PoseLandmark[] | null = null
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

function renderRoute() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const content = () => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app/sessions/session-1/live']}>
        <Routes>
          <Route element={<LiveSessionPage />} path="/app/sessions/:id/live" />
          <Route element={<h1>Summary</h1>} path="/app/sessions/:id/summary" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
  const view = render(content())
  return { ...view, refresh: () => view.rerender(content()) }
}

describe('LiveSessionPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetSoundAlertPreferencesStoreForTests()
    vi.mocked(camera.useCamera).mockReturnValue({
      state: 'ready',
      start: vi.fn(),
      stop: vi.fn(),
      videoRef: { current: document.createElement('video') }
    })
    vi.mocked(product.getSession).mockResolvedValue({
      id: 'session-1',
      status: 'active',
      metrics: {
        duration_seconds: 0,
        sitting_seconds: null,
        standing_seconds: null,
        good_alignment_seconds: null,
        needs_adjustment_seconds: null,
        alert_count: null,
        break_count: null,
        longest_sitting_seconds: null
      },
      posture_summary: null,
      started_at: '2026-08-28T09:00:00Z',
      completed_at: null,
      retention_until: '2027-08-28T09:00:00Z'
    })
    vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
      poseSnapshot('ready')
    )
  })

  it('shows technical availability without claiming posture quality', async () => {
    await i18n.changeLanguage('th')
    renderRoute()

    expect(
      await screen.findByRole('heading', {
        name: 'ติดตามขณะนั่งแบบเรียลไทม์'
      })
    ).toBeVisible()
    expect(screen.getByText('โหมดติดตามขณะนั่ง')).toBeVisible()
    expect(screen.getByText(/โหมดนี้ถูกเลือกโดยผู้ใช้/)).toBeVisible()
    expect(screen.getByText('มองเห็นจุดอ้างอิงสำหรับโหมดนั่งครบ')).toBeVisible()
    expect(
      screen.getByText('ยังไม่มี Baseline สำหรับเปรียบเทียบ')
    ).toBeVisible()
    expect(screen.queryByText('อยู่ในเกณฑ์ดี')).not.toBeInTheDocument()
    expect(screen.queryByText('ศีรษะ: ปกติ')).not.toBeInTheDocument()
    expect(screen.queryByText('ไหล่: สมดุล')).not.toBeInTheDocument()
    expect(screen.queryByText('ลำตัว: มั่นคง')).not.toBeInTheDocument()
    expect(screen.getByTestId('pose-layer')).toBeInTheDocument()
  })

  it('starts the camera only after the user requests it', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    const start = vi.fn()
    vi.mocked(camera.useCamera).mockReturnValue({
      state: 'idle',
      start,
      stop: vi.fn(),
      videoRef: { current: document.createElement('video') }
    })
    vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
      poseSnapshot('idle')
    )

    renderRoute()

    const startButton = await screen.findByRole('button', {
      name: 'เปิดกล้องสำหรับโหมดนั่ง'
    })
    expect(start).not.toHaveBeenCalled()

    await user.click(startButton)

    expect(start).toHaveBeenCalledOnce()
  })

  it.each([
    ['loading_model', 'กำลังโหลดโมเดล...'],
    ['adjust_camera', 'โปรดปรับกล้องให้เห็นจุดอ้างอิงที่จำเป็น'],
    ['no_pose', 'ไม่พบผู้ใช้งาน'],
    ['multiple_poses', 'พบหลายคน โปรดอยู่คนเดียวในเฟรม'],
    ['unsupported_activity', 'กิจกรรมนี้ยังไม่รองรับการตรวจจับจุดอ้างอิง'],
    ['unavailable', 'ไม่สามารถใช้การตรวจจับจุดอ้างอิงได้ในขณะนี้'],
    ['error', 'การตรวจจับจุดอ้างอิงขัดข้อง']
  ] as const)('reports the %s pose state honestly', async (status, message) => {
    await i18n.changeLanguage('th')
    vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
      poseSnapshot(status)
    )

    renderRoute()

    const technicalStatus = await screen.findByRole('status', {
      name: 'สถานะการตรวจจับ'
    })
    expect(technicalStatus).toBeVisible()
    expect(technicalStatus).toHaveTextContent(message)
    expect(screen.queryByText('อยู่ในเกณฑ์ดี')).not.toBeInTheDocument()
  })

  it('finishes with elapsed time only and does not submit invented metrics', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    renderRoute()

    await screen.findByRole('heading', {
      name: 'ติดตามขณะนั่งแบบเรียลไทม์'
    })
    await user.click(screen.getByRole('button', { name: 'จบเซสชัน' }))

    expect(product.updateSession).toHaveBeenCalledWith('session-1', {
      status: 'completed',
      metrics: {
        duration_seconds: 0,
        good_alignment_seconds: null,
        needs_adjustment_seconds: null,
        alert_count: null,
        break_count: null
      },
      posture_summary: null
    })
    expect(
      await screen.findByRole('heading', { name: 'Summary' })
    ).toBeInTheDocument()
  })

  it('allows the user to start calibration from the baseline section', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    renderRoute()

    const calibrateButton = await screen.findByRole('button', {
      name: 'ปรับเทียบ Baseline'
    })
    expect(calibrateButton).toBeEnabled()

    await user.click(calibrateButton)
    expect(await screen.findByText(/กำลังเก็บค่า Baseline/)).toBeInTheDocument()
  })

  it('connects live baseline differences and removes them when tracking is lost', async () => {
    await i18n.changeLanguage('th')
    const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.5,
      visibility: 0
    }))
    landmarks[0] = { x: 0.5, y: 0.2, visibility: 1 }
    landmarks[2] = { x: 0.48, y: 0.18, visibility: 1 }
    landmarks[5] = { x: 0.52, y: 0.18, visibility: 1 }
    landmarks[7] = { x: 0.45, y: 0.19, visibility: 1 }
    landmarks[8] = { x: 0.55, y: 0.19, visibility: 1 }
    landmarks[11] = { x: 0.4, y: 0.35, visibility: 1 }
    landmarks[12] = { x: 0.6, y: 0.35, visibility: 1 }
    vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
      poseSnapshot('ready', landmarks)
    )
    const user = userEvent.setup()
    const view = renderRoute()
    await user.click(
      await screen.findByRole('button', { name: 'ปรับเทียบ Baseline' })
    )
    for (let frame = 0; frame < CALIBRATION_SAMPLE_TARGET; frame++) {
      vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
        poseSnapshot('ready', landmarks)
      )
      view.refresh()
    }
    expect(await screen.findByText('ตัวเลขความต่างจาก Baseline')).toBeVisible()
    const tilted = landmarks.map((landmark, index) =>
      index === 8 ? { ...landmark, y: 0.21 } : landmark
    )
    vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
      poseSnapshot('ready', tilted)
    )
    view.refresh()
    const head = within(
      await screen.findByRole('group', { name: 'มุมเอียงศีรษะ' })
    )
    expect(await head.findAllByText('11.3°')).toHaveLength(2)
    expect(head.getByText('0.0°')).toBeVisible()
    vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
      poseSnapshot('no_pose')
    )
    view.refresh()
    expect(
      screen.getByText(
        'ยังประเมินไม่ได้ — รอข้อมูลที่เชื่อถือได้และ Baseline ที่ใช้ได้'
      )
    ).toBeVisible()
    expect(screen.queryByText('11.3°')).not.toBeInTheDocument()
  })

  it('pauses and resumes the session tracking and timer controls', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    renderRoute()

    await screen.findByRole('heading', {
      name: 'ติดตามขณะนั่งแบบเรียลไทม์'
    })
    const pauseButton = screen.getByRole('button', { name: 'พักการตรวจจับ' })
    await user.click(pauseButton)

    expect(
      await screen.findByRole('button', { name: 'ตรวจจับต่อ' })
    ).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'ตรวจจับต่อ' }))
    expect(
      await screen.findByRole('button', { name: 'พักการตรวจจับ' })
    ).toBeVisible()
  })

  it('redirects to summary page if session is already completed', async () => {
    vi.mocked(product.getSession).mockResolvedValue({
      id: 'session-1',
      status: 'completed',
      metrics: {
        duration_seconds: 120,
        sitting_seconds: null,
        standing_seconds: null,
        good_alignment_seconds: null,
        needs_adjustment_seconds: null,
        alert_count: null,
        break_count: null,
        longest_sitting_seconds: null
      },
      posture_summary: null,
      started_at: '2026-08-28T09:00:00Z',
      completed_at: '2026-08-28T09:02:00Z',
      retention_until: '2027-08-28T09:02:00Z'
    })

    renderRoute()

    expect(
      await screen.findByRole('heading', { name: 'Summary' })
    ).toBeInTheDocument()
  })

  it('syncs elapsed seconds if session was already in progress (e.g. after reload)', async () => {
    vi.mocked(product.getSession).mockResolvedValue({
      id: 'session-1',
      status: 'active',
      metrics: {
        duration_seconds: 75,
        sitting_seconds: null,
        standing_seconds: null,
        good_alignment_seconds: null,
        needs_adjustment_seconds: null,
        alert_count: null,
        break_count: null,
        longest_sitting_seconds: null
      },
      posture_summary: null,
      started_at: '2026-08-28T09:00:00Z',
      completed_at: null,
      retention_until: '2027-08-28T09:00:00Z'
    })

    renderRoute()

    expect(await screen.findByText('1:15')).toBeVisible()
  })

  it('shows an accessible error alert with retry button when save fails', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    vi.mocked(product.updateSession).mockRejectedValueOnce(
      new Error('Network error')
    )

    renderRoute()

    await screen.findByRole('heading', {
      name: 'ติดตามขณะนั่งแบบเรียลไทม์'
    })
    await user.click(screen.getByRole('button', { name: 'จบเซสชัน' }))

    const alertBox = await screen.findByRole('alert')
    expect(alertBox).toHaveTextContent('บันทึกเซสชันไม่สำเร็จ')
    const retryButton = screen.getByRole('button', { name: 'ลองอีกครั้ง' })
    expect(retryButton).toBeVisible()

    vi.mocked(product.updateSession).mockResolvedValueOnce({
      id: 'session-1',
      status: 'completed',
      metrics: {
        duration_seconds: 0,
        sitting_seconds: null,
        standing_seconds: null,
        good_alignment_seconds: null,
        needs_adjustment_seconds: null,
        alert_count: null,
        break_count: null,
        longest_sitting_seconds: null
      },
      posture_summary: null,
      started_at: '2026-08-28T09:00:00Z',
      completed_at: '2026-08-28T09:01:40Z',
      retention_until: '2027-08-28T09:01:40Z'
    })

    await user.click(retryButton)
    expect(
      await screen.findByRole('heading', { name: 'Summary' })
    ).toBeInTheDocument()
  })

  it('displays a camera framing alert when the user is too close to camera', async () => {
    await i18n.changeLanguage('th')
    const tooCloseLandmarks: PoseLandmark[] = Array.from(
      { length: 33 },
      () => ({
        x: 0.5,
        y: 0.5,
        visibility: 0.95
      })
    )
    tooCloseLandmarks[0] = { x: 0.5, y: 0.2, visibility: 0.95 }
    tooCloseLandmarks[2] = { x: 0.45, y: 0.18, visibility: 0.95 }
    tooCloseLandmarks[5] = { x: 0.55, y: 0.18, visibility: 0.95 }
    tooCloseLandmarks[11] = { x: 0.1, y: 0.35, visibility: 0.95 }
    tooCloseLandmarks[12] = { x: 0.9, y: 0.35, visibility: 0.95 } // width = 0.8

    vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
      poseSnapshot('ready', tooCloseLandmarks)
    )

    renderRoute()

    expect(
      await screen.findByText('มุมกล้องหรือตำแหน่งไม่เหมาะสม')
    ).toBeVisible()
    expect(
      screen.getByText('คุณอยู่ใกล้กล้องเกินไป กรุณาขยับถอยห่างออกมาเล็กน้อย')
    ).toBeVisible()
  })

  it('toggles live session sound alerts and always speaks Thai via TTS even when UI language is English', async () => {
    await i18n.changeLanguage('en')
    const spokenUtterances: Array<{ text: string; lang: string }> = []
    const cancelMock = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: vi.fn((utterance: { text: string; lang: string }) => {
          spokenUtterances.push(utterance)
        }),
        cancel: cancelMock,
        getVoices: () => [{ lang: 'th-TH', name: 'Thai Voice' }]
      }
    })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class FakeUtterance {
        text: string
        lang = ''
        volume = 1
        rate = 1
        pitch = 1
        voice: unknown = null
        onerror: unknown = null
        onend: unknown = null
        constructor(text: string) {
          this.text = text
        }
      }
    })

    const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.5,
      visibility: 0
    }))
    landmarks[0] = { x: 0.5, y: 0.2, visibility: 1 }
    landmarks[2] = { x: 0.48, y: 0.18, visibility: 1 }
    landmarks[5] = { x: 0.52, y: 0.18, visibility: 1 }
    landmarks[7] = { x: 0.45, y: 0.19, visibility: 1 }
    landmarks[8] = { x: 0.55, y: 0.19, visibility: 1 }
    landmarks[11] = { x: 0.4, y: 0.35, visibility: 1 }
    landmarks[12] = { x: 0.6, y: 0.35, visibility: 1 }
    vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
      poseSnapshot('ready', landmarks)
    )

    const user = userEvent.setup()
    const view = renderRoute()

    const soundToggle = await screen.findByRole('button', {
      name: 'Sound: On'
    })
    expect(soundToggle).toHaveAttribute('aria-pressed', 'true')

    // Complete calibration while unmuted -> speaks Thai confirmation even in English UI
    await user.click(
      await screen.findByRole('button', { name: 'Calibrate Baseline' })
    )
    for (let frame = 0; frame < CALIBRATION_SAMPLE_TARGET; frame++) {
      vi.mocked(poseTracking.usePoseTracking).mockReturnValue(
        poseSnapshot('ready', landmarks)
      )
      view.refresh()
    }
    expect(spokenUtterances).toHaveLength(1)
    expect(spokenUtterances[0]?.lang).toBe('th-TH')
    expect(spokenUtterances[0]?.text).toMatch(/[฀-๿]/)

    // Mute via header button -> cancels speech and updates accessible state
    await user.click(soundToggle)
    const mutedToggle = await screen.findByRole('button', {
      name: 'Sound: Off'
    })
    expect(mutedToggle).toHaveAttribute('aria-pressed', 'false')
    expect(cancelMock).toHaveBeenCalled()
  })
})
