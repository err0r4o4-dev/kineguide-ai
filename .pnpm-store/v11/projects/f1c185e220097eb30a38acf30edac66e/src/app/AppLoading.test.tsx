import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import '@/lib/i18n'
import { AppLoading } from './App'

const { finishRouteRefresh } = vi.hoisted(() => ({
  finishRouteRefresh: vi.fn()
}))

vi.mock('@/lib/navigation', () => ({
  finishRouteRefresh,
  isBrowserRefresh: () => true,
  isRouteRefresh: () => true
}))

it('keeps the lazy route loading fallback hidden until refresh completes', () => {
  const { container, unmount } = render(<AppLoading />)

  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  expect(container).toBeEmptyDOMElement()

  unmount()
  expect(finishRouteRefresh).toHaveBeenCalledOnce()
})
