import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import Swal from 'sweetalert2'
import { afterEach, beforeEach, vi } from 'vitest'

import { AuthContext, type AuthContextValue } from '@/features/auth/AuthContext'
import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { SettingsPage } from './SettingsPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return {
    ...actual,
    getAuthIdentities: vi.fn(),
    getConsent: vi.fn(),
    getOAuthProviders: vi.fn(),
    deleteAccount: vi.fn(),
    deleteAuthIdentity: vi.fn(),
    revokeConsent: vi.fn(),
    startAuthIdentityLink: vi.fn()
  }
})

const auth: AuthContextValue = {
  user: null,
  ready: true,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearSession: vi.fn()
}

describe('SettingsPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('th')
    vi.mocked(product.getOAuthProviders).mockResolvedValue({ providers: [] })
    vi.mocked(product.getAuthIdentities).mockResolvedValue([])
    vi.mocked(product.getConsent).mockResolvedValue(null)
  })

  afterEach(() => {
    Swal.close()
  })

  it('deletes the account only after an accessible confirmation', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })
    vi.mocked(product.deleteAccount).mockResolvedValue(undefined)

    render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={['/app/settings']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    )

    await user.click(
      screen.getByRole('button', { name: 'ลบบัญชีและข้อมูลทั้งหมด' })
    )
    await screen.findByRole('dialog', { name: 'ลบบัญชีและข้อมูลทั้งหมด' })
    await user.click(screen.getByRole('button', { name: 'ยกเลิก' }))
    expect(product.deleteAccount).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('button', { name: 'ลบบัญชีและข้อมูลทั้งหมด' })
    )
    await user.click(screen.getByRole('button', { name: 'ลบ' }))
    await waitFor(() => expect(product.deleteAccount).toHaveBeenCalledTimes(1))
    expect(auth.clearSession).toHaveBeenCalledTimes(1)
  })

  it('keeps the session and shows an error when account deletion fails', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })
    vi.mocked(product.deleteAccount).mockRejectedValueOnce(
      new Error('synthetic failure')
    )

    render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={['/app/settings']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    )

    await user.click(
      screen.getByRole('button', { name: 'ลบบัญชีและข้อมูลทั้งหมด' })
    )
    await user.click(await screen.findByRole('button', { name: 'ลบ' }))

    expect(
      await screen.findByRole('dialog', {
        name: 'ไม่สามารถลบบัญชีได้ กรุณาลองใหม่'
      })
    ).toBeInTheDocument()
    expect(auth.clearSession).not.toHaveBeenCalled()
  })

  it('withdraws active consent only after confirmation and returns to consent', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })
    vi.mocked(product.getConsent).mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000003',
      policy_version: 'prototype-v3',
      camera_processing: true,
      session_summary_storage: true,
      ai_chat_storage: false,
      research_use: false,
      accepted_at: '2026-08-25T15:34:00Z',
      revoked_at: null
    })
    vi.mocked(product.revokeConsent).mockResolvedValue(undefined)
    client.setQueryData(
      ['conversation-messages', 'synthetic'],
      [{ content: 'ข้อมูลทดสอบ' }]
    )

    render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={['/app/settings']}>
            <Routes>
              <Route path="/app/settings" element={<SettingsPage />} />
              <Route path="/consent" element={<p>หน้าทบทวน consent</p>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    )

    expect(
      await screen.findByRole('heading', { name: 'จัดการ consent' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /สิทธิ์กล้อง/ })).toHaveAttribute(
      'href',
      '/app/activities'
    )
    await user.click(await screen.findByRole('button', { name: 'ถอน consent' }))
    await screen.findByRole('dialog', { name: 'ถอน consent' })
    await user.click(screen.getByRole('button', { name: 'ยกเลิก' }))
    expect(product.revokeConsent).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'ถอน consent' }))
    await user.click(screen.getByRole('button', { name: 'ยืนยันการถอน' }))

    await waitFor(() => expect(product.revokeConsent).toHaveBeenCalledTimes(1))
    expect(await screen.findByText('หน้าทบทวน consent')).toBeVisible()
    expect(client.getQueryData(['consent'])).toBeNull()
    expect(
      client.getQueryData(['conversation-messages', 'synthetic'])
    ).toBeUndefined()
  })
})
