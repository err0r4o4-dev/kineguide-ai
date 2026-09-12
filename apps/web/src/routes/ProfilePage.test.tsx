import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { ProfilePage } from './ProfilePage'

const { userMock } = vi.hoisted(() => ({ userMock: vi.fn() }))

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: userMock() })
}))

describe('ProfilePage', () => {
  it('renders account info and links', async () => {
    await i18n.changeLanguage('th')
    userMock.mockReturnValue({
      display_name: 'Thirawat Duangta',
      email: 'test@example.com',
      created_at: '2026-08-01T00:00:00Z'
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'โปรไฟล์' })).toBeVisible()
    expect(screen.getByText('Thirawat Duangta')).toBeVisible()
    expect(screen.getByText('test@example.com')).toBeVisible()
    expect(screen.getByText('1 สิงหาคม 2569')).toBeVisible()

    expect(screen.getByRole('link', { name: /ตั้งค่าและความเป็นส่วนตัว/ })).toHaveAttribute(
      'href',
      '/app/settings'
    )
    expect(screen.getByRole('link', { name: /ปรับเทียบท่าทาง/ })).toHaveAttribute(
      'href',
      '/app/monitor/calibration'
    )
  })
})
