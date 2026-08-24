import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DatabaseZap, ShieldOff, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { useAuth } from '@/features/auth/AuthContext'
import { deleteAccount, getConsent, revokeConsent } from '@/services/product'

export function SettingsPage() {
  const { t } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const client = useQueryClient()
  const [message, setMessage] = useState('')
  const consent = useQuery({
    queryKey: ['consent'],
    queryFn: ({ signal }) => getConsent(signal)
  })
  const revoke = useMutation({
    mutationFn: revokeConsent,
    onSuccess: async () => {
      setMessage(t('settings.revokeDone'))
      await client.invalidateQueries({ queryKey: ['consent'] })
    }
  })
  const remove = async () => {
    if (!window.confirm(t('settings.deleteConfirm'))) return
    await deleteAccount()
    auth.clearSession()
    navigate('/', { replace: true })
  }
  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">
          {t('settings.title')}
        </h1>
      </header>
      <section className="mt-7 grid gap-5 lg:grid-cols-2">
        <article className="kg-card p-6">
          <ShieldOff aria-hidden="true" className="text-teal-700" />
          <h2 className="mt-4 text-xl font-bold">{t('settings.consent')}</h2>
          {consent.isLoading && <QueryLoading />}
          {consent.isError && (
            <QueryError retry={() => void consent.refetch()} />
          )}
          {consent.data && (
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt>{t('consent.required')}</dt>
                <dd className="font-semibold text-emerald-700">
                  {consent.data.revoked_at
                    ? t('common.inactive')
                    : t('common.active')}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{t('consent.research')}</dt>
                <dd>
                  {consent.data.research_use ? t('common.yes') : t('common.no')}
                </dd>
              </div>
            </dl>
          )}
          <button
            className="kg-button-secondary mt-6"
            disabled={!consent.data || revoke.isPending}
            onClick={() => revoke.mutate()}
            type="button"
          >
            <ShieldOff aria-hidden="true" />
            {t('settings.revoke')}
          </button>
        </article>
        <article className="kg-card p-6">
          <DatabaseZap aria-hidden="true" className="text-indigo-700" />
          <h2 className="mt-4 text-xl font-bold">{t('common.retention')}</h2>
          <p className="mt-3 leading-7 text-slate-600">
            {t('settings.retention')}
          </p>
        </article>
        <article className="kg-card border-red-200 p-6 lg:col-span-2">
          <Trash2 aria-hidden="true" className="text-red-700" />
          <h2 className="mt-4 text-xl font-bold text-red-900">
            {t('settings.delete')}
          </h2>
          <button
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
            onClick={() => void remove()}
            type="button"
          >
            <Trash2 aria-hidden="true" />
            {t('settings.delete')}
          </button>
        </article>
      </section>
      {message && (
        <p className="kg-alert-success mt-5" role="status">
          {message}
        </p>
      )}
    </div>
  )
}
