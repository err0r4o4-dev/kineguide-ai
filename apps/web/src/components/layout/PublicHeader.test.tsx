import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { AuthContext, type AuthContextValue } from '@/features/auth/AuthContext'
import '@/lib/i18n'
import i18n from '@/lib/i18n'
import { PublicHeader } from './PublicHeader'

const guestAuth: AuthContextValue = {
  user: null,
  ready: true,
  async login() {},
  async register() {},
  async logout() {},
  clearSession() {}
}

function renderHeader(auth: AuthContextValue = guestAuth) {
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <PublicHeader />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('PublicHeader', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('th')
  })

  it('links the brand home and presents sign in to a guest', () => {
    renderHeader()

    expect(
      screen.getByRole('link', { name: 'ข้ามไปยังเนื้อหาหลัก' })
    ).toHaveAttribute('href', '#main-content')
    for (const brandLink of screen.getAllByRole('link', {
      name: 'KineGuide AI'
    })) {
      expect(brandLink).toHaveAttribute('href', '/')
    }
    expect(screen.getByRole('link', { name: 'เข้าสู่ระบบ' })).toHaveAttribute(
      'href',
      '/login'
    )
    expect(
      screen.queryByRole('link', { name: 'คุณสมบัติ' })
    ).not.toBeInTheDocument()
  })

  it('presents the app CTA to an authenticated user', () => {
    renderHeader({
      ...guestAuth,
      user: {
        id: '3356dcec-f826-41f1-8dba-f434b74e75c8',
        email: 'student@example.com',
        display_name: 'ผู้ใช้ทดสอบ',
        created_at: '2026-08-24T12:00:00Z'
      }
    })

    expect(
      screen.getByRole('link', { name: 'เริ่มต้นใช้งาน' })
    ).toHaveAttribute('href', '/app')
  })

  it('presents the matching English guest CTA', async () => {
    await i18n.changeLanguage('en')

    renderHeader()

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login'
    )
  })
})
