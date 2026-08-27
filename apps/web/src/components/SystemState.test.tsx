import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import '@/lib/i18n'
import { SystemError, SystemLoading } from './SystemState'

it('describes login preparation with progress and steps', async () => {
  render(<SystemLoading progress={68} />)
  await waitFor(() =>
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '68'
    )
  )
  expect(screen.getByRole('status')).toHaveTextContent(
    'กำลังเตรียม KineGuide AI'
  )
  expect(screen.getByText('เตรียมแผนกิจกรรม')).toBeInTheDocument()
})

it('offers retry and home actions after data loading fails', async () => {
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
