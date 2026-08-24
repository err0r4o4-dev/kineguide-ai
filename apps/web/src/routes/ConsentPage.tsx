import { Camera, Database, MicOff, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Brand } from '@/components/Brand'
import { saveConsent } from '@/services/product'

export function ConsentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [required, setRequired] = useState(false)
  const [research, setResearch] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    if (!required) return
    setSaving(true)
    setError('')
    try {
      await saveConsent({
        camera_processing: true,
        session_summary_storage: true,
        research_use: research
      })
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
    }
  ]
  return (
    <main className="min-h-screen bg-[#f8f7ff] px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-10">
        <div className="text-center">
          <Brand compact />
          <h1 className="mt-6 text-3xl font-bold text-teal-800">
            {t('consent.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            {t('consent.intro')}
          </p>
        </div>
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map(({ icon: Icon, title, body }) => (
            <article
              className="rounded-2xl border border-slate-200 p-5"
              key={title}
            >
              <Icon aria-hidden="true" className="text-teal-700" />
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
