import {
  BarChart3,
  CircleHelp,
  ClipboardList,
  Dumbbell,
  History,
  Home,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router'

import { Brand } from '@/components/Brand'
import { LanguageButton } from '@/components/LanguageButton'
import { useAuth } from '@/features/auth/AuthContext'

const links = [
  { to: '/app', key: 'home', icon: Home, end: true },
  { to: '/app/assessment', key: 'assessment', icon: ClipboardList, end: false },
  { to: '/app/exercises', key: 'exercises', icon: Dumbbell, end: false },
  { to: '/app/history', key: 'history', icon: History, end: false },
  { to: '/app/progress', key: 'progress', icon: BarChart3, end: false },
  { to: '/app/profile', key: 'profile', icon: UserRound, end: false },
  { to: '/app/settings', key: 'settings', icon: Settings, end: false },
  { to: '/app/help', key: 'help', icon: CircleHelp, end: false }
] as const

export function AppShell() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const logout = async () => {
    await auth.logout()
    navigate('/')
  }
  return (
    <div className="min-h-screen bg-[#f8f7ff] lg:grid lg:grid-cols-[280px_1fr]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Brand compact />
        <div className="flex items-center gap-2">
          <LanguageButton />
          <button
            aria-expanded={open}
            aria-label={t('nav.menu')}
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
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-slate-200 bg-white p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Brand />
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
        <div className="mt-auto border-t border-slate-200 pt-5">
          <p className="mb-3 truncate px-3 text-sm text-slate-500">
            {auth.user?.display_name}
          </p>
          <button
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-medium text-red-700 hover:bg-red-50"
            onClick={() => void logout()}
            type="button"
          >
            <LogOut aria-hidden="true" size={20} />
            {t('auth.signOut')}
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-7 lg:px-10 lg:py-8">
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
