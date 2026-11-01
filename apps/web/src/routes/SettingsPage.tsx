import {
  CheckCircle2,
  Languages,
  Link2,
  Play,
  ShieldCheck,
  Trash2,
  Unlink,
  Volume2
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { PageHeader } from '@/components/PageHeader'
import { LanguageButton } from '@/components/LanguageButton'
import { useAuth } from '@/features/auth/AuthContext'
import { ProviderIcon } from '@/features/auth/ProviderIcon'
import {
  createBrowserSoundAlertAdapter,
  type SoundAlertAdapter
} from '@/features/notifications/soundAlertAdapter'
import {
  clearSoundAlertPreferences,
  useSoundAlertPreferences,
  type SoundAlertEventKey
} from '@/features/notifications/soundAlertPreferences'
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
  const providers = useQuery({
    queryKey: ['auth-providers'],
    queryFn: getOAuthProviders,
    staleTime: 5 * 60_000
  })
  const identities = useQuery({
    queryKey: ['auth-identities'],
    queryFn: ({ signal }) => getAuthIdentities(signal)
  })

  const [revoking, setRevoking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [identityBusy, setIdentityBusy] = useState<OAuthProvider | null>(null)
  const sound = useSoundAlertPreferences()
  const previewAdapterRef = useRef<SoundAlertAdapter | null>(null)
  const [, setVoicesRevision] = useState(0)

  useEffect(() => {
    const adapter = createBrowserSoundAlertAdapter()
    previewAdapterRef.current = adapter

    const handleVoicesChanged = () => {
      setVoicesRevision((current) => current + 1)
    }

    try {
      window.speechSynthesis?.addEventListener?.(
        'voiceschanged',
        handleVoicesChanged
      )
    } catch {
      // Ignore hosts where speechSynthesis does not implement EventTarget.
    }

    return () => {
      try {
        window.speechSynthesis?.removeEventListener?.(
          'voiceschanged',
          handleVoicesChanged
        )
      } catch {
        // Ignore cleanup errors on restricted hosts.
      }
      adapter.dispose()
      previewAdapterRef.current = null
    }
  }, [])

  const activeLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'th'
  const soundCapabilities = (
    previewAdapterRef.current ?? createBrowserSoundAlertAdapter()
  ).getCapabilities(activeLanguage)
  const audioCompletelyUnsupported =
    !soundCapabilities.webAudioSupported &&
    soundCapabilities.speechStatus === 'unsupported'
  const speechFallbackActive =
    !audioCompletelyUnsupported &&
    sound.preferences.mode === 'tts' &&
    soundCapabilities.speechStatus !== 'supported'
  const volumePercent = Math.round(sound.preferences.volume * 100)

  const handlePreviewSound = () => {
    previewAdapterRef.current?.play({
      tone: 'preview',
      text: t('sound.speech.preview'),
      language: activeLanguage,
      mode: sound.preferences.mode,
      volume: sound.preferences.volume
    })
  }

  const connectIdentity = async (provider: OAuthProvider) => {
    setIdentityBusy(provider)
    try {
      const authorizationURL = await startAuthIdentityLink(provider)
      window.location.assign(authorizationURL)
    } catch {
      alert(t('settings.identityFailed'))
      setIdentityBusy(null)
    }
  }

  const disconnectIdentity = async (provider: OAuthProvider) => {
    const confirmed = await confirmNotification({
      title: t('settings.disconnect', { provider: providerName(provider) }),
      text: t('settings.lastLoginMethod'),
      confirmText: t('settings.disconnect', {
        provider: providerName(provider)
      }),
      cancelText: t('common.cancel'),
      danger: true
    })
    if (!confirmed) return

    setIdentityBusy(provider)
    try {
      await deleteAuthIdentity(provider)
      await queryClient.invalidateQueries({ queryKey: ['auth-identities'] })
    } catch {
      alert(t('settings.identityFailed'))
    } finally {
      setIdentityBusy(null)
    }
  }

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
      clearSoundAlertPreferences()
      await auth.logout()
      navigate('/')
    } catch {
      alert(t('settings.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-8">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('profile.subtitle')}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <SettingsSection
            body={t('settings.languageBody')}
            icon={Languages}
            title={t('settings.language')}
          >
            <LanguageButton />
          </SettingsSection>

          <SettingsSection
            body={t('settings.soundBody')}
            icon={Volume2}
            title={t('settings.soundTitle')}
          >
            <div className="space-y-5">
              <label className="kg-check">
                <input
                  checked={sound.preferences.enabled}
                  onChange={sound.toggleEnabled}
                  type="checkbox"
                />
                <span>
                  <strong className="text-sm text-slate-900">
                    {t('settings.soundEnable')}
                  </strong>
                  <small>{t('settings.soundEnableBody')}</small>
                </span>
              </label>

              {audioCompletelyUnsupported && (
                <p
                  className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950"
                  role="status"
                >
                  {t('settings.soundUnsupportedNotice')}
                </p>
              )}

              {speechFallbackActive && (
                <p
                  className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-xs leading-5 text-teal-950"
                  role="status"
                >
                  {t('settings.soundSpeechFallbackNotice')}
                </p>
              )}

              <fieldset className="space-y-2.5 border-0 p-0">
                <legend className="text-sm font-semibold text-slate-900">
                  {t('settings.soundModeLabel')}
                </legend>
                <label
                  className={`kg-choice mt-2 ${sound.preferences.mode === 'tts' ? 'kg-choice-selected' : ''}`}
                >
                  <input
                    checked={sound.preferences.mode === 'tts'}
                    name="sound-alert-mode"
                    onChange={() => sound.setMode('tts')}
                    type="radio"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {t('settings.soundModeTts')}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {t('settings.soundModeTtsBody')}
                    </p>
                  </div>
                </label>
                <label
                  className={`kg-choice ${sound.preferences.mode === 'chime' ? 'kg-choice-selected' : ''}`}
                >
                  <input
                    checked={sound.preferences.mode === 'chime'}
                    name="sound-alert-mode"
                    onChange={() => sound.setMode('chime')}
                    type="radio"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {t('settings.soundModeChime')}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {t('settings.soundModeChimeBody')}
                    </p>
                  </div>
                </label>
              </fieldset>

              <div className="space-y-1.5">
                <label
                  className="block text-sm font-semibold tabular-nums text-slate-900"
                  htmlFor="sound-alert-volume"
                >
                  {t('settings.soundVolume', { percent: volumePercent })}
                </label>
                <input
                  className="min-h-11 w-full cursor-pointer accent-[var(--color-kg-primary)]"
                  id="sound-alert-volume"
                  max={100}
                  min={10}
                  onChange={(event) =>
                    sound.setVolume(Number(event.target.value) / 100)
                  }
                  step={10}
                  type="range"
                  value={volumePercent}
                />
              </div>

              <fieldset className="space-y-3 border-0 p-0">
                <legend className="text-sm font-semibold text-slate-900">
                  {t('settings.soundEventsLabel')}
                </legend>
                <div className="mt-2 space-y-2.5">
                  {soundEventOptions.map((option) => (
                    <label className="kg-check" key={option.key}>
                      <input
                        checked={sound.preferences.events[option.key]}
                        onChange={() => sound.toggleEvent(option.key)}
                        type="checkbox"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {t(option.labelKey)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="pt-1">
                <button
                  className="kg-button-secondary text-sm"
                  disabled={audioCompletelyUnsupported}
                  onClick={handlePreviewSound}
                  type="button"
                >
                  <Play aria-hidden="true" size={16} />
                  {t('settings.soundPreview')}
                </button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            body={t('settings.connectedAccountsBody')}
            icon={Link2}
            title={t('settings.connectedAccounts')}
          >
            <div className="space-y-3">
              {providers.isLoading || identities.isLoading ? (
                <p className="text-sm text-slate-500">{t('common.loading')}</p>
              ) : null}
              {providers.isSuccess &&
                providers.data.providers.every(({ enabled }) => !enabled) && (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {t('settings.noConnectedProviders')}
                  </p>
                )}
              {providers.data?.providers
                .filter(({ enabled }) => enabled)
                .map(({ provider }) => {
                  const connected = identities.data?.some(
                    (identity) => identity.provider === provider
                  )
                  return (
                    <div
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                      key={provider}
                    >
                      <ProviderIcon provider={provider} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">
                          {providerName(provider)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {connected
                            ? t('settings.connected')
                            : t('settings.connect', {
                                provider: providerName(provider)
                              })}
                        </p>
                      </div>
                      <button
                        className="kg-button-secondary !min-h-10 !px-3 text-sm"
                        disabled={identityBusy === provider}
                        onClick={() =>
                          void (connected
                            ? disconnectIdentity(provider)
                            : connectIdentity(provider))
                        }
                        type="button"
                      >
                        {connected ? (
                          <Unlink aria-hidden="true" size={16} />
                        ) : (
                          <Link2 aria-hidden="true" size={16} />
                        )}
                        {connected
                          ? t('settings.disconnect', {
                              provider: providerName(provider)
                            })
                          : t('settings.connect', {
                              provider: providerName(provider)
                            })}
                      </button>
                    </div>
                  )
                })}
            </div>
          </SettingsSection>
        </div>

        <div className="space-y-6">
          <section className="kg-card p-5 sm:p-6">
            <div className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-kg-soft)] text-[var(--color-kg-primary)]">
                <ShieldCheck aria-hidden="true" size={21} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t('settings.consent')}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('settings.consentBody')}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {consent.isLoading ? (
                <p className="text-sm text-slate-500">{t('common.loading')}</p>
              ) : consent.data ? (
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

          <section className="kg-card border-red-100 p-5 sm:p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-700">
              <Trash2 aria-hidden="true" size={21} />
            </span>
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
    </div>
  )
}

function SettingsSection({
  body,
  children,
  icon: Icon,
  title
}: {
  body: string
  children: ReactNode
  icon: typeof Languages
  title: string
}) {
  return (
    <section className="kg-card p-5 sm:p-6">
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-kg-night)] text-[var(--color-kg-accent)]">
          <Icon aria-hidden="true" size={21} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{body}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

const soundEventOptions: ReadonlyArray<{
  key: SoundAlertEventKey
  labelKey: string
}> = [
  { key: 'postureAlert', labelKey: 'settings.soundEventPosture' },
  { key: 'breakReminder', labelKey: 'settings.soundEventBreak' },
  { key: 'calibrationStatus', labelKey: 'settings.soundEventCalibration' },
  { key: 'cameraFraming', labelKey: 'settings.soundEventFraming' }
]

function providerName(provider: OAuthProvider) {
  return provider === 'google' ? 'Google' : 'Facebook'
}
