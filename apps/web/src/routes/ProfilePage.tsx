import { useMutation, useQueryClient } from '@tanstack/react-query'
import { HeartPulse, Mail, Pencil, Trash2, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { useAuth } from '@/features/auth/AuthContext'
import { formatDate } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { confirmNotification, showError } from '@/lib/notification'
import { deleteHealthProfile } from '@/services/product'

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deletion = useMutation({
    mutationFn: deleteHealthProfile,
    onSuccess: () => {
      queryClient.setQueryData(['health-profile'], null)
      navigate('/onboarding', { replace: true })
    },
    onError: () =>
      void showError(t('profile.healthDeleteFailed'), t('common.close'))
  })
  const removeHealthProfile = async () => {
    const confirmed = await confirmNotification({
      title: t('profile.healthDelete'),
      text: t('profile.healthDeleteConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      danger: true
    })
    if (confirmed) deletion.mutate()
  }
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
      <section className="kg-card mt-5 max-w-3xl p-6 sm:p-8">
        <HeartPulse aria-hidden="true" className="text-teal-700" />
        <h2 className="mt-3 text-xl font-bold">{t('profile.healthTitle')}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t('profile.healthBody')}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link className="kg-button-primary" to="/onboarding">
            <Pencil aria-hidden="true" size={18} />
            {t('profile.healthEdit')}
          </Link>
          <button
            className="kg-button-secondary text-red-700"
            disabled={deletion.isPending}
            onClick={() => void removeHealthProfile()}
            type="button"
          >
            <Trash2 aria-hidden="true" size={18} />
            {t('profile.healthDelete')}
          </button>
        </div>
      </section>
    </div>
  )
}
