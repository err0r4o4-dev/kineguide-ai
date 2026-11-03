import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, type AxiosResponse } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, vi } from 'vitest'

import { AppShell } from '@/components/layout/AppShell'
import i18n from '@/lib/i18n'
import { SessionSummaryPage } from '@/routes/SessionSummaryPage'
import { http } from '@/services/http'

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { display_name: 'Synthetic retry user' },
    logout: vi.fn()
  })
}))

const originalAdapter = http.defaults.adapter
let client: QueryClient

afterEach(() => {
  http.defaults.adapter = originalAdapter
  client?.clear()
})

it.each([false, true])(
  'retries the session API and recovers without reloading (cached: %s)',
  async (cached) => {
    await i18n.changeLanguage('en')
    const user = userEvent.setup()
    let settleRetry: (response: AxiosResponse) => void = () => undefined
    let rejectRetry: (error: Error) => void = () => undefined
    const adapter = vi.fn().mockImplementationOnce(() => {
      throw new AxiosError('Synthetic unavailable response', 'ERR_BAD_RESPONSE')
    })
    adapter.mockImplementation(
      () =>
        new Promise<AxiosResponse>((resolve, reject) => {
          settleRetry = resolve
          rejectRetry = reject
        })
    )
    http.defaults.adapter = adapter
    client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    if (cached) {
      client.setQueryData(['session', 'synthetic-session'], {
        id: 'synthetic-session',
        status: 'completed',
        metrics: { duration_seconds: 90 },
        posture_summary: null
      })
    }
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter
          initialEntries={['/app/sessions/synthetic-session/summary']}
        >
          <Routes>
            <Route element={<AppShell />} path="/app">
              <Route
                element={<SessionSummaryPage />}
                path="sessions/:id/summary"
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const retry = await screen.findByRole('button', { name: 'Try again' })
    await user.click(retry)
    await waitFor(() => expect(adapter).toHaveBeenCalledTimes(2))
    expect(adapter.mock.calls[1][0]).toMatchObject({
      method: 'get',
      url: '/sessions/synthetic-session'
    })
    if (cached) {
      const pending = screen.getByRole('button', { name: 'Loading…' })
      expect(pending).toBeDisabled()
      expect(pending).toHaveAttribute('aria-busy', 'true')
      await user.click(pending)
      expect(adapter).toHaveBeenCalledTimes(2)
    } else {
      expect(screen.getByRole('status')).toHaveTextContent('Loading…')
      expect(
        screen.queryByRole('button', { name: 'Try again' })
      ).not.toBeInTheDocument()
    }

    rejectRetry(new AxiosError('Still unavailable', 'ERR_BAD_RESPONSE'))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled()
    )
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(adapter).toHaveBeenCalledTimes(3))
    settleRetry({
      data: {
        id: 'synthetic-session',
        status: 'completed',
        elapsed_seconds: 90,
        manual_cycles: 0,
        posture_summary: null,
        started_at: '2026-11-04T00:00:00Z',
        completed_at: '2026-11-04T00:01:30Z',
        retention_until: '2027-11-04T00:01:30Z'
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: adapter.mock.calls[2][0]
    })

    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    )
    expect(await screen.findByText('1:30')).toBeVisible()
    expect(screen.getByRole('navigation')).toBeVisible()
    expect(adapter).toHaveBeenCalledTimes(3)
  }
)
