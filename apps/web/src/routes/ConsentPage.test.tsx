import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { ConsentPage } from './ConsentPage'

vi.mock('@/services/product', () => ({
  saveConsent: vi.fn()
}))

describe('ConsentPage language selector', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('th')
  })

  it('changes all consent copy to English without resetting selected consent', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ConsentPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const requiredConsent = screen.getByRole('checkbox', {
      name: /ยอมรับการประมวลผลกล้อง/
    })
    await user.click(requiredConsent)
    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Camera and activity-data consent'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', {
        name: /Allow camera processing and session-summary storage/
      })
    ).toBeChecked()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(vi.mocked(product.saveConsent)).not.toHaveBeenCalled()
  })

  it('shows full loading only after required consent is submitted', async () => {
    const user = userEvent.setup()
    vi.mocked(product.saveConsent).mockReturnValue(new Promise(() => undefined))
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ConsentPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('checkbox', { name: /ยอมรับการประมวลผลกล้อง/ })
    )
    await user.click(
      screen.getByRole('button', { name: 'ยอมรับและดำเนินการต่อ' })
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'กำลังเตรียม KineGuide AI'
    )
    expect(product.saveConsent).toHaveBeenCalledWith({
      camera_processing: true,
      session_summary_storage: true,
      ai_chat_storage: false,
      research_use: false
    })
  })
})
