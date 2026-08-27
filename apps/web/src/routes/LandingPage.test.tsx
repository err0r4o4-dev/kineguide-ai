import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'

import { Brand } from '@/components/Brand'
import { AuthContext, type AuthContextValue } from '@/features/auth/AuthContext'
import '@/lib/i18n'
import { LandingPage } from './LandingPage'

const guestAuth: AuthContextValue = {
  user: null,
  ready: true,
  async login() {},
  async register() {},
  async logout() {},
  clearSession() {}
}

describe('LandingPage', () => {
  it('explains the camera boundary before sign in', () => {
    render(
      <AuthContext.Provider value={guestAuth}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'สำรวจการเคลื่อนไหวอย่างมั่นใจ ด้วยผู้ช่วยที่ให้ความสำคัญกับความเป็นส่วน\u2060ตัวของคุณ'
    )
    expect(screen.getByText(/ไม่อัปโหลดรูปหรือวิดีโอ/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'เริ่มใช้งาน' })).toHaveAttribute(
      'href',
      '/register'
    )
  })

  it('lets an authenticated visitor use the brand to open the public landing page', async () => {
    const user = userEvent.setup()

    render(
      <AuthContext.Provider
        value={{
          ...guestAuth,
          user: {
            id: '3356dcec-f826-41f1-8dba-f434b74e75c8',
            email: 'student@example.com',
            display_name: 'ผู้ใช้ทดสอบ',
            created_at: '2026-08-24T12:00:00Z'
          }
        }}
      >
        <MemoryRouter initialEntries={['/app']}>
          <Routes>
            <Route element={<LandingPage />} path="/" />
            <Route element={<Brand />} path="/app" />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )

    await user.click(screen.getByRole('link', { name: 'KineGuide AI' }))

    expect(
      await screen.findByRole('heading', {
        name: 'สำรวจการเคลื่อนไหวอย่างมั่นใจ ด้วยผู้ช่วยที่ให้ความสำคัญกับความเป็นส่วน⁠ตัวของคุณ'
      })
    ).toBeInTheDocument()
  })
})
