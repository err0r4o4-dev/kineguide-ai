import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { CheckCircle2, CircleDashed, Focus } from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'

export function CalibrationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [state, setState] = useState<'idle' | 'countdown' | 'capturing' | 'complete'>('idle')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (state === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        return () => clearTimeout(timer)
      } else {
        setState('capturing')
      }
    }
  }, [state, countdown])

  useEffect(() => {
    if (state === 'capturing') {
      const timer = setTimeout(() => setState('complete'), 2500)
      return () => clearTimeout(timer)
    }
  }, [state])

  return (
    <div className="mx-auto max-w-2xl text-center">
      <PageHeader
        title={t('calibration.title')}
        subtitle={t('calibration.subtitle')}
      />

      <div className="kg-card mt-8 flex min-h-64 flex-col items-center justify-center p-8">
        {state === 'idle' && (
          <>
            <Focus aria-hidden="true" className="text-teal-700" size={48} />
            <button
              className="kg-button-primary mt-6"
              onClick={() => setState('countdown')}
              type="button"
            >
              {t('calibration.title')}
            </button>
          </>
        )}

        {state === 'countdown' && (
          <div className="text-6xl font-bold tabular-nums text-teal-700">
            {countdown}
          </div>
        )}

        {state === 'capturing' && (
          <div className="flex flex-col items-center gap-4">
            <CircleDashed aria-hidden="true" className="animate-spin text-teal-700" size={48} />
            <p className="text-lg font-semibold text-slate-700">
              {t('calibration.capturing')}
            </p>
          </div>
        )}

        {state === 'complete' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 aria-hidden="true" className="text-emerald-600" size={48} />
            <p className="text-lg font-semibold text-slate-900">
              {t('calibration.baselineCaptured')}
            </p>
            <button
              className="kg-button-primary mt-4"
              onClick={() => navigate('/app/monitor/live')}
              type="button"
            >
              {t('calibration.startMonitoring')}
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-slate-500">
        {t('calibration.placeholderNote')}
      </p>
    </div>
  )
}
