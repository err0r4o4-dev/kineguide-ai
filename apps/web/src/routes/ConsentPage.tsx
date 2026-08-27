import {
  Camera,
  Database,
  MessageCircle,
  MicOff,
  ShieldCheck
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Brand } from '@/components/Brand'
import { LanguageButton } from '@/components/LanguageButton'
import { SystemLoading } from '@/components/SystemState'
import {
  waitForLoadingCompletion,
  withMinimumLoadingDuration
} from '@/lib/minimumLoadingDuration'
import { saveConsent } from '@/services/product'

export function ConsentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [required, setRequired] = useState(false)
  const [research, setResearch] = useState(false)
  const [aiChat, setAIChat] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    if (!required) return
    setSaving(true)
    setLoadingComplete(false)
    setError('')
    try {
      const consent = await withMinimumLoadingDuration(
        saveConsent({
          camera_processing: true,
          session_summary_storage: true,
          ai_chat_storage: aiChat,
          research_use: research
        })
      )
      queryClient.setQueryData(['consent'], consent)
      setLoadingComplete(true)
      await waitForLoadingCompletion()
      navigate('/app/assessment', { replace: true })
    } catch {
      setError(t('consent.failed'))
    } finally {
      setSaving(false)
    }
  }
  const cards = [
    {
      icon: Camera,
      title: t('consent.cameraTitle'),
      body: t('consent.cameraBody')
    },
    {
      icon: ShieldCheck,
      title: t('landing.privacyTitle'),
      body: t('landing.privacyBody')
    },
    { icon: MicOff, title: t('camera.secure'), body: t('consent.cameraBody') },
    {
      icon: Database,
      title: t('consent.storageTitle'),
      body: t('consent.storageBody')
    },
    {
      icon: MessageCircle,
      title: t('consent.aiChat'),
      body: t('consent.aiChatBody')
    }
  ]
  if (saving) return <SystemLoading complete={loadingComplete} />
  return (
    <main className="min-h-screen bg-kg-canvas px-4 py-8 sm:py-12">
      <div className="relative mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-10 lg:p-12">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <LanguageButton />
        </div>
        <div className="text-center">
          <Brand compact />
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
            {t('consent.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            {t('consent.intro')}
          </p>
        </div>
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map(({ icon: Icon, title, body }) => (
            <article
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
              key={title}
            >
              <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
                <Icon aria-hidden="true" size={20} />
              </span>
              <h2 className="mt-3 font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </section>
        <div className="my-8 border-t border-slate-200" />
        <label className="kg-check">
          <input
            checked={required}
            onChange={(event) => setRequired(event.target.checked)}
            type="checkbox"
          />
          <span>
            <strong>{t('consent.required')}</strong>
            <small>{t('consent.storageBody')}</small>
          </span>
        </label>
        <label className="kg-check mt-4">
          <input
            checked={aiChat}
            onChange={(event) => setAIChat(event.target.checked)}
            type="checkbox"
          />
          <span>
            <strong>{t('consent.aiChat')}</strong>
            <small>{t('consent.aiChatBody')}</small>
          </span>
        </label>
        <label className="kg-check mt-4">
          <input
            checked={research}
            onChange={(event) => setResearch(event.target.checked)}
            type="checkbox"
          />
          <span>
            <strong>{t('consent.research')}</strong>
            <small>{t('consent.researchTitle')}</small>
          </span>
        </label>
        <p className="mt-6 text-sm leading-6 text-slate-600">
          {t('consent.privacy')}
        </p>
        {error && (
          <p className="kg-alert-danger mt-4" role="alert">
            {error}
          </p>
        )}
        <button
          className="kg-button-primary mt-7 w-full"
          disabled={!required || saving}
          onClick={() => void submit()}
          type="button"
        >
          {saving ? t('common.loading') : t('consent.accept')}
        </button>
      </div>
    </main>
  )
}
