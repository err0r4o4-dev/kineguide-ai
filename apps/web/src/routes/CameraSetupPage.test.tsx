import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { CameraSetupPage } from './CameraSetupPage'

const stopCamera = vi.fn()

vi.mock('@/features/camera/useCamera', () => ({
  useCamera: () => ({
    state: 'denied',
    videoRef: { current: null },
    start: vi.fn(),
    stop: stopCamera
  })
}))

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return { ...actual, getActivity: vi.fn(), createSession: vi.fn() }
})

describe('CameraSetupPage', () => {
  it('keeps the demonstration reachable when camera permission is denied', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(product.getActivity).mockResolvedValue({
      slug: 'walking-demo',
      title_th: 'สาธิตการเดิน',
      title_en: 'Walking demonstration',
      category: 'walking',
      kind: 'gait',
      required_view: 'full_body',
      measurement_mode: 'observation',
      review_status: 'pending_clinical_review',
      demo_only: true,
      not_for_clinical_use: true,
      analysis_available: false
    })
    vi.mocked(product.createSession).mockResolvedValue({
      id: 'session-id',
      activity_slug: 'walking-demo',
      activity_kind: 'gait',
      measurement_mode: 'observation',
      manual_cycles: 0,
      exercise_slug: 'walking-demo',
      status: 'active',
      camera_used: false,
      manual_repetitions: 0,
      elapsed_seconds: 0,
      started_at: '2026-09-10T10:00:00Z',
      completed_at: null,
      retention_until: '2027-09-10T10:00:00Z'
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    const user = userEvent.setup()

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/app/activities/walking-demo/setup']}>
          <Routes>
            <Route
              element={<CameraSetupPage />}
              path="/app/activities/:slug/setup"
            />
            <Route
              element={<p>live destination</p>}
              path="/app/sessions/:id/live"
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await user.click(
      await screen.findByRole('button', { name: 'ดูสาธิตโดยไม่ใช้กล้อง' })
    )

    expect(product.createSession).toHaveBeenCalledWith({
      activity_slug: 'walking-demo',
      camera_used: false
    })
    expect(await screen.findByText('live destination')).toBeVisible()
    expect(stopCamera).toHaveBeenCalled()
  })
})
