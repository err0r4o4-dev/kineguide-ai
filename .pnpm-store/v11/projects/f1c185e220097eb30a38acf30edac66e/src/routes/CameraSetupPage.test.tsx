import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as camera from '@/features/camera/useCamera'
import * as product from '@/services/product'
import { CameraSetupPage } from './CameraSetupPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return {
    ...actual,
    createSession: vi.fn()
  }
})

vi.mock('@/features/camera/useCamera', () => ({
  useCamera: vi.fn()
}))

function renderRoute() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app/monitor']}>
        <Routes>
          <Route element={<CameraSetupPage />} path="/app/monitor" />
          <Route
            element={<h1>Live Monitoring</h1>}
            path="/app/sessions/:id/live"
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('CameraSetupPage', () => {
  it('presents the camera setup journey and practical setup guidance', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(camera.useCamera).mockReturnValue({
      state: 'idle',
      start: vi.fn(),
      stop: vi.fn(),
      videoRef: { current: null }
    })

    renderRoute()

    const progress = screen.getByRole('navigation', {
      name: 'ขั้นตอนการตั้งค่ากล้อง'
    })
    expect(progress).toHaveTextContent('ตั้งค่ากล้อง')
    expect(progress).toHaveTextContent('ตรวจสอบภาพ')
    expect(progress).toHaveTextContent('เริ่มติดตาม')
    expect(
      screen.getByRole('heading', { name: 'ประมวลผลกล้องบนอุปกรณ์' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'แสงสว่างเพียงพอ' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'วางอุปกรณ์ให้มั่นคง' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'ให้เห็นทั้งตัว' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'สวมเสื้อผ้าที่มองเห็นแนวร่างกาย' })
    ).toBeVisible()
  })

  it('requires explicit seated-mode confirmation before camera permission', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    vi.mocked(camera.useCamera).mockReturnValue({
      state: 'idle',
      start: vi.fn(),
      stop: vi.fn(),
      videoRef: { current: null }
    })

    renderRoute()

    expect(
      screen.getByRole('heading', { name: 'ตั้งค่ากล้องสำหรับโหมดนั่ง' })
    ).toBeVisible()
    const startButton = screen.getByRole('button', {
      name: 'เริ่มติดตามการนั่ง'
    })
    expect(startButton).toBeDisabled()

    await user.click(
      screen.getByLabelText(
        'ฉันจะใช้กล้องขณะนั่งและจัดเฟรมให้เห็นจุดอ้างอิงตามคำแนะนำ'
      )
    )

    expect(startButton).toBeEnabled()
    expect(
      screen.getByText(/ไม่ยืนยันว่าคุณกำลังนั่งหรือท่านั่งถูกต้อง/)
    ).toBeVisible()
  })

  it('creates a session and navigates with the real session id', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(camera.useCamera).mockReturnValue({
      state: 'ready',
      start: vi.fn(),
      stop: vi.fn(),
      videoRef: { current: null }
    })
    vi.mocked(product.createSession)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({
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

    const user = userEvent.setup()
    renderRoute()

    await user.click(
      screen.getByLabelText(
        'ฉันจะใช้กล้องขณะนั่งและจัดเฟรมให้เห็นจุดอ้างอิงตามคำแนะนำ'
      )
    )
    await user.click(screen.getByRole('button', { name: 'เริ่มติดตามการนั่ง' }))

    expect(await screen.findByRole('alert')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'เริ่มติดตามการนั่ง' }))
    expect(camera.useCamera).not.toHaveBeenCalled()
    expect(product.createSession).toHaveBeenCalledWith({ camera_used: true })
    expect(
      await screen.findByRole('heading', { name: 'Live Monitoring' })
    ).toBeInTheDocument()
  })
})
