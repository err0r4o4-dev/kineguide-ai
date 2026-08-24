import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function LanguageButton() {
  const { t, i18n } = useTranslation()
  const toggle = () => {
    const language = i18n.resolvedLanguage === 'th' ? 'en' : 'th'
    void i18n.changeLanguage(language)
    document.documentElement.lang = language
  }
  return (
    <button className="kg-icon-button" onClick={toggle} type="button">
      <Languages aria-hidden="true" size={19} />
      <span>{t('common.language')}</span>
    </button>
  )
}
