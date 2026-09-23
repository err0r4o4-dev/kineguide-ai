import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { LandingPage } from './LandingPage'

const { userMock } = vi.hoisted(() => ({ userMock: vi.fn() }))

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ ready: true, user: userMock() })
}))

vi.mock('@/lib/navigation', () => ({
  isBrowserRefresh: () => false,
  finishBrowserRefresh: vi.fn()
}))

describe('LandingPage', () => {
  it('highlights privacy and Posture Monitoring capabilities', async () => {
    await i18n.changeLanguage('th')
    userMock.mockReturnValue(null)
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        name: 'ปรับท่าทางการใช้งานหน้าจออย่างมั่นใจ ด้วยผู้ช่วยที่ให้ความสำคัญกับความเป็นส่วน⁠ตัวของคุณ'
      })
    ).toBeInTheDocument()

    expect(screen.getByText('Real-Time Posture Monitoring')).toBeVisible()
    expect(
      screen.getByText(/ติดตามขณะนั่งและตรวจความพร้อมของจุดอ้างอิง/)
    ).toBeVisible()

    expect(
      screen.getByRole('heading', { name: 'กล้องทำงานในอุปกรณ์' })
    ).toBeVisible()

    expect(
      screen.getByRole('heading', {
        name: 'ข้อมูลของคุณ คุณเป็นผู้ควบคุม'
      })
    ).toBeVisible()

    expect(
      screen.getByRole('heading', { name: 'ติดตามขณะนั่งแบบเรียลไทม์' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'สรุปการใช้งานหน้าจอ' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'พูดคุยกับผู้ช่วย AI ภายใต้ข้อจำกัด'
      })
    ).toBeVisible()
  })

  it('routes to registration for anonymous users', async () => {
    await i18n.changeLanguage('th')
    userMock.mockReturnValue(null)
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const cta = screen.getAllByRole('link', { name: 'เริ่มตรวจท่าทาง' })
    expect(cta.length).toBeGreaterThan(0)
    expect(cta[0]).toHaveAttribute('href', '/register')
  })

  it('routes to the application for signed-in users', async () => {
    await i18n.changeLanguage('th')
    userMock.mockReturnValue({ display_name: 'Thirawat Duangta' })
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const cta = screen.getAllByRole('link', { name: 'เริ่มต้นใช้งาน' })
    expect(cta.length).toBeGreaterThan(0)
    expect(cta[0]).toHaveAttribute('href', '/app')
  })
})
