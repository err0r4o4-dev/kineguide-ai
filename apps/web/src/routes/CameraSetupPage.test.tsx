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
          <Route element={<h1>Live Monitoring</h1>} path="/app/monitor/calibration" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('CameraSetupPage', () => {
  it('shows permission step first', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(camera.useCamera).mockReturnValue({
      state: 'idle',
      start: vi.fn(),
      stop: vi.fn(),
      videoRef: { current: null }
    })

    renderRoute()

    expect(screen.getByRole('heading', { name: 'ประมวลผลกล้องในอุปกรณ์' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'เริ่ม Live Monitoring' })).toBeVisible()
  })

  it('handles camera permission and shows readiness state', async () => {
    await i18n.changeLanguage('th')
    const startMock = vi.fn()
    vi.mocked(camera.useCamera).mockReturnValue({
      state: 'ready',
      start: startMock,
      stop: vi.fn(),
      videoRef: { current: null }
    })

    const user = userEvent.setup()
    renderRoute()

    const startBtn = screen.getByRole('button', { name: 'เริ่ม Live Monitoring' })
    await user.click(startBtn)

    expect(screen.getByText('ความพร้อมของระบบ')).toBeVisible()
    expect(screen.getByText('สิทธิ์กล้อง')).toBeVisible()
    expect(screen.getByText('มองเห็นร่างกายและใบหน้า')).toBeVisible()
    expect(screen.getByRole('button', { name: 'เริ่ม Calibration' })).toBeEnabled()
  })

  it('disables continue when camera is denied', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(camera.useCamera).mockReturnValue({
      state: 'denied',
      start: vi.fn(),
      stop: vi.fn(),
      videoRef: { current: null }
    })

    const user = userEvent.setup()
    renderRoute()

    await user.click(screen.getByRole('button', { name: 'เริ่ม Live Monitoring' }))
    expect(screen.getByRole('button', { name: 'เริ่ม Calibration' })).toBeDisabled()
    expect(screen.getByText('ถูกปฏิเสธ')).toBeVisible()
  })

  it('creates session and navigates to calibration', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(camera.useCamera).mockReturnValue({
      state: 'ready',
      start: vi.fn(),
      stop: vi.fn(),
      videoRef: { current: null }
    })
    vi.mocked(product.createSession).mockResolvedValue({
      id: 'session-1',
      status: 'active',
      metrics: {
        duration_seconds: 0,
        sitting_seconds: 0,
        standing_seconds: 0,
        good_alignment_seconds: 0,
        needs_adjustment_seconds: 0,
        alert_count: 0,
        break_count: 0,
        longest_sitting_seconds: 0
      },
      started_at: '2026-08-28T09:00:00Z',
      completed_at: null,
      retention_until: '2027-08-28T09:00:00Z'
    })

    const user = userEvent.setup()
    renderRoute()

    await user.click(screen.getByRole('button', { name: 'เริ่ม Live Monitoring' }))
    await user.click(screen.getByRole('button', { name: 'เริ่ม Calibration' }))

    expect(product.createSession).toHaveBeenCalledWith({ camera_used: true })
    expect(await screen.findByRole('heading', { name: 'Live Monitoring' })).toBeInTheDocument()
  })
})
