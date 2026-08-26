import {
  BarChart3,
  CalendarDays,
  Home,
  MessageCircle,
  Menu,
  Video,
  X
} from 'lucide-react'
import { useState } from 'react'
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
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-[#f5f8f8] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Brand compact />
        <div className="flex items-center gap-2">
          <LanguageButton />
          <button
            aria-controls="app-navigation"
            aria-expanded={open}
            aria-label={t(open ? 'nav.closeMenu' : 'nav.menu')}
            className="kg-icon-button"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>

      {open && (
        <button
          aria-label={t('nav.closeMenu')}
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      )}

      <aside
        id="app-navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col overflow-y-auto border-r border-slate-200 bg-white p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-start justify-between gap-3">
          <Brand />
          <button
            aria-label={t('nav.closeMenu')}
            className="kg-icon-button shrink-0 lg:hidden"
            onClick={() => setOpen(false)}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <nav aria-label={t('nav.main')} className="mt-10 space-y-1">
          {links.map(({ to, key, icon: Icon, end }) => (
            <NavLink
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium no-underline ${isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`
              }
              end={end}
              key={to}
              onClick={() => setOpen(false)}
              to={to}
            >
              <Icon aria-hidden="true" size={20} />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-5 lg:hidden">
          <UserAccountMenu />
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 pb-24 sm:px-7 lg:px-10 lg:py-8 lg:pb-24">
        <a className="sr-only focus:not-sr-only" href="#page-content">
          {t('common.skip')}
        </a>
        <div className="mx-auto max-w-7xl" id="page-content">
          <Outlet />
        </div>
      </main>
      <div className="fixed bottom-5 right-5 z-20 hidden w-60 lg:block">
        <UserAccountMenu />
      </div>
    </div>
  )
}
