import {
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

export function UserAccountMenu() {
  const { t } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const label = shortName(auth.user?.display_name)

  useEffect(() => {
    const closeOnPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnPointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnPointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const logout = async () => {
    if (!window.confirm(t('account.logoutConfirm'))) return
    await auth.logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={menuRef}>
      {open && (
        <div
          aria-label={t('account.menu')}
          className="absolute bottom-[calc(100%+0.75rem)] right-0 z-20 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
          role="menu"
        >
          <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
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
          <div className="my-2 border-t border-slate-200" />
          <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            {t('account.system')}
          </p>
          <MenuLink
            icon={CircleHelp}
            label={t('nav.help')}
            to="/app/help"
            onClick={() => setOpen(false)}
          />
          <button
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
            onClick={() => void logout()}
            role="menuitem"
            type="button"
          >
            <LogOut aria-hidden="true" size={18} />
            {t('auth.signOut')}
          </button>
        </div>
      )}
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('account.menu')}
        className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-teal-200 bg-white px-3 text-left shadow-sm hover:bg-teal-50"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-100 font-bold text-teal-800"
          aria-hidden="true"
        >
          {initials(auth.user?.display_name)}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
          {label}
        </span>
        <ChevronUp
          aria-hidden="true"
          className={open ? '' : 'rotate-180'}
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
  onClick
}: {
  icon: LucideIcon
  label: string
  to: string
  onClick: () => void
}) {
  return (
    <Link
      className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 no-underline hover:bg-slate-50"
      onClick={onClick}
      role="menuitem"
      to={to}
    >
      <Icon aria-hidden="true" size={18} />
      {label}
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
