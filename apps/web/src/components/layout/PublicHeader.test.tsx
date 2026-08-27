import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import { PublicHeader } from './PublicHeader'

describe('PublicHeader', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('th')
  })

  it('links the brand home and presents the get-started CTA', () => {
    render(
      <MemoryRouter>
        <PublicHeader />
      </MemoryRouter>
    )

    for (const brandLink of screen.getAllByRole('link', {
      name: 'KineGuide AI'
    })) {
      expect(brandLink).toHaveAttribute('href', '/')
    }
    expect(
      screen.getByRole('link', { name: 'เริ่มต้นใช้งาน' })
    ).toHaveAttribute('href', '/login')
  })

  it('presents the matching English CTA', async () => {
    await i18n.changeLanguage('en')

    render(
      <MemoryRouter>
        <PublicHeader />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/login'
    )
  })
})
