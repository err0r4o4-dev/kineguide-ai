import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { ExerciseDetailPage } from './ExerciseDetailPage'
import { ExerciseLibraryPage } from './ExerciseLibraryPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return { ...actual, getActivities: vi.fn(), getActivity: vi.fn() }
})

const exercises: product.Exercise[] = [
  {
    slug: 'sit-to-stand-demo',
    title_th: 'สาธิตการเปลี่ยนจากนั่งเป็นยืน',
    title_en: 'Sit-to-stand demonstration',
    category: 'transition',
    kind: 'transition',
    required_view: 'side',
    measurement_mode: 'manual_cycles',
    review_status: 'pending_clinical_review',
    demo_only: true,
    not_for_clinical_use: true,
    analysis_available: false
  },
  {
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
  }
]

function renderWithQuery(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('activity demonstrations', () => {
  it('shows an accessible concept illustration for every activity', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(product.getActivities).mockResolvedValue(exercises)

    renderWithQuery(
      <MemoryRouter>
        <ExerciseLibraryPage />
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('img', {
        name: 'ภาพแนวคิดสามช่วงจากนั่งไปยืน'
      })
    ).toBeVisible()
    expect(
      screen.getByRole('img', {
        name: 'ภาพแนวคิดสามช่วงของการสาธิตการเดิน'
      })
    ).toBeVisible()
  })

  it('shows the selected exercise image on its detail page', async () => {
    await i18n.changeLanguage('en')
    vi.mocked(product.getActivity).mockResolvedValue(exercises[1])

    renderWithQuery(
      <MemoryRouter initialEntries={['/app/activities/walking-demo']}>
        <Routes>
          <Route
            element={<ExerciseDetailPage />}
            path="/app/activities/:slug"
          />
        </Routes>
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('img', {
        name: 'Three-stage concept illustration for the walking demonstration'
      })
    ).toBeVisible()
  })
})
