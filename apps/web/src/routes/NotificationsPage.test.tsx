import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { NotificationsPage } from './NotificationsPage'

vi.mock('@/features/notifications/NotificationContext', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    markAllRead: vi.fn(),
    markRead: vi.fn()
  })
}))

describe('NotificationsPage', () => {
  it('shows an honest empty state without synthetic notifications', async () => {
    await i18n.changeLanguage('th')

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'การแจ้งเตือน' })).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'ยังไม่มีการแจ้งเตือนจริง' })
    ).toBeVisible()
    expect(
      screen.getByText(/ระบบจะไม่สร้างเหตุการณ์ตัวอย่างแทนข้อมูลจริง/)
    ).toBeVisible()
    expect(
      screen.queryByText('ข้อเสนอแนะในการปรับท่าทาง')
    ).not.toBeInTheDocument()
  })
})
