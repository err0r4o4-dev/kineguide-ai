import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { PlanPage } from './PlanPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return { ...actual, getActivityPlan: vi.fn() }
})

describe('PlanPage', () => {
  it('shows the non-personalized status and switches days accessibly', async () => {
    await i18n.changeLanguage('th')
    const exercise: product.Exercise = {
      slug: 'sit-to-stand-demo',
      title_th: 'สาธิตการลุกนั่งจากเก้าอี้',
      title_en: 'Sit-to-stand movement demo',
      category: 'lower_body',
      review_status: 'pending_clinical_review'
    }
    vi.mocked(product.getActivityPlan).mockResolvedValue({
      plan_type: 'demo_exploration',
      review_status: 'pending_clinical_review',
      personalized: false,
      duration_days: 7,
      days: Array.from({ length: 7 }, (_, index) => ({
        day: index + 1,
        exercises: [exercise]
      }))
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    const user = userEvent.setup()

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/app/plan?day=1']}>
          <PlanPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      await screen.findByRole('heading', {
        name: 'แผนกิจกรรมสาธิต 7 วัน'
      })
    ).toBeInTheDocument()
    expect(screen.getByText('ไม่ได้ปรับตามอาการของคุณ')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'วันที่ 3' }))
    expect(screen.getByRole('tab', { name: 'วันที่ 3' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(
      screen.getByRole('heading', { name: 'กิจกรรมสาธิตสำหรับวันที่ 3' })
    ).toBeInTheDocument()
  })
})
