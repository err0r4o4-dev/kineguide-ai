import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import { languagePreferenceKey } from '@/lib/languagePreference'
import { LanguageButton } from './LanguageButton'

describe('LanguageButton', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await i18n.changeLanguage('th')
  })

  it('shows Thai and English together in the default selector', () => {
    render(<LanguageButton />)

    const thaiButton = screen.getByRole('button', { name: 'ไทย' })
    const englishButton = screen.getByRole('button', { name: 'English' })

    expect(thaiButton).toHaveTextContent(/^TH$/)
    expect(thaiButton).toHaveAttribute('aria-pressed', 'true')
    expect(englishButton).toHaveTextContent(/^EN$/)
    expect(englishButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('stores the selected language without changing consent data', async () => {
    const user = userEvent.setup()
    render(<LanguageButton />)

    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(window.localStorage.getItem(languagePreferenceKey)).toBe('en')
    expect(i18n.resolvedLanguage).toBe('en')
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})
