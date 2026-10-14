import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import * as camera from '@/features/camera/useCamera'
import type {
  PoseTrackingSnapshot,
  PoseTrackingStatus
} from '@/features/pose/usePoseTracking'
import * as poseTracking from '@/features/pose/usePoseTracking'
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

function poseSnapshot(status: PoseTrackingStatus): PoseTrackingSnapshot {
  return {
    status,
    landmarks: null,
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
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app/sessions/session-1/live']}>
        <Routes>
          <Route element={<LiveSessionPage />} path="/app/sessions/:id/live" />
          <Route element={<h1>Summary</h1>} path="/app/sessions/:id/summary" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('LiveSessionPage', () => {
  beforeEach(() => {
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
      metrics: { duration_seconds: 0 }
    })
    expect(
      await screen.findByRole('heading', { name: 'Summary' })
    ).toBeInTheDocument()
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
      started_at: '2026-08-28T09:00:00Z',
      completed_at: '2026-08-28T09:01:40Z',
      retention_until: '2027-08-28T09:01:40Z'
    })

    await user.click(retryButton)
    expect(
      await screen.findByRole('heading', { name: 'Summary' })
    ).toBeInTheDocument()
  })
})
