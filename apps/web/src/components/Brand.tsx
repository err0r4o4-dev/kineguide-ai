import { HeartPulse } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  return (
    <Link
      aria-label="KineGuide AI"
      className="inline-flex items-center gap-3 text-teal-800 no-underline"
      to="/"
    >
      <span className="grid size-10 place-items-center rounded-full bg-teal-700 text-white">
        <HeartPulse aria-hidden="true" size={21} />
      </span>
      {!compact && (
        <span>
          <span className="block text-xl font-bold">KineGuide AI</span>
          <span className="block text-xs tracking-wide text-slate-500">
            {t('common.brandSubtitle')}
          </span>
        </span>
      )}
    </Link>
  )
}
