import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, vi } from 'vitest'

import { AuthContext, type AuthContextValue } from '@/features/auth/AuthContext'
import '@/lib/i18n'
import * as product from '@/services/product'
import { AuthPage } from './AuthPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return {
    ...actual,
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

describe('AuthPage social sign in', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows accessible Google and Facebook buttons when configured', async () => {
    vi.mocked(product.getOAuthProviders).mockResolvedValue({
      providers: [
        { provider: 'google', enabled: true },
        { provider: 'facebook', enabled: true }
      ]
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={['/login']}>
            <AuthPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    )

    expect(
      await screen.findByRole('button', { name: 'เข้าสู่ระบบด้วย Google' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย Facebook' })
    ).toBeInTheDocument()
    expect(screen.getByText('หรือ')).toBeInTheDocument()
  })

  it('shows loading on the Google logo without replacing the login page', async () => {
    const user = userEvent.setup()
    const navigationError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    vi.mocked(product.getOAuthProviders).mockResolvedValue({
      providers: [{ provider: 'google', enabled: true }]
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={['/login']}>
            <AuthPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    )

    await user.click(
      await screen.findByRole('button', { name: 'เข้าสู่ระบบด้วย Google' })
    )

    expect(
      screen.getByRole('status', { name: 'กำลังเชื่อมต่อบัญชี Google' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ยินดีต้อนรับ' })).toBeVisible()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    navigationError.mockRestore()
  })

  it('submits email login without applying registration-only validation', async () => {
    const user = userEvent.setup()
    vi.mocked(product.getOAuthProviders).mockResolvedValue({ providers: [] })
    vi.mocked(auth.login).mockResolvedValue()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={['/login']}>
            <AuthPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    )

    await user.type(screen.getByLabelText('อีเมล'), 'student@example.com')
    await user.type(screen.getByLabelText(/รหัสผ่าน/), 'legacy-pass')
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

    expect(auth.login).toHaveBeenCalledWith({
      email: 'student@example.com',
      password: 'legacy-pass'
    })
  })
})
