import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import * as notification from '@/lib/notification'
import { SettingsPage } from './SettingsPage'

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }))

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ logout: logoutMock })
}))

vi.mock('@/services/product', () => ({
  revokeConsent: vi.fn(),
  deleteAccount: vi.fn(),
  getConsent: vi.fn().mockResolvedValue({
    policy_version: 'prototype-v3',
    accepted_at: '2026-08-28T09:00:00Z'
  })
}))

vi.mock('@/lib/notification', () => ({
  confirmNotification: vi.fn()
}))

function renderRoute() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('SettingsPage', () => {
  it('renders settings sections', async () => {
    await i18n.changeLanguage('th')
    renderRoute()

    expect(screen.getByRole('heading', { name: 'ตั้งค่าและความเป็นส่วนตัว' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'ภาษาและการแสดงผล' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'การตั้งค่ากล้อง' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'การแจ้งเตือนหยุดพัก' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'จัดการ consent' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'ลบบัญชีและข้อมูลทั้งหมด' })).toBeVisible()
  })

  it('handles consent revocation with confirmation', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    vi.mocked(notification.confirmNotification).mockResolvedValue(true)
    renderRoute()

    const revokeBtn = screen.getByRole('button', { name: 'ถอน consent' })
    await user.click(revokeBtn)

    expect(notification.confirmNotification).toHaveBeenCalled()
    expect(product.revokeConsent).toHaveBeenCalled()
  })

  it('handles account deletion with confirmation', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    vi.mocked(notification.confirmNotification).mockResolvedValue(true)
    renderRoute()

    const deleteBtn = screen.getByRole('button', { name: 'ลบบัญชีและข้อมูลทั้งหมด' })
    await user.click(deleteBtn)

    expect(notification.confirmNotification).toHaveBeenCalled()
    expect(product.deleteAccount).toHaveBeenCalled()
    expect(logoutMock).toHaveBeenCalled()
  })
})
