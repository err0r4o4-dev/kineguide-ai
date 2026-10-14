import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bot, Camera, Database, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { saveConsent } from '@/services/product'

export function ConsentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [agreed, setAgreed] = useState(false)
  const [aiChatAgreed, setAiChatAgreed] = useState(false)
  const [researchAgreed, setResearchAgreed] = useState(false)

  const mutation = useMutation({
    mutationFn: async () => {
      return saveConsent({
        camera_processing: true,
        session_summary_storage: true,
        ai_chat_storage: aiChatAgreed,
        research_use: researchAgreed
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['consent'] })
      navigate((location.state as { from?: string } | null)?.from ?? '/app', {
        replace: true
      })
    }
  })

  return (
    <main className="kg-content-width py-8 sm:py-12">
      <PageHeader title={t('consent.title')} subtitle={t('consent.intro')} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.68fr)] lg:items-start">
        <div className="grid gap-4">
          <ConsentInfo
            body={t('consent.cameraBody')}
            icon={Camera}
            title={t('consent.cameraTitle')}
          />
          <ConsentInfo
            body={t('consent.storageBody')}
            icon={Database}
            title={t('consent.storageTitle')}
          />
          <ConsentInfo
            body={t('consent.aiChatBody')}
            icon={Bot}
            title={t('consent.aiChat')}
          />
        </div>

        <section className="kg-card p-5 sm:p-6 lg:sticky lg:top-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[var(--color-kg-night)] text-white">
              <ShieldCheck aria-hidden="true" size={21} />
            </span>
            <h2 className="text-lg font-bold text-slate-950">
              {t('consent.choicesTitle')}
            </h2>
          </div>

          <div className="mt-6 space-y-5">
            <ConsentChoice
              checked={agreed}
              label={t('consent.required')}
              onChange={setAgreed}
              required
            />
            <ConsentChoice
              checked={aiChatAgreed}
              label={t('consent.aiChat')}
              onChange={setAiChatAgreed}
            />
            <ConsentChoice
              checked={researchAgreed}
              label={t('consent.researchTitle')}
              onChange={setResearchAgreed}
            />
          </div>

          {mutation.isError && (
            <p className="kg-alert-danger mt-5" role="alert">
              {t('consent.failed')}
            </p>
          )}
          <button
            className="kg-button-primary mt-6 w-full"
            disabled={!agreed || mutation.isPending}
            onClick={() => mutation.mutate()}
            type="button"
          >
            {mutation.isPending ? t('common.loading') : t('consent.accept')}
          </button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <ShieldCheck aria-hidden="true" className="mt-0.5" size={15} />
            {t('consent.privacy')}
          </p>
        </section>
      </div>

      <SafetyNotice className="mt-8">{t('common.noDiagnosis')}</SafetyNotice>
    </main>
  )
}

function ConsentInfo({
  body,
  icon: Icon,
  title
}: {
  body: string
  icon: typeof Camera
  title: string
}) {
  return (
    <section className="kg-card p-5 sm:p-6">
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-kg-soft)] text-[var(--color-kg-primary)] ring-1 ring-inset ring-[var(--color-kg-border)]">
          <Icon aria-hidden="true" size={21} />
        </span>
        <div>
          <h2 className="font-bold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        </div>
      </div>
    </section>
  )
}

function ConsentChoice({
  checked,
  label,
  onChange,
  required = false
}: {
  checked: boolean
  label: string
  onChange(value: boolean): void
  required?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50/50">
      <input
        checked={checked}
        className="mt-0.5 size-5 shrink-0 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
        onChange={(event) => onChange(event.target.checked)}
        required={required}
        type="checkbox"
      />
      <span className="text-sm font-semibold leading-6 text-slate-900">
        {label}
      </span>
    </label>
  )
}
