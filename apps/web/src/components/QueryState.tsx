import { useState } from 'react'

import { SystemError, SystemLoading } from '@/components/SystemState'
import { isBrowserRefresh } from '@/lib/navigation'

export function QueryError({ retry }: { retry(): void }) {
  return <SystemError retry={retry} />
}

export function QueryLoading() {
  const [suppressRefreshLoading] = useState(isBrowserRefresh)

  if (suppressRefreshLoading) return null
  return <SystemLoading contained />
}
