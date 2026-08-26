import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { saveLanguagePreference } from '@/lib/languagePreference'

type LanguageButtonProps = {
  variant?: 'toggle' | 'segmented'
  compactOnMobile?: boolean
}

export function LanguageButton({
  variant = 'toggle',
  compactOnMobile = false
}: LanguageButtonProps) {
  const { t, i18n } = useTranslation()
  const activeLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'th'
  const changeLanguage = (language: 'th' | 'en') => {
    saveLanguagePreference(language)
    void i18n.changeLanguage(language)
    document.documentElement.lang = language
  }
  const toggle = () => {
    changeLanguage(activeLanguage === 'th' ? 'en' : 'th')
  }

  if (variant === 'segmented') {
    return (
      <div
        aria-label={t('common.languageSelector')}
        className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"
        role="group"
      >
        {(['th', 'en'] as const).map((language) => {
          const isActive = activeLanguage === language
          return (
            <button
              aria-pressed={isActive}
              className={`min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              key={language}
              onClick={() => changeLanguage(language)}
              type="button"
            >
              {language === 'th'
                ? t('common.languageThai')
                : t('common.languageEnglish')}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <button className="kg-icon-button" onClick={toggle} type="button">
      <Languages aria-hidden="true" size={19} />
      <span className={compactOnMobile ? 'sr-only sm:not-sr-only' : undefined}>
        {t('common.language')}
      </span>
    </button>
  )
}
