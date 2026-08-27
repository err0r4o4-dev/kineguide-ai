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
import { Link, useNavigate } from 'react-router'

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
          className="absolute bottom-[calc(100%+0.5rem)] left-0 z-20 w-full min-w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_24px_rgb(15_23_42_/_0.12)]"
          role="menu"
        >
          <p className="px-2.5 pb-1 pt-1 text-[10px] font-bold text-slate-500">
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
          <div className="my-1 border-t border-slate-200" />
          <p className="px-2.5 pb-1 pt-1 text-[10px] font-bold text-slate-500">
            {t('account.system')}
          </p>
          <MenuLink
            icon={CircleHelp}
            label={t('nav.help')}
            to="/app/help"
            onClick={() => setOpen(false)}
          />
          <button
            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs font-semibold text-red-700 hover:bg-red-50"
            onClick={() => void logout()}
            role="menuitem"
            type="button"
          >
            <LogOut aria-hidden="true" size={15} />
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
        className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2 text-left hover:bg-slate-50"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <span
          className="relative grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-teal-800"
          aria-hidden="true"
        >
          {initials(auth.user?.display_name)}
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
          {label}
        </span>
        {unreadCount > 0 && (
          <>
            <Bell
              aria-hidden="true"
              className="shrink-0 text-slate-600"
              data-testid="account-notification-bell"
              size={16}
            />
            <span
              aria-hidden="true"
              className="grid min-w-5 place-items-center rounded-full bg-teal-700 px-1.5 text-[10px] font-bold leading-5 text-white tabular-nums"
            >
              {unreadCount}
            </span>
          </>
        )}
        <ChevronUp
          aria-hidden="true"
          className={open ? '' : 'rotate-180'}
          size={15}
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
    <Link
      aria-label={ariaLabel}
      className="flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-slate-700 no-underline hover:bg-slate-50"
      onClick={onClick}
      role="menuitem"
      to={to}
    >
      <Icon aria-hidden="true" size={15} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          aria-hidden="true"
          className="grid min-w-5 place-items-center rounded-full bg-teal-700 px-1.5 text-[10px] font-bold leading-5 text-white tabular-nums"
        >
          {badge}
        </span>
      )}
    </Link>
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
