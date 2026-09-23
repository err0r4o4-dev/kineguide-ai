import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { PageHeader } from '@/components/PageHeader'
import { LanguageButton } from '@/components/LanguageButton'
import { useAuth } from '@/features/auth/AuthContext'
import { deleteAccount, getConsent, revokeConsent } from '@/services/product'
import { confirmNotification } from '@/lib/notification'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const consent = useQuery({
    queryKey: ['consent'],
    queryFn: ({ signal }) => getConsent(signal)
  })

  const [revoking, setRevoking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleRevoke = async () => {
    const confirmed = await confirmNotification({
      title: t('settings.revokeConfirmAction'),
      text: t('settings.revokeConfirm'),
      confirmText: t('settings.revoke'),
      cancelText: t('common.cancel')
    })

    if (!confirmed) return

    setRevoking(true)
    try {
      await revokeConsent()
      await queryClient.invalidateQueries()
      navigate('/')
    } catch {
      alert(t('settings.revokeFailed'))
    } finally {
      setRevoking(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirmNotification({
      title: t('settings.delete'),
      text: t('settings.deleteConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel')
    })

    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteAccount()
      await auth.logout()
      navigate('/')
    } catch {
      alert(t('settings.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('profile.subtitle')}
      />

      <div className="mt-8 flex flex-col gap-6">
        <section className="kg-card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {t('settings.language')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('settings.languageBody')}
          </p>
          <div className="mt-4">
            <LanguageButton />
          </div>
        </section>

        <section className="kg-card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {t('settings.cameraPrefs')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('settings.preferencesBody', {
              defaultValue: 'Manage camera preferences for tracking posture.'
            })}
          </p>

          <div className="mt-5 space-y-4">
            {/* Placeholder toggles */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-700">
                Auto-start camera when monitoring
              </span>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600">
                <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
              </div>
            </label>
          </div>
        </section>

        <section className="kg-card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {t('settings.breakPrefs')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('settings.preferencesBody', {
              defaultValue: 'Configure when to receive notifications.'
            })}
          </p>

          <div className="mt-5 space-y-4">
            {/* Placeholder toggles */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-700">
                {t('notifications.preference.activityReminder')}
              </span>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600">
                <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-700">
                {t('notifications.preference.progressSummary')}
              </span>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition" />
              </div>
            </label>
          </div>
        </section>

        <section className="kg-card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {t('settings.consent')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('settings.consentBody')}
          </p>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {consent.data ? (
              <div className="flex items-start gap-3">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 text-emerald-600"
                  size={18}
                />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {t('settings.consentActive', {
                      version: consent.data.policy_version
                    })}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {new Date(consent.data.accepted_at).toLocaleString(
                      i18n.resolvedLanguage === 'th' ? 'th-TH' : 'en-GB'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {t('settings.noActiveConsent')}
              </p>
            )}
          </div>

          <div className="mt-5">
            <button
              className="text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors disabled:opacity-50"
              disabled={!consent.data || revoking}
              onClick={() => void handleRevoke()}
              type="button"
            >
              {revoking ? t('common.loading') : t('settings.revoke')}
            </button>
          </div>
        </section>

        <section className="kg-card p-5 sm:p-6 border-red-100">
          <h2 className="text-lg font-bold text-red-700">
            {t('settings.delete')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('settings.retention')}
          </p>

          <div className="mt-5">
            <button
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-50"
              disabled={deleting}
              onClick={() => void handleDelete()}
              type="button"
            >
              {deleting ? t('common.loading') : t('settings.delete')}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
