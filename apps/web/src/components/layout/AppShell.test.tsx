import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { AppShell } from './AppShell'

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }))

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { display_name: 'Thirawat Duangta' },
    logout: logoutMock
  })
}))

describe('AppShell', () => {
  it('requires confirmation before signing out', async () => {
    await i18n.changeLanguage('th')
    logoutMock.mockClear()
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route element={<AppShell />} path="/app">
            <Route index element={<h1>หน้าแรก</h1>} />
          </Route>
          <Route element={<h1>หน้าสาธารณะ</h1>} path="/" />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getAllByRole('button', { name: /^เมนูบัญชี/ })[0])
    await user.click(screen.getByRole('menuitem', { name: 'ออกจากระบบ' }))
    await screen.findByRole('dialog', { name: 'ออกจากระบบ' })
    await user.click(screen.getByRole('button', { name: 'ยกเลิก' }))
    expect(logoutMock).not.toHaveBeenCalled()

    await user.click(screen.getAllByRole('button', { name: /^เมนูบัญชี/ })[0])
    await user.click(screen.getByRole('menuitem', { name: 'ออกจากระบบ' }))
    await user.click(screen.getByRole('button', { name: 'ออกจากระบบ' }))
    expect(logoutMock).toHaveBeenCalledTimes(1)
  })

  it('includes the KineGuide AI assistant in primary navigation', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/app/chat']}>
        <Routes>
          <Route element={<AppShell />} path="/app">
            <Route index element={<h1>หน้าแรก</h1>} />
            <Route element={<h1>ผู้ช่วย KineGuide AI</h1>} path="chat" />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const navigation = screen.getByRole('navigation', { name: 'เมนูหลัก' })
    const navLinks = within(navigation).getAllByRole('link')
    expect(navLinks).toHaveLength(6)
    expect(navLinks.map((link) => link.textContent)).toEqual([
      'หน้าแรก',
      'ตรวจท่าทาง',
      'ประวัติและสถิติ',
      'ผู้ช่วย KineGuide AI',
      'คู่มือการใช้งาน',
      'ตั้งค่า'
    ])
    expect(
      within(navigation).getByRole('link', { name: 'หน้าแรก' })
    ).toBeInTheDocument()
    const assistantLink = within(navigation).getByRole('link', {
      name: 'ผู้ช่วย KineGuide AI'
    })
    expect(assistantLink).toHaveAttribute('href', '/app/chat')
    expect(assistantLink).toHaveAttribute('aria-current', 'page')
    expect(
      within(navigation).getByRole('link', { name: 'ตรวจท่าทาง' })
    ).toHaveAttribute('href', '/app/monitor')
    expect(
      within(navigation).getByRole('link', { name: 'ประวัติและสถิติ' })
    ).toHaveAttribute('href', '/app/history')
    expect(
      within(navigation).getByRole('link', { name: 'คู่มือการใช้งาน' })
    ).toHaveAttribute('href', '/app/help')
    expect(
      within(navigation).getByRole('link', { name: 'ตั้งค่า' })
    ).toHaveAttribute('href', '/app/settings')

    await user.click(screen.getAllByRole('button', { name: /^เมนูบัญชี/ })[0])
    expect(
      screen.getByRole('menuitem', { name: 'โปรไฟล์' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'ตั้งค่าและความเป็นส่วนตัว' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', {
        name: 'การแจ้งเตือน 0 รายการยังไม่ได้อ่าน'
      })
    ).toHaveAttribute('href', '/app/notifications')
    expect(
      screen.getByRole('menuitem', { name: 'ช่วยเหลือ' })
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('menuitem', { name: 'โปรไฟล์' })
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /^เมนูบัญชี/ })[0]
    ).toHaveFocus()
  })

  it('identifies the active destination in the account menu', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/app/settings']}>
        <Routes>
          <Route element={<AppShell />} path="/app">
            <Route element={<h1>การตั้งค่า</h1>} path="settings" />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getAllByRole('button', { name: /^เมนูบัญชี/ })[0])

    expect(
      screen.getByRole('menuitem', { name: 'ตั้งค่าและความเป็นส่วนตัว' })
    ).toHaveAttribute('aria-current', 'page')
  })

  it('marks the unified History & Analytics nav link active on both /app/history and /app/analytics', async () => {
    await i18n.changeLanguage('th')
    const { unmount } = render(
      <MemoryRouter initialEntries={['/app/analytics']}>
        <Routes>
          <Route element={<AppShell />} path="/app">
            <Route element={<h1>สถิติ</h1>} path="analytics" />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const navigation = screen.getByRole('navigation', { name: 'เมนูหลัก' })
    expect(
      within(navigation).getByRole('link', { name: 'ประวัติและสถิติ' })
    ).toHaveAttribute('aria-current', 'page')
    unmount()
  })
})
