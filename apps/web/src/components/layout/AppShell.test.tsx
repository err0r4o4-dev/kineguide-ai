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

  it('keeps exactly five primary destinations and puts account pages in the account menu', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route element={<AppShell />} path="/app">
            <Route index element={<h1>หน้าแรก</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const navigation = screen.getByRole('navigation', { name: 'เมนูหลัก' })
    expect(within(navigation).getAllByRole('link')).toHaveLength(5)
    expect(
      within(navigation).getByRole('link', { name: 'หน้าแรก' })
    ).toBeInTheDocument()
    expect(
      within(navigation).getByRole('link', { name: 'ผู้ช่วย AI' })
    ).toBeInTheDocument()
    expect(
      within(navigation).queryByRole('link', { name: 'โปรไฟล์' })
    ).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /^เมนูบัญชี/ })[0])
    expect(
      screen.getByRole('menuitem', { name: 'โปรไฟล์' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'ตั้งค่าและความเป็นส่วนตัว' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', {
        name: 'การแจ้งเตือน 3 รายการยังไม่ได้อ่าน'
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

  it('shows the unread notification count on the account menu button', async () => {
    await i18n.changeLanguage('th')
    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route element={<AppShell />} path="/app">
            <Route index element={<h1>หน้าแรก</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(
      screen.getAllByRole('button', {
        name: 'เมนูบัญชี มีการแจ้งเตือนที่ยังไม่ได้อ่าน 3 รายการ'
      })[0]
    ).toHaveTextContent('3')
  })

  it('uses one menu toggle and dismisses the mobile navigation with Escape', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route element={<AppShell />} path="/app">
            <Route index element={<h1>หน้าแรก</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const menuButton = screen.getByRole('button', { name: 'เปิดเมนู' })
    await user.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('button', { name: 'ปิดเมนู' })).toHaveLength(1)

    await user.keyboard('{Escape}')

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton).toHaveFocus()
  })
})
