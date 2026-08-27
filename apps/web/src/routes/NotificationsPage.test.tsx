import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { NotificationProvider } from '@/features/notifications/NotificationProvider'
import i18n from '@/lib/i18n'
import { NotificationsPage } from './NotificationsPage'

describe('NotificationsPage', () => {
  it('filters unread items and marks every notification as read', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <NotificationProvider>
          <NotificationsPage />
        </NotificationProvider>
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: 'การแจ้งเตือน', level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'ยังไม่ได้อ่าน 3' })
    ).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: 'ยังไม่ได้อ่าน 3' }))
    expect(screen.getAllByTestId('notification-item')).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: 'อ่านทั้งหมดแล้ว' }))
    expect(screen.getByText('ไม่มีการแจ้งเตือนในหมวดนี้')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'ยังไม่ได้อ่าน 0' })
    ).toBeInTheDocument()
  })

  it('lets the user change each notification preference', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <NotificationProvider>
          <NotificationsPage />
        </NotificationProvider>
      </MemoryRouter>
    )

    const activityToggle = screen.getByRole('switch', {
      name: 'เตือนกิจกรรมประจำวัน'
    })
    expect(activityToggle).toBeChecked()
    await user.click(activityToggle)
    expect(activityToggle).not.toBeChecked()
  })
})
