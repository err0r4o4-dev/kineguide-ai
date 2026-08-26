import {
  BarChart3,
  CalendarDays,
  Home,
  MessageCircle,
  Menu,
  Video
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'

import { Brand } from '@/components/Brand'
import { LanguageButton } from '@/components/LanguageButton'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'

const links = [
  { to: '/app', key: 'home', icon: Home, end: true },
  { to: '/app/chat', key: 'chat', icon: MessageCircle, end: false },
  { to: '/app/plan', key: 'plan', icon: CalendarDays, end: false },
  { to: '/app/camera', key: 'camera', icon: Video, end: false },
  { to: '/app/progress', key: 'progress', icon: BarChart3, end: false }
] as const

export function AppShell() {
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      menuButtonRef.current?.focus()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const closeMenuAndRestoreFocus = () => {
    setOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-[#f5f8f8] lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Brand compact />
        <div className="flex items-center gap-2">
          <LanguageButton />
          <button
            aria-controls="app-navigation"
            aria-expanded={open}
            aria-label={t(open ? 'nav.closeMenu' : 'nav.menu')}
            className="kg-icon-button"
            onClick={() => setOpen((value) => !value)}
            ref={menuButtonRef}
            type="button"
          >
            <Menu aria-hidden="true" size={21} />
          </button>
        </div>
      </header>

      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-x-0 bottom-0 top-16 z-30 bg-slate-950/30 lg:hidden"
          onClick={closeMenuAndRestoreFocus}
        />
      )}

      <aside
        id="app-navigation"
        className={`fixed bottom-0 left-0 top-16 z-40 flex w-[272px] flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 py-5 transition-transform sm:px-5 lg:sticky lg:inset-y-0 lg:h-screen lg:translate-x-0 lg:px-6 lg:py-7 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="hidden lg:block">
          <Brand />
        </div>
        <nav aria-label={t('nav.main')} className="space-y-1.5 lg:mt-9">
          {links.map(({ to, key, icon: Icon, end }) => (
            <NavLink
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3.5 rounded-xl px-4 text-sm font-semibold no-underline transition-colors ${isActive ? 'bg-teal-50 text-teal-900 ring-1 ring-inset ring-teal-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
              }
              end={end}
              key={to}
              onClick={() => setOpen(false)}
              to={to}
            >
              <Icon aria-hidden="true" className="shrink-0" size={21} />
              <span className="leading-5">{t(`nav.${key}`)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-200 pt-5">
          <UserAccountMenu />
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-7 lg:px-8 lg:py-8">
        <a className="sr-only focus:not-sr-only" href="#page-content">
          {t('common.skip')}
        </a>
        <div className="mx-auto max-w-7xl" id="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
