import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { AssessmentPage } from './AssessmentPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return {
    ...actual,
    getLatestAssessment: vi.fn(),
    saveAssessment: vi.fn()
  }
})

describe('AssessmentPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('th')
    vi.mocked(product.getLatestAssessment).mockResolvedValue(null)
  })

  it('stores bounded self-reported answers without evaluating them', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })
    vi.mocked(product.saveAssessment).mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000004',
      concern_area: 'lower_back',
      duration_band: 'one_to_four_weeks',
      daily_impact: 'some',
      goal: 'understand',
      status: 'captured_not_evaluated',
      created_at: '2026-08-28T10:00:00Z',
      retention_until: '2027-08-28T10:00:00Z'
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AssessmentPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      await screen.findByRole('heading', {
        name: 'แบบประเมินข้อมูลเบื้องต้น',
        level: 1
      })
    ).toBeInTheDocument()
    expect(screen.getByText(/บันทึกคำตอบเท่านั้นและไม่ประเมิน/)).toBeVisible()

    await user.click(await screen.findByRole('radio', { name: 'หลังส่วนล่าง' }))
    await user.click(screen.getByRole('radio', { name: '1–4 สัปดาห์' }))
    await user.click(screen.getByRole('radio', { name: 'กระทบบางส่วน' }))
    await user.click(screen.getByRole('radio', { name: 'ทำความเข้าใจข้อมูล' }))
    await user.click(screen.getByRole('button', { name: 'บันทึกคำตอบ' }))

    await waitFor(() =>
      expect(product.saveAssessment).toHaveBeenCalledWith({
        concern_area: 'lower_back',
        duration_band: 'one_to_four_weeks',
        daily_impact: 'some',
        goal: 'understand'
      })
    )
    expect(await screen.findByRole('status')).toHaveTextContent(
      'บันทึกคำตอบแล้วโดยไม่มีการประเมินผล'
    )
  })
})
