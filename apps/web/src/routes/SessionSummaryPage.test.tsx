import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { SessionSummaryPage } from './SessionSummaryPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return { ...actual, getSession: vi.fn() }
})

describe('SessionSummaryPage', () => {
  it('returns to the MVP activity history', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(product.getSession).mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000001',
      activity_slug: 'walking-demo',
      activity_kind: 'gait',
      measurement_mode: 'observation',
      manual_cycles: 0,
      exercise_slug: 'walking-demo',
      status: 'completed',
      camera_used: false,
      manual_repetitions: 0,
      elapsed_seconds: 45,
      started_at: '2026-09-10T09:00:00Z',
      completed_at: '2026-09-10T09:00:45Z',
      retention_until: '2027-09-10T09:00:45Z'
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter
          initialEntries={[
            '/app/sessions/00000000-0000-4000-8000-000000000001/summary'
          ]}
        >
          <Routes>
            <Route
              element={<SessionSummaryPage />}
              path="/app/sessions/:id/summary"
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const historyLinks = await screen.findAllByRole('link', {
      name: 'ประวัติ'
    })
    expect(historyLinks).toHaveLength(2)
    for (const link of historyLinks) {
      expect(link).toHaveAttribute('href', '/app/history')
    }
  })
})
