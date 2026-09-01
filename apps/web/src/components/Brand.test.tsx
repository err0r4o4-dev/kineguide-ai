import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { Brand } from '@/components/Brand'
import '@/lib/i18n'

describe('Brand', () => {
  it('uses the approved KineGuide logo asset', () => {
    render(
      <MemoryRouter>
        <Brand compact />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('link', { name: 'KineGuide AI' }).querySelector('img')
    ).toHaveAttribute('src', '/logo.svg')
  })
})
