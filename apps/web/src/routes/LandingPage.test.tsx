import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, vi } from 'vitest'

import { Brand } from '@/components/Brand'
import { AuthContext, type AuthContextValue } from '@/features/auth/AuthContext'
import '@/lib/i18n'
import i18n from '@/lib/i18n'
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
  beforeEach(async () => {
    await i18n.changeLanguage('th')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not show the loading page while restoring a session after refresh', () => {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      { type: 'reload' } as PerformanceNavigationTiming
    ])

    const { container } = render(
      <AuthContext.Provider value={{ ...guestAuth, ready: false }}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })

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
    expect(
      screen.getByText(/กล้องจะเริ่มหลังจากคุณเลือกเริ่มใช้งานและให้สิทธิ์/)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'เริ่มใช้งาน' })).toHaveAttribute(
      'href',
      '/register'
    )
  })

  it('presents the complete public journey and safety boundaries', () => {
    render(
      <AuthContext.Provider value={guestAuth}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(
      screen.getByRole('heading', { name: 'เริ่มต้นใช้งานได้ใน 3 ขั้นตอน' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'สิ่งที่คุณทำได้ใน KineGuide AI' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'ข้อมูลของคุณ คุณเป็นผู้ควบคุม' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'ใช้งานอย่างปลอดภัย' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/ไม่วินิจฉัยโรคหรือทดแทนบุคลากรทางการแพทย์/)
    ).toBeInTheDocument()
    expect(screen.getByText(/หยุดใช้งานทันทีหากรู้สึกเจ็บ/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'ดูวิธีการทำงาน' })
    ).toHaveAttribute('href', '#how-it-works')
    expect(
      screen.getByRole('link', {
        name: 'ดูรายละเอียด กล้องทำงานในอุปกรณ์'
      })
    ).toHaveAttribute('href', '#how-it-works')
    expect(
      screen.getByRole('link', {
        name: 'ดูรายละเอียด ควบคุมข้อมูลของคุณ'
      })
    ).toHaveAttribute('href', '#privacy')
    expect(
      screen.getByRole('link', {
        name: 'ดูรายละเอียด ติดตามกิจกรรมแบบไม่กล่าวอ้างทางคลินิก'
      })
    ).toHaveAttribute('href', '#capabilities')
    expect(
      screen.getByRole('link', { name: 'สร้างบัญชีเพื่อเริ่มต้น' })
    ).toHaveAttribute('href', '/register')
  })

  it('provides the same public journey and boundaries in English', async () => {
    await i18n.changeLanguage('en')

    render(
      <AuthContext.Provider value={guestAuth}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(
      screen.getByRole('heading', { name: 'Get started in 3 steps' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'What you can do in KineGuide AI'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Your data stays under your control'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Stop immediately if you feel pain/)
    ).toBeInTheDocument()
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
