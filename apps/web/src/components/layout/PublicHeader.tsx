import { CircleUserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Brand } from '@/components/Brand'
import { LanguageButton } from '@/components/LanguageButton'
import { useAuth } from '@/features/auth/AuthContext'

const landingSections = [
  { id: 'landing-home', labelKey: 'landing.navigation.home' },
  { id: 'landing-privacy', labelKey: 'landing.navigation.privacy' },
  { id: 'how-it-works', labelKey: 'landing.navigation.how' },
  { id: 'capabilities', labelKey: 'landing.navigation.capabilities' }
] as const
type LandingSectionId = (typeof landingSections)[number]['id']

export function PublicHeader() {
  const { t } = useTranslation()
  const auth = useAuth()
  const [activeSection, setActiveSection] = useState<LandingSectionId>(
    landingSections[0].id
  )

  useEffect(() => {
    const hashSection = landingSections.find(
      ({ id }) => window.location.hash === `#${id}`
    )
    if (hashSection) setActiveSection(hashSection.id)

    const updateActiveSection = () => {
      const headerOffset = 112
      let nextSection: LandingSectionId = landingSections[0].id

      for (const { id } of landingSections) {
        const section = document.getElementById(id)
        if (!section || section.getBoundingClientRect().top > headerOffset)
          break
        nextSection = id
      }

      setActiveSection(nextSection)
    }

    window.addEventListener('scroll', updateActiveSection, { passive: true })
    return () => window.removeEventListener('scroll', updateActiveSection)
  }, [])

  return (
    <header className="kg-public-header sticky top-0 z-40 border-b border-white/70 bg-white/75 shadow-[0_6px_24px_rgb(15_23_42_/_4%)] backdrop-blur-xl">
      <a
        className="fixed left-4 top-3 z-50 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-teal-800 shadow-lg transition-transform focus:translate-y-0"
        href="#main-content"
      >
        {t('common.skip')}
      </a>
      <div className="kg-public-header-content mx-auto flex min-h-16 flex-wrap items-center justify-between gap-x-3 sm:min-h-[4.375rem] lg:flex-nowrap">
        <span className="sm:hidden">
          <Brand compact prominent />
        </span>
        <span className="hidden sm:inline-flex">
          <Brand prominent />
        </span>
        <nav
          aria-label={t('landing.navigation.label')}
          className="order-3 flex w-full items-center gap-1 overflow-x-auto lg:order-none lg:w-auto"
        >
          {landingSections.map(({ id, labelKey }) => {
            const isActive = activeSection === id
            return (
              <a
                aria-current={isActive ? 'location' : undefined}
                className="relative inline-flex min-h-11 shrink-0 items-center px-3 font-medium text-slate-500 no-underline transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-teal-700 after:transition-transform hover:text-slate-900 focus-visible:text-slate-950 aria-[current=location]:font-semibold aria-[current=location]:text-teal-800 aria-[current=location]:after:scale-x-100"
                href={`#${id}`}
                key={id}
                onClick={() => setActiveSection(id)}
              >
                {t(labelKey)}
              </a>
            )
          })}
        </nav>
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
