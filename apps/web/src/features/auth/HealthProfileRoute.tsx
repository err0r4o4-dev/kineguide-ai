import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet, useLocation } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { getHealthProfile } from '@/services/product'

export function HealthProfileRoute() {
  const location = useLocation()
  const profile = useQuery({
    queryKey: ['health-profile'],
    queryFn: ({ signal }) => getHealthProfile(signal)
  })

  if (profile.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-kg-canvas px-4 text-slate-600">
        <QueryLoading />
      </main>
    )
  }

  if (profile.isError) {
    return (
      <main className="grid min-h-screen place-items-center bg-kg-canvas px-4 text-slate-600">
        <QueryError retry={() => void profile.refetch()} />
      </main>
    )
  }

  if (!profile.data) {
    return (
      <Navigate replace state={{ from: location.pathname }} to="/onboarding" />
    )
  }

  return <Outlet />
}
