import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, vi } from 'vitest'

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

  it('does not show or request consent management', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={['/app/settings']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    )

    expect(
      screen.queryByRole('heading', { name: 'จัดการ consent' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'ถอน consent' })
    ).not.toBeInTheDocument()
    await waitFor(() => expect(product.getOAuthProviders).toHaveBeenCalled())
    expect(product.getConsent).not.toHaveBeenCalled()
  })
})
