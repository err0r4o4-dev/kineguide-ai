export type SupportedLanguage = 'th' | 'en'

export function getLanguagePreference(): SupportedLanguage {
  try {
    const languages = navigator.languages
    const preferences = languages?.length ? languages : [navigator.language]

    for (const preference of preferences) {
      const language = preference.toLowerCase().split('-')[0]
      if (language === 'th' || language === 'en') return language
    }
  } catch {
    return 'en'
  }

  return 'en'
}
