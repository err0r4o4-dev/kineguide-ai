import { render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from './AuthContext'
import { AuthProvider } from './AuthProvider'
import * as http from '@/services/http'
import * as product from '@/services/product'

vi.mock('@/services/http', () => ({ setAccessToken: vi.fn() }))
vi.mock('@/services/product', () => ({
  loginAccount: vi.fn(),
  logoutAccount: vi.fn(),
  refreshAccount: vi.fn(),
  registerAccount: vi.fn()
}))

const user = {
  id: '3356dcec-f826-41f1-8dba-f434b74e75c8',
  email: 'student@example.com',
  display_name: 'ผู้ใช้ทดสอบ',
  created_at: '2026-08-24T12:00:00Z'
}

function AuthProbe() {
  const auth = useAuth()
  return (
    <p>
      {auth.ready ? 'ready' : 'loading'}:{auth.user?.display_name ?? 'guest'}
    </p>
  )
}

describe('AuthProvider bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rotates the refresh session only once under React StrictMode', async () => {
    vi.mocked(product.refreshAccount).mockResolvedValue({
      access_token: 'synthetic-access-token',
      expires_in: 900,
      user
    })

    render(
      <StrictMode>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </StrictMode>
    )

    expect(await screen.findByText('ready:ผู้ใช้ทดสอบ')).toBeInTheDocument()
    expect(product.refreshAccount).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(http.setAccessToken).toHaveBeenLastCalledWith(
        'synthetic-access-token'
      )
    )
  })
})
