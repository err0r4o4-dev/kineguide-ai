import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { AuthContext, type AuthContextValue } from '@/features/auth/AuthContext'
import '@/lib/i18n'
import { AuthCallbackPage } from './AuthCallbackPage'

const auth: AuthContextValue = {
  user: null,
  ready: true,
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
  clearSession: () => undefined
}

describe('AuthCallbackPage', () => {
  it('shows an actionable message when an existing account must be linked', () => {
    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter
          initialEntries={[
            '/auth/callback?provider=google&error=account_link_required'
          ]}
        >
          <AuthCallbackPage />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'กรุณาเข้าสู่ระบบด้วยรหัสผ่านแล้วเชื่อมบัญชีจากหน้าตั้งค่า'
    )
    expect(
      screen.getByRole('link', { name: 'กลับไปหน้าเข้าสู่ระบบ' })
    ).toHaveAttribute('href', '/login')
  })
})
