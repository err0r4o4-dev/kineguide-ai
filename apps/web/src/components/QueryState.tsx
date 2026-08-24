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
    <p aria-live="polite" className="kg-card mt-6 p-6 text-slate-600">
      {t('common.loading')}
    </p>
  )
}
