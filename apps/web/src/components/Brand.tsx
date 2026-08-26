import { HeartPulse } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function Brand({
  compact = false,
  inverted = false
}: {
  compact?: boolean
  inverted?: boolean
}) {
  const { t } = useTranslation()
  return (
    <Link
      aria-label="KineGuide AI"
      className={`inline-flex items-center gap-3 no-underline ${
        inverted ? 'text-white' : 'text-slate-950'
      }`}
      to="/"
    >
      <span
        className={`grid size-10 place-items-center rounded-xl text-white shadow-sm ${
          inverted ? 'bg-white/20' : 'bg-teal-700'
        }`}
      >
        <HeartPulse aria-hidden="true" size={21} />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block whitespace-nowrap text-xl font-bold leading-tight tracking-[-0.02em]">
            KineGuide AI
          </span>
          <span
            className={`mt-1 block whitespace-nowrap text-xs tracking-wide ${
              inverted ? 'text-white/80' : 'text-slate-500'
            }`}
          >
            {t('common.brandSubtitle')}
          </span>
        </span>
      )}
    </Link>
  )
}
