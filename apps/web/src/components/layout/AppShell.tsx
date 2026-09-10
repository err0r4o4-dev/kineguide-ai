import {
  Activity,
  BarChart3,
  CalendarDays,
  Home,
  MessageCircle,
  Menu
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'

import { Brand } from '@/components/Brand'
import { LanguageButton } from '@/components/LanguageButton'
import {
  AppShellErrorContext,
  type AppShellPageError
} from '@/components/layout/AppShellErrorContext'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'
import { SystemError } from '@/components/SystemState'
import { NotificationProvider } from '@/features/notifications/NotificationProvider'

const links = [
  { to: '/app', key: 'home', icon: Home, end: true },
  { to: '/app/chat', key: 'chat', icon: MessageCircle, end: false },
  { to: '/app/plan', key: 'plan', icon: CalendarDays, end: false },
  { to: '/app/activities', key: 'exercises', icon: Activity, end: false },
  { to: '/app/progress', key: 'progress', icon: BarChart3, end: false }
] as const

export function AppShell() {
  const [open, setOpen] = useState(false)
  const [pageError, setPageError] = useState<AppShellPageError | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()
  const errorContext = useMemo(
    () => ({
      clearPageError: (id: symbol) =>
        setPageError((current) => (current?.id === id ? null : current)),
      showPageError: setPageError
    }),
    []
  )

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
    <AppShellErrorContext.Provider value={errorContext}>
      <NotificationProvider>
        {pageError && (
          <main className="min-h-screen bg-kg-canvas">
            <SystemError fullScreen retry={pageError.retry} />
          </main>
        )}
        <div
          className={
            pageError
              ? 'hidden'
              : 'min-h-screen bg-kg-canvas lg:grid lg:grid-cols-[280px_minmax(0,1fr)]'
          }
          hidden={Boolean(pageError)}
        >
          <header className="sticky top-0 z-50 flex h-[4.5rem] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-lg lg:hidden">
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
              className="fixed inset-x-0 bottom-0 top-[4.5rem] z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
              onClick={closeMenuAndRestoreFocus}
            />
          )}

          <aside
            id="app-navigation"
            className={`fixed bottom-0 left-0 top-[4.5rem] z-40 flex w-[280px] flex-col overflow-y-auto border-r border-slate-200/80 bg-white px-4 py-5 shadow-2xl shadow-slate-950/10 transition-transform sm:px-5 lg:sticky lg:inset-y-0 lg:h-screen lg:translate-x-0 lg:px-6 lg:py-7 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="hidden lg:block">
              <Brand />
            </div>
            <nav aria-label={t('nav.main')} className="space-y-1.5 lg:mt-10">
              {links.map(({ to, key, icon: Icon, end }) => (
                <NavLink
                  className={({ isActive }) =>
                    `flex min-h-12 items-center gap-3.5 rounded-xl px-4 text-[0.95rem] font-semibold no-underline transition-colors ${isActive ? 'bg-teal-50 text-teal-900 ring-1 ring-inset ring-teal-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`
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
            <div className="mt-auto border-t border-slate-200/80 pt-5">
              <UserAccountMenu />
            </div>
          </aside>

          <main className="min-w-0 px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10 xl:px-12">
            <a className="sr-only focus:not-sr-only" href="#page-content">
              {t('common.skip')}
            </a>
            <div className="mx-auto max-w-[82rem]" id="page-content">
              <Outlet />
            </div>
          </main>
        </div>
      </NotificationProvider>
    </AppShellErrorContext.Provider>
  )
}
