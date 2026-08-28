import {
  Bell,
  ChevronUp,
  CircleHelp,
  LogOut,
  Settings,
  UserRound
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router'

import { useAuth } from '@/features/auth/AuthContext'
import { useNotifications } from '@/features/notifications/NotificationContext'
import { confirmNotification } from '@/lib/notification'

export function UserAccountMenu() {
  const { t } = useTranslation()
  const auth = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const label = shortName(auth.user?.display_name)

  useEffect(() => {
    const closeOnPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', closeOnPointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnPointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const logout = async () => {
    const confirmed = await confirmNotification({
      title: t('account.logoutTitle'),
      text: t('account.logoutConfirm'),
      confirmText: t('auth.signOut'),
      cancelText: t('common.cancel')
    })
    if (!confirmed) return
    await auth.logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={menuRef}>
      {open && (
        <div
          aria-label={t('account.menu')}
          className="absolute bottom-[calc(100%+1rem)] left-0 z-20 w-full min-w-56 overflow-hidden rounded-[1.25rem] border border-kg-border bg-kg-surface p-3 shadow-[0_16px_40px_rgb(20_35_33_/_0.12)]"
          role="menu"
        >
          <p className="px-3 pb-2 pt-1 text-sm font-bold text-slate-700">
            {t('account.account')}
          </p>
          <MenuLink
            icon={UserRound}
            label={t('nav.profile')}
            to="/app/profile"
            onClick={() => setOpen(false)}
          />
          <MenuLink
            icon={Settings}
            label={t('account.settingsPrivacy')}
            to="/app/settings"
            onClick={() => setOpen(false)}
          />
          <MenuLink
            ariaLabel={t('account.notificationMenuLabel', {
              count: unreadCount
            })}
            badge={unreadCount}
            icon={Bell}
            label={t('notifications.title')}
            to="/app/notifications"
            onClick={() => setOpen(false)}
          />
          <div className="mx-1 my-2 border-t border-kg-border" />
          <p className="px-3 pb-2 pt-1 text-sm font-bold text-slate-500">
            {t('account.system')}
          </p>
          <MenuLink
            icon={CircleHelp}
            label={t('nav.help')}
            to="/app/help"
            onClick={() => setOpen(false)}
          />
          <button
            className="mt-2 flex min-h-12 w-full items-center gap-3 border-t border-kg-border px-3 pt-2 text-left text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
            onClick={() => void logout()}
            role="menuitem"
            type="button"
          >
            <LogOut aria-hidden="true" className="shrink-0" size={21} />
            {t('auth.signOut')}
          </button>
        </div>
      )}
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          unreadCount > 0
            ? t('account.menuWithUnread', { count: unreadCount })
            : t('account.menu')
        }
        className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 px-3 text-left transition-colors hover:border-teal-200 hover:bg-teal-50"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <span
          className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-teal-800 shadow-sm"
          aria-hidden="true"
        >
          {initials(auth.user?.display_name)}
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
          {label}
        </span>
        <div className="relative flex items-center justify-center pl-1">
          <Bell
            aria-hidden="true"
            className="shrink-0 text-slate-600"
            data-testid="account-notification-bell"
            size={21}
          />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-teal-700 px-1.5 text-[10px] font-bold leading-5 text-white tabular-nums"
            >
              {unreadCount}
            </span>
          )}
        </div>
        <ChevronUp
          aria-hidden="true"
          className={`shrink-0 text-slate-600 transition-transform ${open ? '' : 'rotate-180'}`}
          size={18}
        />
      </button>
    </div>
  )
}

function MenuLink({
  icon: Icon,
  label,
  to,
  onClick,
  badge,
  ariaLabel
}: {
  icon: LucideIcon
  label: string
  to: string
  onClick: () => void
  badge?: number
  ariaLabel?: string
}) {
  return (
    <NavLink
      aria-label={ariaLabel}
      className={({ isActive }) =>
        `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium no-underline transition-colors ${isActive ? 'bg-kg-soft text-teal-950' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'}`
      }
      onClick={onClick}
      role="menuitem"
      to={to}
    >
      <Icon aria-hidden="true" className="shrink-0 text-teal-900" size={21} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          aria-hidden="true"
          className="grid min-w-6 place-items-center rounded-full bg-teal-700 px-1.5 text-xs font-bold leading-6 text-white tabular-nums"
        >
          {badge}
        </span>
      )}
    </NavLink>
  )
}

function initials(name?: string) {
  return (name ?? 'KineGuide')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function shortName(name?: string) {
  const parts = (name ?? 'KineGuide AI').split(' ').filter(Boolean)
  return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0]
}
