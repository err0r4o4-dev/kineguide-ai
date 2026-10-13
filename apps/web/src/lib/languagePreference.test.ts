import { afterEach, describe, expect, it, vi } from 'vitest'

import { getLanguagePreference } from './languagePreference'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('browser language preference', () => {
  it.each([
    [['th-TH', 'en-US'], 'th'],
    [['en-GB', 'th-TH'], 'en'],
    [['fr-FR', 'th-TH', 'en-US'], 'th'],
    [['TH-th'], 'th'],
    [['de-DE', 'ja-JP'], 'en']
  ] as const)('resolves %j to %s', (languages, expected) => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages)

    expect(getLanguagePreference()).toBe(expected)
  })

  it('uses navigator.language when the preference list is empty', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([])
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('th-TH')

    expect(getLanguagePreference()).toBe('th')
  })

  it('falls back to English when no language is available', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([])
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('')

    expect(getLanguagePreference()).toBe('en')
  })

  it('falls back to English when browser preferences cannot be read', () => {
    vi.spyOn(navigator, 'languages', 'get').mockImplementation(() => {
      throw new Error('Browser preferences unavailable')
    })

    expect(getLanguagePreference()).toBe('en')
  })

  it('does not access storage even when storage is denied', () => {
    const readStorage = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new DOMException('Storage denied', 'SecurityError')
      })
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['th-TH'])

    expect(getLanguagePreference()).toBe('th')
    expect(readStorage).not.toHaveBeenCalled()
  })
})
