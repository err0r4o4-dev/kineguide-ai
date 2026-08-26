import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import * as product from '@/services/product'
import { ConsentRoute } from './ConsentRoute'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return { ...actual, getConsent: vi.fn() }
})

const activeConsent: product.Consent = {
  id: 'a91da3f1-00ae-4d7c-8ea3-b4e9f2c20d90',
  policy_version: 'prototype-v1',
  camera_processing: true,
  session_summary_storage: true,
  ai_chat_storage: false,
  research_use: false,
  accepted_at: '2026-08-24T12:01:00Z',
  revoked_at: null
}

function renderRoute() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/app']}>
          <Routes>
            <Route element={<ConsentRoute />}>
              <Route
                path="/app"
                element={<nav aria-label="เมนูหลัก">คุยกับ AI</nav>}
              />
            </Route>
            <Route path="/consent" element={<h1>หน้าความยินยอม</h1>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </StrictMode>
  )
}

describe('ConsentRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders authenticated navigation only after active consent is loaded', async () => {
    vi.mocked(product.getConsent).mockResolvedValue(activeConsent)

    renderRoute()

    expect(
      await screen.findByRole('navigation', { name: 'เมนูหลัก' })
    ).toHaveTextContent('คุยกับ AI')
  })

  it('redirects missing consent without flashing authenticated navigation', async () => {
    vi.mocked(product.getConsent).mockResolvedValue(null)

    renderRoute()

    expect(
      await screen.findByRole('heading', { name: 'หน้าความยินยอม' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'เมนูหลัก' })
    ).not.toBeInTheDocument()
  })

  it('shows a retryable failure instead of treating an API error as no consent', async () => {
    vi.mocked(product.getConsent).mockRejectedValue(new Error('unavailable'))

    renderRoute()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ลองอีกครั้ง' })).toBeEnabled()
    expect(
      screen.queryByRole('heading', { name: 'หน้าความยินยอม' })
    ).not.toBeInTheDocument()
  })
})
