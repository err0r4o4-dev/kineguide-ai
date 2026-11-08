import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { SystemError, SystemLoading } from './SystemState'

it('starts at zero and reaches 100 only when loading is complete', async () => {
  const view = render(<SystemLoading />)
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  view.rerender(<SystemLoading complete />)
  await waitFor(() =>
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100'
    )
  )
  expect(screen.getByRole('status')).toHaveTextContent(
    'กำลังเตรียม KineGuide AI'
  )
  expect(screen.getByText('เตรียมระบบติดตามการนั่ง')).toBeInTheDocument()
})

it.each(['th', 'en'])(
  'shows pending feedback and allows retry after rejection in %s',
  async (language) => {
    await i18n.changeLanguage(language)
    let rejectRetry: (error: Error) => void = () => undefined
    const retry = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectRetry = reject
        })
    )
    const user = userEvent.setup()
    render(<SystemError retry={retry} />, { wrapper: MemoryRouter })
    await user.click(
      screen.getByRole('button', { name: i18n.t('common.retry') })
    )
    const pending = screen.getByRole('button', {
      name: i18n.t('common.loading')
    })
    expect(pending).toBeDisabled()
    expect(pending).toHaveAttribute('aria-busy', 'true')
    await user.click(pending)
    expect(retry).toHaveBeenCalledOnce()
    rejectRetry(new Error('Synthetic unavailable response'))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: i18n.t('common.retry') })
      ).toBeEnabled()
    )
  }
)

it('offers retry and home actions after data loading fails', async () => {
  await i18n.changeLanguage('th')
  const retry = vi.fn()
  const user = userEvent.setup()
  render(<SystemError retry={retry} />, { wrapper: MemoryRouter })
  await user.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }))
  expect(retry).toHaveBeenCalledOnce()
  expect(screen.getByRole('link', { name: 'กลับหน้าหลัก' })).toHaveAttribute(
    'href',
    '/'
  )
})
