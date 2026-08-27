import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import '@/lib/i18n'
import { QueryLoading } from './QueryState'

vi.mock('@/lib/navigation', () => ({
  isBrowserRefresh: () => true
}))

it('does not show the in-app loading page during browser refresh', () => {
  const { container } = render(<QueryLoading />)

  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  expect(container).toBeEmptyDOMElement()
})
