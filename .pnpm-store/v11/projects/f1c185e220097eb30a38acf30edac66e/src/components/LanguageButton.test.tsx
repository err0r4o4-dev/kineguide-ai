import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import { LanguageButton } from './LanguageButton'

describe('LanguageButton', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('th')
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

  it('changes language without accessing storage, even when storage is denied', async () => {
    const readStorage = vi.spyOn(Storage.prototype, 'getItem')
    const writeStorage = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Storage denied', 'SecurityError')
      })
    const user = userEvent.setup()
    render(<LanguageButton />)

    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(readStorage).not.toHaveBeenCalled()
    expect(writeStorage).not.toHaveBeenCalled()
    expect(i18n.resolvedLanguage).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('keeps the selected language when the selector is mounted on another page', async () => {
    const user = userEvent.setup()
    const firstPage = render(<LanguageButton />)

    await user.click(screen.getByRole('button', { name: 'English' }))
    firstPage.unmount()
    render(<LanguageButton />)

    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(i18n.resolvedLanguage).toBe('en')
  })
})
