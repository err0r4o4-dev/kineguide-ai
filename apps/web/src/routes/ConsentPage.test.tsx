import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { ConsentPage } from './ConsentPage'

vi.mock('@/services/product', () => ({
  saveConsent: vi.fn()
}))

describe('ConsentPage language selector', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('th')
  })

  it('changes all consent copy to English without resetting selected consent', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ConsentPage />
      </MemoryRouter>
    )

    const requiredConsent = screen.getByRole('checkbox', {
      name: /ยอมรับการประมวลผลกล้อง/
    })
    await user.click(requiredConsent)
    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Camera and activity-data consent'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', {
        name: /Allow camera processing and session-summary storage/
      })
    ).toBeChecked()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(vi.mocked(product.saveConsent)).not.toHaveBeenCalled()
  })
})
