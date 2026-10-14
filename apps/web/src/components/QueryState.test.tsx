import { render, screen } from '@testing-library/react'

import '@/lib/i18n'

import { QueryLoading } from './QueryState'

it('renders an accessible in-page loading state', () => {
  render(<QueryLoading />)

  expect(screen.getByRole('status')).toHaveTextContent('กำลังโหลด')
})
