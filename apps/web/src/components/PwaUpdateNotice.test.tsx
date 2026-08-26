import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RegisterSWOptions } from 'virtual:pwa-register/react'
import { useRegisterSW } from 'virtual:pwa-register/react'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import { PwaUpdateNotice } from './PwaUpdateNotice'

vi.mock('virtual:pwa-register/react', () => ({ useRegisterSW: vi.fn() }))

let registerOptions: RegisterSWOptions | undefined

function mockPwaState(options: {
  needRefresh?: boolean
  offlineReady?: boolean
  updateServiceWorker?: ReturnType<typeof vi.fn>
}) {
  const updateServiceWorker = options.updateServiceWorker ?? vi.fn()
  const setOfflineReady = vi.fn()

  vi.mocked(useRegisterSW).mockImplementation((hookOptions) => {
    registerOptions = hookOptions
    return {
      needRefresh: [options.needRefresh ?? false, vi.fn()],
      offlineReady: [options.offlineReady ?? false, setOfflineReady],
      updateServiceWorker
    }
  })

  return { setOfflineReady, updateServiceWorker }
}

describe('PwaUpdateNotice', () => {
  beforeEach(async () => {
    registerOptions = undefined
    vi.clearAllMocks()
    await i18n.changeLanguage('th')
  })

  it('offers to load the latest application version in Thai', async () => {
    const user = userEvent.setup()
    const { updateServiceWorker } = mockPwaState({ needRefresh: true })

    render(<PwaUpdateNotice />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'มี KineGuide AI รุ่นใหม่'
    )
    await user.click(screen.getByRole('button', { name: 'อัปเดตตอนนี้' }))

    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('shows a retry action when activating the update fails', async () => {
    const user = userEvent.setup()
    const updateServiceWorker = vi
      .fn()
      .mockRejectedValueOnce(new Error('activation failed'))
      .mockResolvedValueOnce(undefined)
    mockPwaState({ needRefresh: true, updateServiceWorker })

    render(<PwaUpdateNotice />)
    await user.click(screen.getByRole('button', { name: 'อัปเดตตอนนี้' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'อัปเดตไม่สำเร็จ'
    )
    await user.click(screen.getByRole('button', { name: 'ลองอัปเดตอีกครั้ง' }))

    expect(updateServiceWorker).toHaveBeenCalledTimes(2)
  })

  it('announces offline readiness and lets the user dismiss it', async () => {
    const user = userEvent.setup()
    const { setOfflineReady } = mockPwaState({ offlineReady: true })

    render(<PwaUpdateNotice />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'พร้อมใช้งานแบบออฟไลน์'
    )
    await user.click(screen.getByRole('button', { name: 'ปิดข้อความ' }))

    expect(setOfflineReady).toHaveBeenCalledWith(false)
  })

  it('provides the update action in English', async () => {
    await i18n.changeLanguage('en')
    mockPwaState({ needRefresh: true })

    render(<PwaUpdateNotice />)

    expect(screen.getByRole('button', { name: 'Update now' })).toBeVisible()
  })

  it('checks for a newer service worker when a long-lived tab regains focus', () => {
    mockPwaState({})
    const registration = {
      update: vi.fn().mockResolvedValue(undefined)
    } as unknown as ServiceWorkerRegistration

    render(<PwaUpdateNotice />)
    act(() => registerOptions?.onRegisteredSW?.('/sw.js', registration))
    act(() => window.dispatchEvent(new Event('focus')))

    expect(registration.update).toHaveBeenCalled()
  })
})
