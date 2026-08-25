import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { AssessmentPage } from './AssessmentPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return { ...actual, saveAssessment: vi.fn() }
})

describe('AssessmentPage conversation', () => {
  it('collects structured answers, reviews them, and opens the activity plan', async () => {
    await i18n.changeLanguage('th')
    vi.mocked(product.saveAssessment).mockResolvedValue({
      id: '1f9cc536-e3b5-4a6f-b416-6acd218d0be8',
      concern_area: 'lower_back',
      duration_band: 'one_to_four_weeks',
      daily_impact: 'some',
      goal: 'camera_demo',
      status: 'captured_not_evaluated',
      created_at: '2026-08-24T12:02:00Z',
      retention_until: '2027-08-24T12:02:00Z'
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/app/assessment']}>
        <Routes>
          <Route path="/app/assessment" element={<AssessmentPage />} />
          <Route path="/app/plan" element={<h1>แผนกิจกรรมสาธิต 7 วัน</h1>} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('radio', { name: 'หลังส่วนล่าง' }))
    await user.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
    await user.click(screen.getByRole('radio', { name: '1–4 สัปดาห์' }))
    await user.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
    await user.click(screen.getByRole('radio', { name: 'มีผลบ้าง' }))
    await user.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
    await user.click(
      screen.getByRole('radio', { name: 'ทดลองกล้องและการเคลื่อนไหว' })
    )
    await user.click(screen.getByRole('button', { name: 'ตรวจทานคำตอบ' }))

    expect(
      screen.getByRole('heading', { name: 'ตรวจทานคำตอบของคุณ' })
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'บันทึกและดูแผน' }))

    expect(product.saveAssessment).toHaveBeenCalledWith({
      concern_area: 'lower_back',
      duration_band: 'one_to_four_weeks',
      daily_impact: 'some',
      goal: 'camera_demo'
    })
    expect(
      await screen.findByRole('heading', {
        name: 'แผนกิจกรรมสาธิต 7 วัน'
      })
    ).toBeInTheDocument()
  })
})
