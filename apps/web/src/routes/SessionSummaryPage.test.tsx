import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { SessionSummaryPage } from './SessionSummaryPage'

vi.mock('@/services/product', () => ({
  getSession: vi.fn()
}))

function renderRoute() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app/monitor/summary/session-1']}>
        <Routes>
          <Route
            element={<SessionSummaryPage />}
            path="/app/monitor/summary/:id"
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('SessionSummaryPage', () => {
  it('shows elapsed time without presenting unmeasured posture metrics', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(product.getSession).mockResolvedValue({
      id: 'session-1',
      status: 'completed',
      metrics: {
        duration_seconds: 3600, // 1h
        sitting_seconds: 2700, // 45m
        standing_seconds: 900, // 15m
        good_alignment_seconds: 2400, // 40m
        needs_adjustment_seconds: 1200, // 20m
        alert_count: 3,
        break_count: 1,
        longest_sitting_seconds: 1800 // 30m
      },
      started_at: '2026-08-28T09:00:00Z',
      completed_at: '2026-08-28T10:00:00Z',
      retention_until: '2027-08-28T10:00:00Z'
    })

    renderRoute()

    expect(
      await screen.findByRole('heading', { name: 'เซสชันติดตามท่าทาง' })
    ).toBeVisible()
    expect(screen.getByText('เสร็จสิ้น')).toBeVisible()

    expect(screen.getByText('1h 0m')).toBeVisible()
    expect(
      screen.getByText('ไม่มีผลวิเคราะห์ท่าทางสำหรับเซสชันนี้')
    ).toBeVisible()
    expect(screen.queryByText('อยู่ในเกณฑ์ดี')).not.toBeInTheDocument()
    expect(screen.queryByText('จำนวนการแจ้งเตือน')).not.toBeInTheDocument()
    expect(screen.queryByText('ช่วงเวลานั่งนานที่สุด')).not.toBeInTheDocument()
  })

  it('renders stopped state', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(product.getSession).mockResolvedValue({
      id: 'session-1',
      status: 'stopped',
      metrics: {
        duration_seconds: 60,
        sitting_seconds: 60,
        standing_seconds: 0,
        good_alignment_seconds: 60,
        needs_adjustment_seconds: 0,
        alert_count: 0,
        break_count: 0,
        longest_sitting_seconds: 60
      },
      started_at: '2026-08-28T09:00:00Z',
      completed_at: null,
      retention_until: '2027-08-28T09:00:00Z'
    })

    renderRoute()

    expect(
      await screen.findByRole('heading', { name: 'เซสชันติดตามท่าทาง' })
    ).toBeVisible()
    expect(screen.getByText('หยุดก่อนเสร็จ')).toBeVisible()
  })
})
