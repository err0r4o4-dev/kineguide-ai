import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import {
  Camera,
  CircleAlert,
  ExternalLink,
  GitCompareArrows,
  ScanLine,
  ShieldCheck
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { PageHeader } from '@/components/PageHeader'
import {
  researchMeasurementReadinessForExercise,
  SHOULDER_FRONT_RESEARCH_PROFILE
} from '@/features/pose/poseResearchProfiles'

export function CalibrationPage() {
  const { t } = useTranslation()
  const readiness = researchMeasurementReadinessForExercise(
    SHOULDER_FRONT_RESEARCH_PROFILE.exerciseSlug
  )

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

      {readiness.status !== 'unsupported_activity' && (
        <section
          aria-labelledby="research-readiness-title"
          className="kg-card mt-6 p-6 sm:p-8"
        >
          <h2
            className="text-xl font-bold text-slate-950"
            id="research-readiness-title"
          >
            {t('calibration.researchTitle')}
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            {t('calibration.researchIntro')}
          </p>

          <ul className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50 px-4 sm:px-5">
            <ResearchMethodItem icon={ScanLine}>
              {t('calibration.researchLandmarks', {
                count: readiness.expectedLandmarkCount
              })}
            </ResearchMethodItem>
            <ResearchMethodItem icon={GitCompareArrows}>
              {t('calibration.researchComparison')}
            </ResearchMethodItem>
            <ResearchMethodItem icon={Camera}>
              {t('calibration.researchView')}
            </ResearchMethodItem>
          </ul>

          {readiness.status === 'blocked' && (
            <div
              aria-live="polite"
              className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"
              role="status"
            >
              <div className="flex items-start gap-3">
                <CircleAlert
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-amber-700"
                  size={20}
                />
                <div>
                  <p className="font-bold">
                    {t('calibration.researchBlocked')}
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {t('calibration.researchBlockedBody')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="mt-5 text-sm leading-6 text-slate-600">
            {t('calibration.researchBoundary')}
          </p>
          <a
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950"
            href={readiness.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            {t('calibration.researchSource')}
            <ExternalLink aria-hidden="true" size={17} />
          </a>
        </section>
      )}
    </div>
  )
}

function ResearchMethodItem({
  children,
  icon: Icon
}: {
  children: ReactNode
  icon: LucideIcon
}) {
  return (
    <li className="flex items-start gap-3 py-4 text-sm leading-6 text-slate-700">
      <Icon
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-teal-700"
        size={19}
      />
      <span>{children}</span>
    </li>
  )
}
