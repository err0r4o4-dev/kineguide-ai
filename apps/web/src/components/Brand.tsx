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
        inverted ? 'text-white' : 'text-teal-800'
      }`}
      to="/"
    >
      <span
        className={`grid size-10 place-items-center rounded-full text-white ${
          inverted ? 'bg-white/20' : 'bg-teal-700'
        }`}
      >
        <HeartPulse aria-hidden="true" size={21} />
      </span>
      {!compact && (
        <span>
          <span className="block text-xl font-bold">KineGuide AI</span>
          <span
            className={`block text-xs tracking-wide ${
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
