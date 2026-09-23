import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Database, ShieldCheck } from 'lucide-react'
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
  const [researchAgreed, setResearchAgreed] = useState(false)

  const mutation = useMutation({
    mutationFn: async () => {
      return saveConsent({
        camera_processing: true,
        session_summary_storage: true,
        ai_chat_storage: true, // We combine AI chat in the same consent for simplicity
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
    <div className="mx-auto max-w-3xl pb-8">
      <PageHeader title={t('consent.title')} subtitle={t('consent.intro')} />

      <div className="mt-8 flex flex-col gap-5">
        <section className="kg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
            <Camera aria-hidden="true" className="text-teal-700" size={20} />
            <h2 className="font-bold text-slate-900">
              {t('consent.cameraTitle')}
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm leading-6 text-slate-700">
              {t('consent.cameraBody')}
            </p>
          </div>
        </section>

        <section className="kg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
            <Database aria-hidden="true" className="text-teal-700" size={20} />
            <h2 className="font-bold text-slate-900">
              {t('consent.storageTitle')}
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm leading-6 text-slate-700">
              {t('consent.storageBody')}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {t('consent.aiChatBody')}
            </p>
          </div>
        </section>

        <div className="kg-card mt-2 p-5 sm:p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="flex h-6 items-center">
              <input
                type="checkbox"
                className="size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
            </div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">
              {t('consent.required')}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer mt-5">
            <div className="flex h-6 items-center">
              <input
                type="checkbox"
                className="size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={researchAgreed}
                onChange={(e) => setResearchAgreed(e.target.checked)}
              />
            </div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">
              {t('consent.researchTitle')}
            </div>
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        {mutation.isError && (
          <p className="text-sm font-semibold text-red-600">
            {t('consent.failed')}
          </p>
        )}
        <button
          className="kg-button-primary w-full sm:w-auto min-w-[200px]"
          disabled={!agreed || mutation.isPending}
          onClick={() => mutation.mutate()}
          type="button"
        >
          {mutation.isPending ? t('common.loading') : t('consent.accept')}
        </button>
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <ShieldCheck aria-hidden="true" size={16} />
          {t('consent.privacy')}
        </p>
      </div>

      <SafetyNotice className="mt-12">{t('common.noDiagnosis')}</SafetyNotice>
    </div>
  )
}
