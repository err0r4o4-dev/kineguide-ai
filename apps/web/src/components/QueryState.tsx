import { useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { AppShellErrorContext } from '@/components/layout/AppShellErrorContext'
import { SystemError } from '@/components/SystemState'

export function QueryError({ retry }: { retry(): void }) {
  const shellError = useContext(AppShellErrorContext)
  const errorID = useRef(Symbol('query-error'))
  const retryRef = useRef(retry)
  retryRef.current = retry

  useEffect(() => {
    if (!shellError) return

    const id = errorID.current
    shellError.showPageError({
      id,
      retry: () => retryRef.current()
    })
    return () => shellError.clearPageError(id)
  }, [shellError])

  if (shellError) return null
  return <SystemError retry={retry} />
}

export function QueryLoading() {
  const { t } = useTranslation()

  return (
    <div
      aria-live="polite"
      className="kg-card mt-6 overflow-hidden p-5 sm:p-6"
      role="status"
    >
      <span className="sr-only">{t('common.loading')}</span>
      <div aria-hidden="true" className="animate-pulse space-y-4">
        <div className="h-4 w-28 rounded-full bg-teal-100" />
        <div className="h-8 w-3/5 rounded-xl bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-24 rounded-2xl bg-slate-100" />
          <div className="h-24 rounded-2xl bg-slate-100" />
          <div className="h-24 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  )
}
