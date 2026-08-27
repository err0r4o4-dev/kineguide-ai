import { render, screen } from '@testing-library/react'

import { QueryLoading } from './QueryState'

it('does not render an in-app query loading screen', () => {
  const { container } = render(<QueryLoading />)

  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  expect(container).toBeEmptyDOMElement()
})
