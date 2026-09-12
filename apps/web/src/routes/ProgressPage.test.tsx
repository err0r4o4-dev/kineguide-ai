import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { ProgressPage } from './ProgressPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual('@/services/product')
  return { ...actual, getDashboard: vi.fn(), getSessions: vi.fn() }
})

describe('ProgressPage', () => {
  it('shows 10 activity records at a time and can move to the next page', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(product.getDashboard).mockResolvedValue({
      completed_sessions: 12,
      current_streak: 2,
      total_seconds: 720,
      recent_sessions: []
    })
    vi.mocked(product.getSessions).mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => ({
        id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
        exercise_slug: `activity-${index + 1}`,
        status: 'completed' as const,
        camera_used: false,
        manual_repetitions: 4,
        elapsed_seconds: 60,
        started_at: new Date(Date.now() - index * 60_000).toISOString(),
        completed_at: new Date(
          Date.now() - index * 60_000 + 60_000
        ).toISOString(),
        retention_until: new Date(Date.now() + 86_400_000).toISOString()
      }))
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    const user = userEvent.setup()

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ProgressPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('activity-1')).toBeVisible()
    expect(
      screen.getByRole('heading', { level: 1, name: 'ประวัติกิจกรรม' })
    ).toBeVisible()
    expect(screen.getByText('activity-10')).toBeVisible()
    expect(screen.queryByText('activity-11')).not.toBeInTheDocument()
    expect(screen.getByText('หน้า 1 จาก 2')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'หน้าถัดไป' }))

    expect(screen.queryByText('activity-1')).not.toBeInTheDocument()
    expect(screen.getByText('activity-11')).toBeVisible()
    expect(screen.getByText('activity-12')).toBeVisible()
    expect(screen.getByText('หน้า 2 จาก 2')).toBeVisible()
    expect(screen.getByRole('button', { name: 'หน้าถัดไป' })).toBeDisabled()
  })
})
