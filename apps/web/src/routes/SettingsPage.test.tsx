import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import {
  resetSoundAlertPreferencesStoreForTests,
  SOUND_ALERT_STORAGE_KEY
} from '@/features/notifications/soundAlertPreferences'
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
  deleteAuthIdentity: vi.fn(),
  startAuthIdentityLink: vi.fn(),
  getAuthIdentities: vi.fn().mockResolvedValue([]),
  getOAuthProviders: vi.fn().mockResolvedValue({ providers: [] }),
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
  beforeEach(() => {
    window.localStorage.clear()
    resetSoundAlertPreferencesStoreForTests()
  })

  it('persists independent break controls and disables the interval when off', async () => {
    await i18n.changeLanguage('en')
    const user = userEvent.setup()
    renderRoute()
    const interval = screen.getByRole('combobox', {
      name: 'Reminder interval (minutes)'
    })
    await user.selectOptions(interval, '15')
    await user.click(
      screen.getByRole('checkbox', { name: 'Enable break reminders' })
    )
    expect(interval).toBeDisabled()
    expect(
      JSON.parse(window.localStorage.getItem(SOUND_ALERT_STORAGE_KEY)!)
    ).toMatchObject({
      breakRemindersEnabled: false,
      breakIntervalMinutes: 15,
      enabled: true
    })
  })

  it('renders settings sections', async () => {
    await i18n.changeLanguage('th')
    renderRoute()

    expect(
      screen.getByRole('heading', { name: 'ตั้งค่าและความเป็นส่วนตัว' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'ภาษาและการแสดงผล' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'บัญชีที่เชื่อมต่อ' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'จัดการ consent' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'ลบบัญชีและข้อมูลทั้งหมด' })
    ).toBeVisible()
  })

  it('groups sound events and preview in their own named settings section', async () => {
    await i18n.changeLanguage('en')
    renderRoute()

    const events = screen.getByRole('region', {
      name: 'Events with sound alerts'
    })
    expect(within(events).getAllByRole('checkbox')).toHaveLength(4)
    expect(
      within(events).getByRole('button', { name: 'Test sound' })
    ).toBeVisible()
    expect(
      within(
        screen.getByRole('region', { name: 'Sound notifications' })
      ).queryByRole('button', { name: 'Test sound' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Manage consent' })).toBeVisible()
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

    const deleteBtn = screen.getByRole('button', {
      name: 'ลบบัญชีและข้อมูลทั้งหมด'
    })
    await user.click(deleteBtn)

    expect(notification.confirmNotification).toHaveBeenCalled()
    expect(product.deleteAccount).toHaveBeenCalled()
    expect(logoutMock).toHaveBeenCalled()
  })

  it('disconnects an enabled linked identity after confirmation', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()
    vi.mocked(product.getOAuthProviders).mockResolvedValue({
      providers: [{ provider: 'google', enabled: true }]
    })
    vi.mocked(product.getAuthIdentities).mockResolvedValue([
      { provider: 'google', created_at: '2026-08-28T09:00:00Z' }
    ])
    vi.mocked(notification.confirmNotification).mockResolvedValue(true)
    renderRoute()

    await user.click(
      await screen.findByRole('button', {
        name: 'ยกเลิกการเชื่อม Google'
      })
    )

    expect(product.deleteAuthIdentity).toHaveBeenCalledWith('google')
  })

  it('configures sound alert preferences, previews Thai voice even in English UI, and clears preferences on account deletion', async () => {
    await i18n.changeLanguage('en')
    const spokenUtterances: Array<{ text: string; lang: string }> = []
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: vi.fn((utterance: { text: string; lang: string }) => {
          spokenUtterances.push(utterance)
        }),
        cancel: vi.fn(),
        getVoices: () => [{ lang: 'th-TH', name: 'Thai Voice' }]
      }
    })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class FakeUtterance {
        text: string
        lang = ''
        volume = 1
        rate = 1
        pitch = 1
        voice: unknown = null
        onerror: unknown = null
        onend: unknown = null
        constructor(text: string) {
          this.text = text
        }
      }
    })

    const user = userEvent.setup()
    vi.mocked(notification.confirmNotification).mockResolvedValue(true)
    renderRoute()

    expect(
      screen.getByRole('heading', { name: 'Sound notifications' })
    ).toBeVisible()

    // Preview TTS sound -> speaks Thai even though UI is in English
    await user.click(screen.getByRole('button', { name: 'Test sound' }))
    expect(spokenUtterances).toHaveLength(1)
    expect(spokenUtterances[0]?.lang).toBe('th-TH')
    expect(spokenUtterances[0]?.text).toContain('ไคน์ไกด์')

    // Toggle an event checkbox and persist to localStorage
    const framingCheckbox = screen.getByRole('checkbox', {
      name: /Sustained camera framing issue/
    })
    expect(framingCheckbox).toBeChecked()
    await user.click(framingCheckbox)
    expect(framingCheckbox).not.toBeChecked()
    expect(window.localStorage.getItem(SOUND_ALERT_STORAGE_KEY)).toContain(
      '"cameraFraming":false'
    )

    // Deleting account removes stored browser preferences
    await user.click(
      screen.getByRole('button', { name: 'Delete account and all data' })
    )
    expect(product.deleteAccount).toHaveBeenCalled()
    expect(window.localStorage.getItem(SOUND_ALERT_STORAGE_KEY)).toBeNull()
  })
})
