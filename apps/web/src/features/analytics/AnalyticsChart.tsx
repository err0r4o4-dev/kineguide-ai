import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { AnalyticsDay } from './sessionAnalytics'

export function AnalyticsChart({ days }: { days: AnalyticsDay[] }) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()
  const locale = i18n.resolvedLanguage === 'th' ? 'th-TH' : 'en-GB'
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
  const shortDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short'
  })
  const numbers = new Intl.NumberFormat(locale)
  const maximum = Math.max(
    60,
    Math.ceil(Math.max(...days.map((day) => day.seconds), 0) / 60) * 60
  )
  const slot = 560 / Math.max(1, days.length)

  return (
    <figure className="mt-5">
      <div
        className="overflow-x-auto rounded-xl border border-slate-200"
        role="region"
        aria-label={t('analytics.chartScroll')}
        tabIndex={0}
      >
        <svg
          className="h-64 w-full min-w-[36rem]"
          viewBox="0 0 640 250"
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <title id={titleId}>{t('analytics.chart')}</title>
          <desc id={descriptionId}>{t('analytics.chartDescription')}</desc>
          {[0, maximum / 2, maximum].map((value) => {
            const position = 210 - (value / maximum) * 180
            return (
              <g key={value}>
                <line
                  x1="65"
                  x2="625"
                  y1={position}
                  y2={position}
                  className="stroke-slate-300"
                />
                <text
                  x="58"
                  y={position + 4}
                  textAnchor="end"
                  className="fill-slate-600 text-xs"
                >
                  {numbers.format(value)}
                </text>
              </g>
            )
          })}
          {days.map((day, index) => {
            const height = (day.seconds / maximum) * 180
            const position = 65 + index * slot
            return (
              <g key={day.date}>
                <rect
                  x={position + slot * 0.15}
                  y={210 - height}
                  width={slot * 0.7}
                  height={height}
                  className="fill-teal-800"
                >
                  <title>
                    {dateFormat.format(day.date)}:{' '}
                    {t('analytics.secondsValue', { count: day.seconds })}
                  </title>
                </rect>
                {(index % Math.max(1, Math.ceil(days.length / 5)) === 0 ||
                  index === days.length - 1) && (
                  <text
                    x={position + slot / 2}
                    y="233"
                    textAnchor="middle"
                    className="fill-slate-600 text-xs"
                  >
                    {shortDate.format(day.date)}
                  </text>
                )}
              </g>
            )
          })}
          <text x="65" y="16" className="fill-slate-600 text-xs">
            {t('analytics.seconds')}
          </text>
        </svg>
      </div>
      <figcaption className="mt-3 text-sm leading-6 text-slate-600">
        {t('analytics.chartDescription')}
      </figcaption>
      <details className="mt-4">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold text-teal-800">
          {t('analytics.table')}
        </summary>
        <div
          className="overflow-x-auto"
          role="region"
          aria-label={t('analytics.table')}
          tabIndex={0}
        >
          <table className="w-full min-w-[24rem] table-fixed text-left text-sm">
            <caption className="pb-3 text-left text-slate-600">
              {t('analytics.chart')}
            </caption>
            <thead>
              <tr className="border-b border-slate-300">
                <th className="w-1/2 py-3 pr-2" scope="col">
                  {t('analytics.date')}
                </th>
                <th className="py-3 pr-2" scope="col">
                  {t('progress.sessions')}
                </th>
                <th className="py-3" scope="col">
                  {t('analytics.seconds')}
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr className="border-b border-slate-100" key={day.date}>
                  <th scope="row" className="py-3 pr-2 font-normal">
                    {dateFormat.format(day.date)}
                  </th>
                  <td className="py-3 pr-2 tabular-nums">
                    {numbers.format(day.count)}
                  </td>
                  <td className="py-3 tabular-nums">
                    {numbers.format(day.seconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
