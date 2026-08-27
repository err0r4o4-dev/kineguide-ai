import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import { AuthContext, type AuthContextValue } from '@/features/auth/AuthContext'
import '@/lib/i18n'
import { showError } from '@/lib/notification'
import { AuthCallbackPage } from './AuthCallbackPage'

vi.mock('@/lib/notification', () => ({ showError: vi.fn() }))

const auth: AuthContextValue = {
  user: null,
  ready: true,
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
  clearSession: () => undefined
}

describe('AuthCallbackPage', () => {
  it('uses the single shared loading screen while OAuth is pending', () => {
    render(
      <AuthContext.Provider value={{ ...auth, ready: false }}>
        <MemoryRouter initialEntries={['/auth/callback?provider=google']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0'
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'กำลังเตรียม KineGuide AI'
    )
  })

  it('returns callback failures to login and uses the shared notification', async () => {
    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter
          initialEntries={[
            '/auth/callback?provider=google&error=account_link_required'
          ]}
        >
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/login" element={<h1>หน้าเข้าสู่ระบบ</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(
      await screen.findByRole('heading', { name: 'หน้าเข้าสู่ระบบ' })
    ).toBeInTheDocument()
    expect(showError).toHaveBeenCalledWith(
      'อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านแล้วเชื่อมบัญชีจากหน้าตั้งค่า',
      'ปิด'
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
