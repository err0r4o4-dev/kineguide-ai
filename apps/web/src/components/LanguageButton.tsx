import { useTranslation } from 'react-i18next'

import { saveLanguagePreference } from '@/lib/languagePreference'

export function LanguageButton() {
  const { t, i18n } = useTranslation()
  const activeLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'th'
  const changeLanguage = (language: 'th' | 'en') => {
    saveLanguagePreference(language)
    void i18n.changeLanguage(language)
    document.documentElement.lang = language
  }
  return (
    <div
      aria-label={t('common.languageSelector')}
      className="inline-flex shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-1"
      role="group"
    >
      {(['th', 'en'] as const).map((language) => {
        const isActive = activeLanguage === language
        return (
          <button
            aria-label={
              language === 'th'
                ? t('common.languageThai')
                : t('common.languageEnglish')
            }
            aria-pressed={isActive}
            className={`min-h-10 rounded-lg px-2.5 text-sm font-semibold transition-colors sm:px-3 ${
              isActive
                ? 'bg-teal-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            key={language}
            onClick={() => changeLanguage(language)}
            type="button"
          >
            {language === 'th' ? 'TH' : 'EN'}
          </button>
        )
      })}
    </div>
  )
}
