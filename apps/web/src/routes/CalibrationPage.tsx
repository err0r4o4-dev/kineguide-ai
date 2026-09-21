import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CircleAlert, ShieldCheck } from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'

export function CalibrationPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t('calibration.title')}
        subtitle={t('calibration.subtitle')}
      />

      <section
        className="kg-card mt-8 p-6 sm:p-8"
        aria-labelledby="calibration-status-title"
      >
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <CircleAlert aria-hidden="true" size={26} />
          </span>
          <div className="min-w-0">
            <h2
              className="text-xl font-bold text-slate-950"
              id="calibration-status-title"
            >
              {t('calibration.unavailableTitle')}
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              {t('calibration.unavailableBody')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 p-4 text-sm leading-6 text-teal-950">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={18}
          />
          <p>{t('calibration.noBaselineClaim')}</p>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <Link className="kg-button-secondary" to="/app/monitor">
            {t('calibration.returnToSetup')}
          </Link>
        </div>
      </section>
    </div>
  )
}
