import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Brand } from '@/components/Brand'
import { LanguageButton } from '@/components/LanguageButton'

export function PublicHeader() {
  const { t } = useTranslation()
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />
        <nav aria-label={t('nav.public')} className="flex items-center gap-2">
          <a className="hidden px-3 py-2 text-sm sm:block" href="#features">
            {t('landing.features')}
          </a>
          <LanguageButton />
          <Link className="kg-button-primary px-4 py-2" to="/login">
            {t('auth.signIn')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
