import { Mail, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/features/auth/AuthContext'
import { formatDate } from '@/lib/format'

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">{t('profile.title')}</h1>
        <p className="mt-2 text-slate-600">{t('profile.subtitle')}</p>
      </header>
      <section className="kg-card mt-7 max-w-2xl p-7">
        <span className="grid size-20 place-items-center rounded-full bg-teal-50 text-teal-700">
          <UserRound aria-hidden="true" size={38} />
        </span>
        <dl className="mt-7 space-y-5">
          <div>
            <dt className="text-sm text-slate-500">{t('profile.name')}</dt>
            <dd className="mt-1 text-lg font-semibold">{user?.display_name}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">{t('profile.email')}</dt>
            <dd className="mt-1 flex items-center gap-2">
              <Mail aria-hidden="true" size={17} />
              {user?.email}
            </dd>
          </div>
          {user?.created_at && (
            <div>
              <dt className="text-sm text-slate-500">{t('profile.joined')}</dt>
              <dd className="mt-1">
                {formatDate(user.created_at, i18n.resolvedLanguage ?? 'th')}
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  )
}
