import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { ProgressPage } from './ProgressPage'

vi.mock('@/services/product', () => ({
  getDashboard: vi.fn().mockResolvedValue({
    completed_sessions: 15,
    total_seconds: 3600,
    current_streak: 5
  }),
  getSessions: vi.fn().mockResolvedValue(
    Array.from({ length: 15 }, (_, i) => ({
      id: `session-${i}`,
      status: 'completed',
      metrics: {
        duration_seconds: 300
      },
      started_at: new Date(Date.now() - i * 86400000).toISOString()
    }))
  )
}))

function renderRoute() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app/analytics']}>
        <Routes>
          <Route element={<ProgressPage />} path="/app/analytics" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProgressPage', () => {
  it('renders posture analytics metrics and filters', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    renderRoute()

    expect(
      await screen.findByRole('heading', { name: 'สถิติท่าทาง' })
    ).toBeVisible()
    expect(screen.getByText('15')).toBeVisible() // sessions
    expect(screen.getByText('5')).toBeVisible() // streak

    // Test chart filters
    const allFilter = screen.getByRole('button', { name: 'ทั้งหมด' })
    await user.click(allFilter)
    expect(allFilter).toHaveClass('kg-filter-active')

    // Test history list pagination
    expect(screen.getByRole('heading', { name: 'ประวัติเซสชัน' })).toBeVisible()
    expect(screen.getByText('หน้า 1 จาก 2')).toBeVisible()

    const nextBtn = screen.getByRole('button', { name: 'หน้าถัดไป' })
    await user.click(nextBtn)
    expect(screen.getByText('หน้า 2 จาก 2')).toBeVisible()
  })
})
