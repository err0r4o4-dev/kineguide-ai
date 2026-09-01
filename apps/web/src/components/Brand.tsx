import { HeartPulse } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function Brand({
  compact = false,
  inverted = false,
  prominent = false
}: {
  compact?: boolean
  inverted?: boolean
  prominent?: boolean
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
        className={`grid place-items-center text-white ${
          prominent
            ? 'size-11 rounded-[0.9rem] bg-[linear-gradient(135deg,#0891b2,#2dd4bf_58%,#6ee7b7)] shadow-[0_8px_20px_rgb(13_148_136_/_22%)] sm:size-12'
            : 'size-10 rounded-xl shadow-sm'
        } ${prominent ? '' : inverted ? 'bg-white/20' : 'bg-teal-700'}`}
      >
        <HeartPulse aria-hidden="true" size={prominent ? 24 : 21} />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span
            className={`block whitespace-nowrap font-bold leading-tight tracking-[-0.02em] ${
              prominent ? 'text-[1.35rem]' : 'text-xl'
            }`}
          >
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
