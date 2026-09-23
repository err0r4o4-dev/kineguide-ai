import {
  BarChart3,
  Bot,
  History,
  Home,
  Menu,
  Monitor,
  Settings
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
  { to: '/app/chat', key: 'chat', icon: Bot, end: false },
  { to: '/app/monitor', key: 'monitor', icon: Monitor, end: false },
  { to: '/app/history', key: 'history', icon: History, end: false },
  { to: '/app/analytics', key: 'analytics', icon: BarChart3, end: false },
  { to: '/app/settings', key: 'settings', icon: Settings, end: false }
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
          <header className="sticky top-0 z-[var(--z-index-sticky)] flex h-[var(--layout-mobile-nav,4.5rem)] items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 backdrop-blur-[var(--blur-glass)] saturate-[var(--glass-saturation)] lg:hidden">
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
            className={`fixed bottom-0 left-0 top-[var(--layout-mobile-nav,4.5rem)] z-[var(--z-index-navigation)] flex w-[var(--layout-sidebar,280px)] flex-col overflow-y-auto border-r border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-5 shadow-[var(--shadow-floating)] backdrop-blur-[var(--blur-glass)] saturate-[var(--glass-saturation)] transition-transform duration-[var(--motion-standard)] ease-[var(--ease-standard)] sm:px-5 lg:sticky lg:inset-y-0 lg:h-screen lg:translate-x-0 lg:px-6 lg:py-7 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="hidden lg:block">
              <Brand />
            </div>
            <nav aria-label={t('nav.main')} className="space-y-1.5 lg:mt-10">
              {links.map(({ to, key, icon: Icon, end }) => (
                <NavLink
                  className={({ isActive }) =>
                    `ui-transition pressable flex min-h-11 items-center gap-3.5 rounded-[var(--radius-control)] px-4 text-[0.95rem] font-semibold no-underline ${isActive ? 'bg-[var(--color-kg-primary)] text-white shadow-[var(--shadow-card)]' : 'text-[var(--color-kg-muted)] hover:bg-[var(--color-kg-soft)] hover:text-[var(--color-kg-ink)]'}`
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
