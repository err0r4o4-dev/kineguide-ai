import { useTranslation } from 'react-i18next'

import { saveLanguagePreference } from '@/lib/languagePreference'

export function LanguageButton({
  appearance = 'default'
}: {
  appearance?: 'default' | 'public'
}) {
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
      className={`inline-flex shrink-0 border border-slate-200 bg-slate-50 p-1 ${
        appearance === 'public'
          ? 'rounded-2xl shadow-inner shadow-slate-900/[0.03]'
          : 'rounded-xl'
      }`}
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
            className={`min-h-10 px-2.5 text-sm font-semibold transition-colors sm:px-3 ${
              appearance === 'public' ? 'rounded-xl' : 'rounded-lg'
            } ${
              isActive && appearance === 'public'
                ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/70'
                : isActive
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
