export const languagePreferenceKey = 'kineguide-language'

export type SupportedLanguage = 'th' | 'en'

export function getLanguagePreference(): SupportedLanguage | null {
  const language = window.localStorage.getItem(languagePreferenceKey)
  return language === 'th' || language === 'en' ? language : null
}

export function saveLanguagePreference(language: SupportedLanguage) {
  window.localStorage.setItem(languagePreferenceKey, language)
}
