import { useTranslation } from 'react-i18next'

import type { BaselineMetricKey, PersonalBaseline } from './seatedCalibration'
import type { RawSeatedMetrics } from './seatedMetrics'

const metricDefinitions: readonly {
  key: BaselineMetricKey
  unit: 'degrees' | 'ratio'
}[] = [
  { key: 'headTiltDegrees', unit: 'degrees' },
  { key: 'shoulderSlopeDegrees', unit: 'degrees' },
  { key: 'torsoInclinationDegrees', unit: 'degrees' },
  { key: 'eyeShoulderDistanceRatio', unit: 'ratio' },
  { key: 'forwardHeadRatio', unit: 'ratio' }
]

export function BaselineReadings({
  baseline,
  metrics
}: {
  baseline: PersonalBaseline
  metrics: RawSeatedMetrics | null
}) {
  const { t } = useTranslation()

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <h3 className="text-sm font-bold text-slate-900">
        {t('session.readings.title')}
      </h3>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        {t('session.readings.explanation')}
      </p>
      {metrics ? (
        <div className="mt-3 space-y-3">
          {metricDefinitions.map(({ key, unit }) => {
            const current = metrics[key]
            const reference = baseline.metrics[key]?.mean ?? null
            const available =
              current !== null &&
              reference !== null &&
              Number.isFinite(current) &&
              Number.isFinite(reference)
            const values = [
              { label: 'current', value: current },
              { label: 'baseline', value: reference },
              {
                label: 'difference',
                value: available ? Math.abs(current - reference) : null
              }
            ]
            const name = t(`session.readings.metrics.${key}`)
            return (
              <div key={key} role="group" aria-label={name}>
                <p className="text-xs font-semibold text-slate-800">{name}</p>
                <dl className="mt-1 grid grid-cols-3 gap-2 text-xs">
                  {values.map(({ label, value }) => (
                    <div key={label} className="min-w-0">
                      <dt className="break-words text-slate-500">
                        {t(`session.readings.${label}`)}
                      </dt>
                      <dd className="mt-1 break-words font-semibold tabular-nums text-slate-900">
                        {available && value !== null
                          ? t(`session.readings.${unit}Value`, {
                              value: value.toFixed(unit === 'degrees' ? 1 : 3)
                            })
                          : t('session.readings.unavailable')}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600">
          {t('session.readings.waiting')}
        </p>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {t('session.readings.limitation')}
      </p>
    </div>
  )
}
