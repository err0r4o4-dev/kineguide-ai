import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import {
  CalendarDays,
  Camera,
  ChevronRight,
  Mail,
  ShieldCheck
} from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/AuthContext'

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const language = i18n.resolvedLanguage === 'th' ? 'th' : 'en'

  return (
    <div className="mx-auto max-w-5xl pb-4">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <section className="kg-card mt-8 overflow-hidden">
        <div className="flex items-start justify-between border-b border-white/10 bg-[var(--color-kg-night)] px-5 py-6 text-white sm:px-6">
          <div className="flex items-center gap-4">
            <span
              className="grid size-14 place-items-center rounded-2xl bg-[var(--color-kg-accent)] text-xl font-bold text-[var(--color-kg-night)] shadow-sm"
              aria-hidden="true"
            >
              {auth.user?.display_name.charAt(0).toUpperCase()}
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">
                {auth.user?.display_name}
              </h2>
              <p className="mt-1 text-sm font-medium text-white/65">
                {t('profile.accountProtected')}
              </p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100 px-5 py-2 sm:px-6">
          <div className="grid grid-cols-[1fr_2fr] gap-4 py-4 sm:grid-cols-[1fr_3fr]">
            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Mail aria-hidden="true" size={16} />
              {t('profile.email')}
            </p>
            <p className="text-sm font-medium text-slate-900">
              {auth.user?.email}
            </p>
          </div>
          <div className="grid grid-cols-[1fr_2fr] gap-4 py-4 sm:grid-cols-[1fr_3fr]">
            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CalendarDays aria-hidden="true" size={16} />
              {t('profile.joined')}
            </p>
            <p className="text-sm font-medium text-slate-900">
              {auth.user?.created_at
                ? new Intl.DateTimeFormat(
                    language === 'th' ? 'th-TH' : 'en-GB',
                    { dateStyle: 'long' }
                  ).format(new Date(auth.user.created_at))
                : '-'}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          className="kg-card kg-card-interactive flex items-center justify-between p-5 no-underline"
          to="/app/settings"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--color-kg-night)] text-[var(--color-kg-accent)]">
              <ShieldCheck aria-hidden="true" size={20} />
            </span>
            <div>
              <p className="font-semibold text-slate-900">
                {t('profile.privacySettings')}
              </p>
              <p className="text-sm text-slate-500">{t('settings.consent')}</p>
            </div>
          </div>
          <ChevronRight
            aria-hidden="true"
            className="text-slate-400"
            size={20}
          />
        </Link>
        <Link
          className="kg-card kg-card-interactive flex items-center justify-between p-5 no-underline"
          to="/app/monitor/calibration"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Camera aria-hidden="true" size={20} />
            </span>
            <div>
              <p className="font-semibold text-slate-900">
                {t('calibration.title')}
              </p>
              <p className="text-sm text-slate-500">
                {t('calibration.subtitle')}
              </p>
            </div>
          </div>
          <ChevronRight
            aria-hidden="true"
            className="text-slate-400"
            size={20}
          />
        </Link>
      </section>
    </div>
  )
}
