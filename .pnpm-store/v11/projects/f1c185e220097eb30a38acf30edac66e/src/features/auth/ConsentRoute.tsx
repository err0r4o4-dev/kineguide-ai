import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet, useLocation } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { CURRENT_CONSENT_POLICY_VERSION, getConsent } from '@/services/product'

export function ConsentRoute() {
  const location = useLocation()
  const consent = useQuery({
    queryKey: ['consent'],
    queryFn: ({ signal }) => getConsent(signal)
  })

  if (consent.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-kg-canvas px-4 text-slate-600">
        <QueryLoading />
      </main>
    )
  }

  if (consent.isError) {
    return (
      <main className="grid min-h-screen place-items-center bg-kg-canvas px-4 text-slate-600">
        <QueryError retry={() => void consent.refetch()} />
      </main>
    )
  }

  if (
    !consent.data ||
    consent.data.policy_version !== CURRENT_CONSENT_POLICY_VERSION ||
    consent.data.revoked_at ||
    !consent.data.camera_processing ||
    !consent.data.session_summary_storage
  ) {
    return (
      <Navigate replace state={{ from: location.pathname }} to="/consent" />
    )
  }

  return <Outlet />
}
