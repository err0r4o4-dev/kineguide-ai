import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import { QueryError } from '@/components/QueryState'
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

  it('keeps exactly four MVP destinations and puts deferred features outside primary navigation', async () => {
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
    expect(within(navigation).getAllByRole('link')).toHaveLength(4)
    expect(
      within(navigation).getByRole('link', { name: 'หน้าแรก' })
    ).toBeInTheDocument()
    expect(
      within(navigation).getByRole('link', { name: 'กิจกรรมท่าทาง' })
    ).toBeInTheDocument()
    expect(
      within(navigation).getByRole('link', { name: 'ประวัติ' })
    ).toBeInTheDocument()
    expect(
      within(navigation).getByRole('link', { name: 'ตั้งค่า' })
    ).toBeInTheDocument()
    expect(
      within(navigation).queryByRole('link', { name: 'ผู้ช่วย AI' })
    ).not.toBeInTheDocument()
    expect(
      within(navigation).queryByRole('link', { name: 'แผนกิจกรรม' })
    ).not.toBeInTheDocument()
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

  it('does not claim unread notifications when no event source is connected', async () => {
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

    const accountButton = screen.getAllByRole('button', {
      name: 'เมนูบัญชี'
    })[0]

    expect(accountButton).not.toHaveTextContent('3')
    expect(
      within(accountButton).getByTestId('account-notification-bell')
    ).toBeInTheDocument()
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

  it('replaces the entire shell when route data cannot be loaded', async () => {
    await i18n.changeLanguage('th')
    const retry = vi.fn()
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route element={<AppShell />} path="/app">
            <Route
              index
              element={
                <>
                  <h1>เนื้อหาหน้าหลักเดิม</h1>
                  <QueryError retry={retry} />
                </>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('heading', { name: 'ไม่สามารถโหลดข้อมูลได้' })
    ).toBeVisible()
    expect(
      screen.queryByRole('navigation', { name: 'เมนูหลัก' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^เมนูบัญชี/ })
    ).not.toBeInTheDocument()
    expect(screen.getByText('เนื้อหาหน้าหลักเดิม')).not.toBeVisible()

    await user.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }))
    expect(retry).toHaveBeenCalledOnce()
    expect(screen.getByRole('link', { name: 'กลับหน้าหลัก' })).toHaveAttribute(
      'href',
      '/'
    )
  })
})
