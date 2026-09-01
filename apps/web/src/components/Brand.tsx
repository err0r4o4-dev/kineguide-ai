import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { LogoMark } from '@/components/LogoMark'

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
      <LogoMark
        className={
          prominent
            ? 'size-11 drop-shadow-[0_8px_10px_rgb(13_148_136_/_20%)] sm:size-12'
            : 'size-10 drop-shadow-sm'
        }
      />
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
