import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { NotificationsPage } from './NotificationsPage'

const { markAllReadMock } = vi.hoisted(() => ({
  markAllReadMock: vi.fn()
}))

vi.mock('@/features/notifications/NotificationContext', () => ({
  useNotifications: () => ({
    unreadCount: 1,
    markAllRead: markAllReadMock
  })
}))

describe('NotificationsPage', () => {
  it('renders posture notification items and filters', async () => {
    await i18n.changeLanguage('th')
    markAllReadMock.mockClear()
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'การแจ้งเตือน' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'อ่านทั้งหมดแล้ว' }))
    expect(markAllReadMock).toHaveBeenCalledOnce()

    // Default 'all' filter shows activity and system
    expect(screen.getByText('ข้อเสนอแนะในการปรับท่าทาง')).toBeVisible()
    expect(screen.getByText('ตรวจสอบสิทธิ์การใช้กล้อง')).toBeVisible()

    // Test activity filter
    const activityFilter = screen.getByRole('button', { name: 'กิจกรรม' })
    await user.click(activityFilter)
    expect(activityFilter).toHaveClass('bg-teal-800')
    expect(screen.getByText('ข้อเสนอแนะในการปรับท่าทาง')).toBeVisible()
    expect(
      screen.queryByText('ตรวจสอบสิทธิ์การใช้กล้อง')
    ).not.toBeInTheDocument()

    // Test system filter
    const systemFilter = screen.getByRole('button', { name: 'ระบบ' })
    await user.click(systemFilter)
    expect(
      screen.queryByText('ข้อเสนอแนะในการปรับท่าทาง')
    ).not.toBeInTheDocument()
    expect(screen.getByText('ตรวจสอบสิทธิ์การใช้กล้อง')).toBeVisible()
  })
})
