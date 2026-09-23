import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { ConsentPage } from './ConsentPage'

vi.mock('@/services/product', () => ({
  saveConsent: vi.fn().mockResolvedValue({})
}))

function renderRoute() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/consent']}>
        <Routes>
          <Route element={<ConsentPage />} path="/consent" />
          <Route element={<h1>หน้าแรก</h1>} path="/app" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ConsentPage', () => {
  it('requires explicit confirmation before saving consent', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    renderRoute()

    expect(
      screen.getByRole('heading', { name: 'การอนุญาตใช้กล้องและข้อมูล' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'ประมวลผลกล้องในอุปกรณ์' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'เก็บ session summary' })
    ).toBeVisible()
    expect(screen.getByText(/โดยไม่เก็บการยืนยันโหมดนั่ง/)).toBeVisible()

    const submitBtn = screen.getByRole('button', {
      name: 'ยอมรับและดำเนินการต่อ'
    })
    expect(submitBtn).toBeDisabled()

    const requiredCheckbox = screen.getByLabelText(
      'ยอมรับการประมวลผลกล้องและการเก็บ session summary'
    )
    await user.click(requiredCheckbox)

    expect(submitBtn).toBeEnabled()

    await user.click(submitBtn)
    expect(product.saveConsent).toHaveBeenCalledWith({
      camera_processing: true,
      session_summary_storage: true,
      ai_chat_storage: true,
      research_use: false
    })

    expect(
      await screen.findByRole('heading', { name: 'หน้าแรก' })
    ).toBeInTheDocument()
  })

  it('allows optional research consent', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    renderRoute()

    const requiredCheckbox = screen.getByLabelText(
      'ยอมรับการประมวลผลกล้องและการเก็บ session summary'
    )
    await user.click(requiredCheckbox)

    const researchCheckbox = screen.getByLabelText(
      'อนุญาตใช้ข้อมูลแบบไม่ระบุตัวตนเพื่อการวิจัย (ทางเลือก)'
    )
    await user.click(researchCheckbox)

    await user.click(
      screen.getByRole('button', { name: 'ยอมรับและดำเนินการต่อ' })
    )
    expect(product.saveConsent).toHaveBeenCalledWith({
      camera_processing: true,
      session_summary_storage: true,
      ai_chat_storage: true,
      research_use: true
    })
  })
})
