import { useContext, useEffect, useRef } from 'react'

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
  return null
}
