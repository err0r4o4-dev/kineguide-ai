import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function QueryError({ retry }: { retry(): void }) {
  const { t } = useTranslation()
  return (
    <div className="kg-alert-danger" role="alert">
      <span>{t('common.error')}</span>
      <button
        className="ml-3 inline-flex items-center gap-1 font-semibold underline"
        onClick={retry}
        type="button"
      >
        <RefreshCw aria-hidden="true" size={15} />
        {t('common.retry')}
      </button>
    </div>
  )
}

export function QueryLoading() {
  const { t } = useTranslation()
  return (
    <div
      aria-live="polite"
      className="kg-card mt-6 flex items-center gap-3 p-5 text-slate-600"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-teal-700 border-r-transparent motion-reduce:animate-none"
      />
      <p>{t('common.loading')}</p>
    </div>
  )
}
