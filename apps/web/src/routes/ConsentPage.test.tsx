import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { ConsentPage } from './ConsentPage'

vi.mock('@/lib/minimumLoadingDuration', () => ({
  waitForLoadingCompletion: vi.fn().mockResolvedValue(undefined),
  withMinimumLoadingDuration: async <T,>(operation: Promise<T>) => operation
}))

vi.mock('@/services/product', () => ({
  saveConsent: vi.fn()
}))

describe('ConsentPage language selector', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
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

  it('opens health-profile setup after consent is saved', async () => {
    const user = userEvent.setup()
    vi.mocked(product.saveConsent).mockResolvedValue({
      camera_processing: true,
      session_summary_storage: true,
      ai_chat_storage: false,
      research_use: false,
      id: 'c42b9d5a-ef9e-4c57-88a5-0c3ac29dcd17',
      policy_version: 'prototype-v3',
      accepted_at: '2026-08-27T08:00:00Z',
      revoked_at: null
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/consent']}>
          <Routes>
            <Route path="/consent" element={<ConsentPage />} />
            <Route path="/onboarding" element={<h1>ตั้งค่าโปรไฟล์สุขภาพ</h1>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await user.click(
      screen.getByRole('checkbox', { name: /ยอมรับการประมวลผลกล้อง/ })
    )
    await user.click(
      screen.getByRole('button', { name: 'ยอมรับและดำเนินการต่อ' })
    )

    expect(
      await screen.findByRole('heading', { name: 'ตั้งค่าโปรไฟล์สุขภาพ' })
    ).toBeInTheDocument()
  })
})
