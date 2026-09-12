import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import * as poseTracking from '@/features/pose/usePoseTracking'
import { LiveSessionPage } from './LiveSessionPage'

vi.mock('@/services/product', () => ({
  getSession: vi.fn(),
  updateSession: vi.fn().mockResolvedValue({})
}))

vi.mock('@/features/camera/useCamera', () => ({
  useCamera: () => ({
    state: 'ready',
    start: vi.fn(),
    stop: vi.fn(),
    videoRef: { current: document.createElement('video') }
  })
}))

vi.mock('@/features/pose/usePoseTracking', () => ({
  usePoseTracking: vi.fn()
}))

vi.mock('@/features/pose/CameraPoseLayer', () => ({
  CameraPoseLayer: () => <div data-testid="pose-layer" />
}))

function renderRoute() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app/monitor/live']}>
        <Routes>
          <Route element={<LiveSessionPage />} path="/app/monitor/live" />
          <Route element={<h1>Summary</h1>} path="/app/monitor/summary/:id" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('LiveSessionPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(product.getSession).mockResolvedValue({
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
    vi.mocked(poseTracking.usePoseTracking).mockReturnValue({
      status: 'ready',
      result: {} as any
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders posture monitoring session UI', async () => {
    await i18n.changeLanguage('th')
    renderRoute()

    expect(await screen.findByRole('heading', { name: 'Live Posture Monitoring' })).toBeVisible()
    expect(screen.getByText('สถานะปัจจุบัน')).toBeVisible()
    expect(screen.getByText('การจัดท่าทาง')).toBeVisible()
    expect(screen.getByText('เปรียบเทียบจากค่า Baseline')).toBeVisible()
    expect(screen.getByTestId('pose-layer')).toBeInTheDocument()
  })

  it('can pause and finish the session', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderRoute()

    await screen.findByRole('heading', { name: 'Live Posture Monitoring' })

    const pauseBtn = screen.getByRole('button', { name: 'พักการตรวจจับ' })
    await user.click(pauseBtn)
    expect(screen.getByRole('button', { name: 'ตรวจจับต่อ' })).toBeVisible()

    const finishBtn = screen.getByRole('button', { name: 'จบเซสชัน' })
    await user.click(finishBtn)

    expect(product.updateSession).toHaveBeenCalled()
    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeInTheDocument()
  })
})
