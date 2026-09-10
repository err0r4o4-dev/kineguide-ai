import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  Camera,
  ChevronRight,
  DatabaseZap,
  Languages,
  Link2,
  ShieldCheck,
  Trash2
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { LanguageButton } from '@/components/LanguageButton'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/AuthContext'
import { ProviderIcon } from '@/features/auth/ProviderIcon'
import { confirmNotification, showError, showSuccess } from '@/lib/notification'
import {
  deleteAccount,
  deleteAuthIdentity,
  getAuthIdentities,
  getConsent,
  getOAuthProviders,
  revokeConsent,
  startAuthIdentityLink,
  type OAuthProvider
} from '@/services/product'

export function SettingsPage() {
  const { t } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useSearchParams()
  const client = useQueryClient()
  const linkedProvider = search.get('linked')
  const notifiedLinkRef = useRef(false)
  const providers = useQuery({
    queryKey: ['auth-providers'],
    queryFn: getOAuthProviders,
    staleTime: 5 * 60_000
  })
  const identities = useQuery({
    queryKey: ['auth-identities'],
    queryFn: ({ signal }) => getAuthIdentities(signal)
  })
  const consent = useQuery({
    queryKey: ['consent'],
    queryFn: ({ signal }) => getConsent(signal)
  })
  const connect = useMutation({
    mutationFn: startAuthIdentityLink,
    onSuccess: (authorizationURL) => window.location.assign(authorizationURL),
    onError: () =>
      void showError(t('settings.identityFailed'), t('common.close'))
  })
  const disconnect = useMutation({
    mutationFn: deleteAuthIdentity,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['auth-identities'] })
      void showSuccess(t('settings.disconnectDone'))
    },
    onError: (error) => {
      const code = isAxiosError(error) ? error.response?.data?.error?.code : ''
      void showError(
        t(
          code === 'LAST_LOGIN_METHOD'
            ? 'settings.lastLoginMethod'
            : 'settings.identityFailed'
        ),
        t('common.close')
      )
    }
  })
  const accountDeletion = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      void showSuccess(t('settings.deleted'))
      auth.clearSession()
      navigate('/', { replace: true })
    },
    onError: () => void showError(t('settings.deleteFailed'), t('common.close'))
  })
  const consentRevocation = useMutation({
    mutationFn: revokeConsent,
    onSuccess: () => {
      client.removeQueries()
      client.setQueryData(['consent'], null)
      void showSuccess(t('settings.revokeDone'))
      navigate('/consent', { replace: true })
    },
    onError: () => void showError(t('settings.revokeFailed'), t('common.close'))
  })

  useEffect(() => {
    if (!linkedProvider || notifiedLinkRef.current) return
    notifiedLinkRef.current = true
    void showSuccess(
      t('settings.connectDone', { provider: providerLabel(linkedProvider) })
    )
    const nextSearch = new URLSearchParams(search)
    nextSearch.delete('linked')
    setSearch(nextSearch, { replace: true })
  }, [linkedProvider, search, setSearch, t])

  const remove = async () => {
    const confirmed = await confirmNotification({
      title: t('settings.delete'),
      text: t('settings.deleteConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      danger: true
    })
    if (confirmed) accountDeletion.mutate()
  }
  const withdrawConsent = async () => {
    const confirmed = await confirmNotification({
      title: t('settings.revoke'),
      text: t('settings.revokeConfirm'),
      confirmText: t('settings.revokeConfirmAction'),
      cancelText: t('common.cancel'),
      danger: true
    })
    if (confirmed) consentRevocation.mutate()
  }
  return (
    <div>
      <PageHeader title={t('settings.title')} />
      <section className="mt-8 grid max-w-4xl gap-5">
        <article className="kg-card p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Languages aria-hidden="true" className="text-teal-700" />
              <h2 className="mt-4 text-xl font-bold">
                {t('settings.language')}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t('settings.languageBody')}
              </p>
            </div>
            <LanguageButton />
          </div>
        </article>
        <article className="kg-card p-5 sm:p-7">
          <Link2 aria-hidden="true" className="text-teal-700" />
          <h2 className="mt-4 text-xl font-bold">
            {t('settings.connectedAccounts')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {t('settings.connectedAccountsBody')}
          </p>
          {(providers.isLoading || identities.isLoading) && <QueryLoading />}
          {(providers.isError || identities.isError) && (
            <QueryError
              retry={() => {
                void providers.refetch()
                void identities.refetch()
              }}
            />
          )}
          {providers.data && identities.data && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {providers.data.providers
                .filter(({ enabled }) => enabled)
                .map(({ provider }) => {
                  const connected = identities.data.some(
                    (identity) => identity.provider === provider
                  )
                  return (
                    <div
                      className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                      key={provider}
                    >
                      <span className="flex items-center gap-3 font-semibold">
                        <ProviderIcon provider={provider} />
                        {providerLabel(provider)}
                      </span>
                      <button
                        className="kg-button-secondary px-3 py-2 text-sm"
                        disabled={connect.isPending || disconnect.isPending}
                        onClick={() =>
                          connected
                            ? disconnect.mutate(provider)
                            : connect.mutate(provider)
                        }
                        type="button"
                      >
                        {t(
                          connected
                            ? 'settings.disconnect'
                            : 'settings.connect',
                          { provider: providerLabel(provider) }
                        )}
                      </button>
                    </div>
                  )
                })}
            </div>
          )}
        </article>
        <article className="kg-card p-5 sm:p-7">
          <DatabaseZap aria-hidden="true" className="text-teal-700" />
          <h2 className="mt-4 text-xl font-bold">{t('common.retention')}</h2>
          <p className="mt-3 leading-7 text-slate-600">
            {t('settings.retention')}
          </p>
        </article>
        <article className="kg-card p-5 sm:p-7">
          <ShieldCheck aria-hidden="true" className="text-teal-700" />
          <h2 className="mt-4 text-xl font-bold">{t('settings.consent')}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {t('settings.consentBody')}
          </p>
          {consent.isLoading && <QueryLoading />}
          {consent.isError && (
            <div className="mt-4">
              <QueryError retry={() => void consent.refetch()} />
            </div>
          )}
          {consent.data && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-slate-700">
                {t('settings.consentActive', {
                  version: consent.data.policy_version
                })}
              </p>
              <button
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                disabled={consentRevocation.isPending}
                onClick={() => void withdrawConsent()}
                type="button"
              >
                {t('settings.revoke')}
              </button>
            </div>
          )}
          {!consent.isLoading && !consent.isError && !consent.data && (
            <p className="mt-4 text-sm text-slate-600">
              {t('settings.noActiveConsent')}
            </p>
          )}
        </article>
        <Link
          className="kg-card flex min-h-24 items-center gap-4 p-5 no-underline transition hover:border-teal-300 hover:bg-teal-50 sm:p-6"
          to="/app/activities"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
            <Camera aria-hidden="true" size={21} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-slate-950">
              {t('camera.permission')}
            </span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">
              {t('camera.instructions')}
            </span>
          </span>
          <ChevronRight aria-hidden="true" className="text-teal-700" />
        </Link>
        <article className="kg-card flex min-h-24 items-center gap-4 p-5 sm:p-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
            <ShieldCheck aria-hidden="true" size={21} />
          </span>
          <div>
            <h2 className="font-bold text-slate-950">{t('common.safety')}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t('common.noDiagnosis')}
            </p>
          </div>
        </article>
        <article className="kg-card border-red-200 p-5 sm:p-6">
          <Trash2 aria-hidden="true" className="text-red-700" />
          <h2 className="mt-4 text-xl font-bold text-red-900">
            {t('settings.delete')}
          </h2>
          <button
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
            disabled={accountDeletion.isPending}
            onClick={() => void remove()}
            type="button"
          >
            <Trash2 aria-hidden="true" />
            {t('settings.delete')}
          </button>
        </article>
      </section>
    </div>
  )
}

function providerLabel(provider: string | OAuthProvider) {
  return provider === 'google' ? 'Google' : 'Facebook'
}
