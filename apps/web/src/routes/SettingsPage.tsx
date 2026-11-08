import {
  Bell,
  CheckCircle2,
  Languages,
  Settings2,
  SquarePen,
  Link2,
  Play,
  ShieldCheck,
  Trash2,
  Unlink,
  Volume2
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { LanguageButton } from '@/components/LanguageButton'
import {
  MIN_BREAK_INTERVAL_MINUTES,
  MAX_BREAK_INTERVAL_MINUTES
} from '@/features/reminders/breakReminderEngine'
import { useAuth } from '@/features/auth/AuthContext'
import { ProviderIcon } from '@/features/auth/ProviderIcon'
import {
  createBrowserSoundAlertAdapter,
  THAI_SPEECH_LANGUAGE,
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

  const soundCapabilities = (
    previewAdapterRef.current ?? createBrowserSoundAlertAdapter()
  ).getCapabilities(THAI_SPEECH_LANGUAGE)
  const audioCompletelyUnsupported =
    !soundCapabilities.webAudioSupported &&
    soundCapabilities.speechStatus === 'unsupported'
  const speechFallbackActive =
    !audioCompletelyUnsupported &&
    sound.preferences.mode === 'tts' &&
    soundCapabilities.speechStatus !== 'supported'
  const volumePercent = Math.round(sound.preferences.volume * 100)

  const handlePreviewSound = () => {
    const thaiT = i18n.getFixedT('th')
    previewAdapterRef.current?.play({
      tone: 'preview',
      text: String(thaiT('sound.speech.preview')),
      language: THAI_SPEECH_LANGUAGE,
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
    <div className="kg-settings-page mx-auto pb-8">
      <div aria-hidden="true" className="kg-settings-backdrop" />
      <header className="kg-settings-header">
        <p className="kg-settings-eyebrow">
          <Settings2 aria-hidden="true" size={19} />
          {t('settings.eyebrow')}
        </p>
        <h1>{t('settings.title')}</h1>
        <p className="kg-settings-subtitle">{t('profile.subtitle')}</p>
      </header>

      <div className="kg-settings-grid">
        <div className="kg-settings-column">
          <SettingsSection
            body={t('settings.languageBody')}
            className="kg-settings-language"
            icon={Languages}
            title={t('settings.language')}
          >
            <LanguageButton />
          </SettingsSection>

          <SettingsSection
            body={t('settings.breakRemindersBody')}
            icon={Bell}
            title={t('settings.breakRemindersTitle')}
          >
            <label className="kg-check">
              <input
                type="checkbox"
                checked={sound.preferences.breakRemindersEnabled}
                onChange={(event) =>
                  sound.setBreakRemindersEnabled(event.target.checked)
                }
              />
              <span>{t('settings.breakRemindersEnable')}</span>
            </label>
            <label
              className="mt-4 block text-sm font-semibold text-slate-800"
              htmlFor="break-interval"
            >
              {t('settings.breakInterval')}
            </label>
            <select
              id="break-interval"
              className="mt-2 min-h-11 w-full rounded-xl border border-kg-border bg-white px-3 text-slate-900 disabled:opacity-60"
              disabled={!sound.preferences.breakRemindersEnabled}
              value={sound.preferences.breakIntervalMinutes}
              onChange={(event) =>
                sound.setBreakIntervalMinutes(Number(event.target.value))
              }
            >
              {Array.from(
                {
                  length:
                    MAX_BREAK_INTERVAL_MINUTES - MIN_BREAK_INTERVAL_MINUTES + 1
                },
                (_, index) => index + MIN_BREAK_INTERVAL_MINUTES
              ).map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes}
                </option>
              ))}
            </select>
          </SettingsSection>

          <SettingsSection
            body={t('settings.soundBody')}
            className="kg-settings-sound"
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

              <fieldset className="kg-settings-modes space-y-2.5 border-0 p-0">
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
                  className="kg-settings-volume min-h-11 w-full cursor-pointer"
                  style={{
                    backgroundSize: `${((volumePercent - 10) / 90) * 100}% 8px`
                  }}
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
            </div>
          </SettingsSection>
        </div>

        <div className="kg-settings-column">
          <SettingsSection
            body={t('settings.consentBody')}
            icon={ShieldCheck}
            title={t('settings.consent')}
          >
            <div className="kg-settings-consent-status">
              {consent.isLoading ? (
                <p className="text-sm text-slate-500">{t('common.loading')}</p>
              ) : consent.data ? (
                <div className="flex items-center gap-4">
                  <CheckCircle2
                    aria-hidden="true"
                    className="shrink-0 text-emerald-600"
                    size={23}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {t('settings.consentActive', {
                        version: consent.data.policy_version
                      })}
                    </p>
                    <p className="text-sm text-slate-600">
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
            <button
              className="kg-settings-revoke"
              disabled={!consent.data || revoking}
              onClick={() => void handleRevoke()}
              type="button"
            >
              <SquarePen aria-hidden="true" size={20} />
              {revoking ? t('common.loading') : t('settings.revoke')}
            </button>
          </SettingsSection>

          <SettingsSection
            body={t('settings.retention')}
            className="kg-settings-delete"
            icon={Trash2}
            title={t('settings.delete')}
          >
            <button
              className="kg-settings-delete-button"
              disabled={deleting}
              onClick={() => void handleDelete()}
              type="button"
            >
              {deleting ? t('common.loading') : t('settings.delete')}
            </button>
          </SettingsSection>

          <SettingsSection
            className="kg-settings-events"
            icon={Bell}
            title={t('settings.soundEventsLabel')}
          >
            <div className="kg-settings-events-content">
              <div className="kg-settings-event-options">
                {soundEventOptions.map((option) => (
                  <label className="kg-check" key={option.key}>
                    <input
                      checked={sound.preferences.events[option.key]}
                      onChange={() => sound.toggleEvent(option.key)}
                      type="checkbox"
                    />
                    <span className="text-sm text-slate-900">
                      {t(option.labelKey)}
                    </span>
                  </label>
                ))}
              </div>
              <div className="kg-settings-preview">
                <button
                  className="kg-button-secondary text-sm"
                  disabled={audioCompletelyUnsupported}
                  onClick={handlePreviewSound}
                  type="button"
                >
                  <Play aria-hidden="true" size={18} />
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
                      className="kg-settings-provider flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3"
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
      </div>
    </div>
  )
}

function SettingsSection({
  body,
  children,
  className = '',
  icon: Icon,
  title
}: {
  body?: string
  children: ReactNode
  className?: string
  icon: typeof Languages
  title: string
}) {
  const titleId = useId()
  return (
    <section
      aria-labelledby={titleId}
      className={`kg-card kg-settings-card ${className}`}
    >
      <div className="kg-settings-section-header">
        <span className="kg-settings-section-icon">
          <Icon aria-hidden="true" size={32} />
        </span>
        <div className="min-w-0">
          <h2 id={titleId}>{title}</h2>
          {body && <p className="kg-settings-section-description">{body}</p>}
        </div>
      </div>
      <div className="kg-settings-section-content">{children}</div>
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
