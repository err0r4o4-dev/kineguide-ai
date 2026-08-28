import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { NotificationProvider } from '@/features/notifications/NotificationProvider'
import i18n from '@/lib/i18n'
import { NotificationsPage } from './NotificationsPage'

describe('NotificationsPage', () => {
  it('shows a truthful empty state instead of fabricated runtime events', async () => {
    await i18n.changeLanguage('th')
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
      screen.getByRole('button', { name: 'ยังไม่ได้อ่าน 0' })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByTestId('notification-item')).not.toBeInTheDocument()
    expect(screen.getByText('ยังไม่มีการแจ้งเตือนจริง')).toBeInTheDocument()
    expect(
      screen.getByText(/ระบบจะไม่สร้างเหตุการณ์ตัวอย่างแทนข้อมูลจริง/)
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'อ่านทั้งหมดแล้ว' })
    ).toBeDisabled()
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
