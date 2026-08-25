import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type LanguageButtonProps = {
  variant?: 'toggle' | 'segmented'
}

export function LanguageButton({ variant = 'toggle' }: LanguageButtonProps) {
  const { t, i18n } = useTranslation()
  const activeLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'th'
  const changeLanguage = (language: 'th' | 'en') => {
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
        className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm"
        role="group"
      >
        {(['th', 'en'] as const).map((language) => {
          const isActive = activeLanguage === language
          return (
            <button
              aria-pressed={isActive}
              className={`min-h-11 rounded-[0.65rem] px-3 text-sm font-semibold transition-colors ${
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
      <span>{t('common.language')}</span>
    </button>
  )
}
