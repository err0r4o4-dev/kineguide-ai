import { CircleUserRound } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Brand } from '@/components/Brand'
import { LanguageButton } from '@/components/LanguageButton'
import { useAuth } from '@/features/auth/AuthContext'

export function PublicHeader() {
  const { t } = useTranslation()
  const auth = useAuth()
  return (
    <header className="kg-public-header sticky top-0 z-40 border-b border-white/70 bg-white/75 shadow-[0_6px_24px_rgb(15_23_42_/_4%)] backdrop-blur-xl">
      <a
        className="fixed left-4 top-3 z-50 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-teal-800 shadow-lg transition-transform focus:translate-y-0"
        href="#main-content"
      >
        {t('common.skip')}
      </a>
      <div className="mx-auto flex min-h-16 w-4/5 items-center justify-between gap-3 sm:min-h-[4.375rem]">
        <span className="sm:hidden">
          <Brand compact prominent />
        </span>
        <span className="hidden sm:inline-flex">
          <Brand prominent />
        </span>
        <nav aria-label={t('nav.public')} className="flex items-center gap-2">
          <LanguageButton appearance="public" />
          <Link
            aria-label={t('nav.getStarted')}
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-teal-800 bg-teal-700 px-3 font-semibold text-white no-underline shadow-[0_8px_20px_rgb(15_118_110_/_22%)] transition-colors hover:bg-teal-800 sm:px-4"
            to={auth.user ? '/app' : '/register'}
          >
            <CircleUserRound aria-hidden="true" size={19} />
            <span className="hidden sm:inline">{t('nav.getStarted')}</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
