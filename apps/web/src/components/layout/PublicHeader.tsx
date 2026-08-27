import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Brand } from '@/components/Brand'
import { LanguageButton } from '@/components/LanguageButton'
import { useAuth } from '@/features/auth/AuthContext'

export function PublicHeader() {
  const { t } = useTranslation()
  const auth = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <span className="sm:hidden">
          <Brand compact />
        </span>
        <span className="hidden sm:inline-flex">
          <Brand />
        </span>
        <nav aria-label={t('nav.public')} className="flex items-center gap-2">
          <a
            className="hidden min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950 sm:inline-flex"
            href="#features"
          >
            {t('landing.features')}
          </a>
          <LanguageButton compactOnMobile />
          <Link
            className="kg-button-primary h-11 whitespace-nowrap px-3 sm:px-4"
            to={auth.user ? '/app' : '/login'}
          >
            {t(auth.user ? 'nav.getStarted' : 'auth.signIn')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
