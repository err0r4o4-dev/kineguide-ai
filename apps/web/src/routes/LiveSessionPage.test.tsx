import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { LiveSessionPage } from './LiveSessionPage'

vi.mock('@/features/camera/useCamera', () => ({
  useCamera: () => ({
    state: 'idle',
    videoRef: { current: null },
    start: vi.fn(),
    stop: vi.fn()
  })
}))

vi.mock('@/features/pose/usePoseTracking', () => ({
  usePoseTracking: () => ({
    status: 'idle',
    landmarks: null,
    bounds: null,
    unreliableLandmarks: [],
    faceLandmarks: null,
    leftHandLandmarks: null,
    rightHandLandmarks: null,
    blink: null
  })
}))

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return {
    ...actual,
    getSession: vi.fn(),
    getActivity: vi.fn(),
    updateSession: vi.fn()
  }
})

describe('LiveSessionPage', () => {
  it('keeps walking demo-only and does not expose unreviewed scoring', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(product.getSession).mockResolvedValue({
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
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/app/sessions/session-id/live']}>
          <Routes>
            <Route
              element={<LiveSessionPage />}
              path="/app/sessions/:id/live"
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('สาธิตการเดิน')).toBeVisible()
    expect(screen.getByText(/กำลังดูสาธิตโดยไม่ใช้กล้อง/)).toBeVisible()
    expect(screen.getByText(/ยังไม่เปรียบเทียบความถูกต้อง/)).toBeVisible()
    expect(screen.queryByText('คะแนนความแม่นยำ')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'เพิ่ม 1 รอบ' })
    ).not.toBeInTheDocument()
  })
})
