import { Mail, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/features/auth/AuthContext'
import { formatDate } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  return (
    <div>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />
      <section className="kg-card mt-8 max-w-3xl p-6 sm:p-8">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <span className="grid size-16 place-items-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
            <UserRound aria-hidden="true" size={38} />
          </span>
          <div>
            <p className="text-lg font-bold">{user?.display_name}</p>
            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
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
