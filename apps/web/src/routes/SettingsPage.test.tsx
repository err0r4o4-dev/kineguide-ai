import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
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
    getOAuthProviders: vi.fn()
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
