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
  return { ...actual, getExercises: vi.fn(), getExercise: vi.fn() }
})

const exercises: product.Exercise[] = [
  {
    slug: 'sit-to-stand-demo',
    title_th: 'สาธิตการลุกนั่งจากเก้าอี้',
    title_en: 'Sit-to-stand movement demo',
    category: 'lower_body',
    review_status: 'pending_clinical_review'
  },
  {
    slug: 'shoulder-movement-demo',
    title_th: 'สาธิตการเคลื่อนไหวหัวไหล่',
    title_en: 'Shoulder movement demo',
    category: 'upper_body',
    review_status: 'pending_clinical_review'
  }
]

function renderWithQuery(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('exercise demonstration images', () => {
  it('shows an accessible image for every exercise in the library', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(product.getExercises).mockResolvedValue(exercises)

    renderWithQuery(
      <MemoryRouter>
        <ExerciseLibraryPage />
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('img', {
        name: 'ภาพตัวอย่างสาธิตการลุกนั่งจากเก้าอี้ 3 จังหวะ'
      })
    ).toHaveAttribute('src', '/exercises/sit-to-stand-demo.png')
    expect(
      screen.getByRole('img', {
        name: 'ภาพตัวอย่างสาธิตการเคลื่อนไหวหัวไหล่ 3 จังหวะ'
      })
    ).toHaveAttribute('src', '/exercises/shoulder-movement-demo.png')
  })

  it('shows the selected exercise image on its detail page', async () => {
    await i18n.changeLanguage('en')
    vi.mocked(product.getExercise).mockResolvedValue(exercises[1])

    renderWithQuery(
      <MemoryRouter initialEntries={['/app/exercises/shoulder-movement-demo']}>
        <Routes>
          <Route element={<ExerciseDetailPage />} path="/app/exercises/:slug" />
        </Routes>
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('img', {
        name: 'Three-stage illustration of the shoulder movement demo'
      })
    ).toHaveAttribute('src', '/exercises/shoulder-movement-demo.png')
  })
})
