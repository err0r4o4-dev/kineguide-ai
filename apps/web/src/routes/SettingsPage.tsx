import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { DatabaseZap, Languages, Link2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { LanguageButton } from '@/components/LanguageButton'
import { useAuth } from '@/features/auth/AuthContext'
import { ProviderIcon } from '@/features/auth/ProviderIcon'
import {
  deleteAccount,
  deleteAuthIdentity,
  getAuthIdentities,
  getOAuthProviders,
  startAuthIdentityLink,
  type OAuthProvider
} from '@/services/product'

export function SettingsPage() {
  const { t } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const client = useQueryClient()
  const linkedProvider = search.get('linked')
  const [message, setMessage] = useState(
    linkedProvider
      ? t('settings.connectDone', { provider: providerLabel(linkedProvider) })
      : ''
  )
  const [identityError, setIdentityError] = useState('')
  const providers = useQuery({
    queryKey: ['auth-providers'],
    queryFn: getOAuthProviders,
    staleTime: 5 * 60_000
  })
  const identities = useQuery({
    queryKey: ['auth-identities'],
    queryFn: ({ signal }) => getAuthIdentities(signal)
  })
  const connect = useMutation({
    mutationFn: startAuthIdentityLink,
    onMutate: () => setIdentityError(''),
    onSuccess: (authorizationURL) => window.location.assign(authorizationURL),
    onError: () => setIdentityError(t('settings.identityFailed'))
  })
  const disconnect = useMutation({
    mutationFn: deleteAuthIdentity,
    onMutate: () => setIdentityError(''),
    onSuccess: async () => {
      setMessage(t('settings.disconnectDone'))
      await client.invalidateQueries({ queryKey: ['auth-identities'] })
    },
    onError: (error) => {
      const code = isAxiosError(error) ? error.response?.data?.error?.code : ''
      setIdentityError(
        t(
          code === 'LAST_LOGIN_METHOD'
            ? 'settings.lastLoginMethod'
            : 'settings.identityFailed'
        )
      )
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
        <article className="kg-card p-6 lg:col-span-2">
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
            <LanguageButton variant="segmented" />
          </div>
        </article>
        <article className="kg-card p-6 lg:col-span-2">
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
                      className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
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
          {identityError && (
            <p className="kg-alert-danger mt-4" role="alert">
              {identityError}
            </p>
          )}
        </article>
        <article className="kg-card p-6 lg:col-span-2">
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

function providerLabel(provider: string | OAuthProvider) {
  return provider === 'google' ? 'Google' : 'Facebook'
}
