import {
  Armchair,
  Eye,
  Footprints,
  MoveRight,
  MoveUp,
  PersonStanding,
  ScanLine
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const activityStages = {
  'seated-posture-demo': [Armchair, Eye, ScanLine],
  'standing-posture-demo': [PersonStanding, Eye, ScanLine],
  'sit-to-stand-demo': [Armchair, MoveUp, PersonStanding],
  'walking-demo': [PersonStanding, Footprints, MoveRight]
} as const

export function ActivityDemonstration({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const icons = activityStages[slug as keyof typeof activityStages]

  if (!icons) {
    return (
      <div className="grid aspect-video place-items-center bg-slate-100 text-slate-600">
        {t('activities.demoUnavailable')}
      </div>
    )
  }

  return (
    <figure
      aria-label={t(`activities.items.${slug}.visualLabel`)}
      className="grid aspect-video grid-cols-3 items-center gap-2 bg-slate-50 p-4 sm:gap-4 sm:p-6"
      role="img"
    >
      {icons.map((Icon, index) => (
        <div className="flex min-w-0 items-center gap-2" key={index}>
          <div className="grid min-h-24 flex-1 place-items-center rounded-2xl border border-teal-100 bg-white text-teal-800 sm:min-h-32">
            <Icon aria-hidden="true" className="size-10 sm:size-14" />
            <span className="text-xs font-semibold text-slate-600">
              {t('activities.stage', { count: index + 1 })}
            </span>
          </div>
          {index < icons.length - 1 && (
            <MoveRight
              aria-hidden="true"
              className="hidden shrink-0 text-slate-400 sm:block"
              size={18}
            />
          )}
        </div>
      ))}
    </figure>
  )
}
