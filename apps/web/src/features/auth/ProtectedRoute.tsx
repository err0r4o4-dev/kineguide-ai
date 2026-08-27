import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { SystemLoading } from '@/components/SystemState'
import { finishBrowserRefresh, isBrowserRefresh } from '@/lib/navigation'

import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()
  const suppressRefreshLoading = isBrowserRefresh()

  useEffect(() => {
    if (auth.ready) finishBrowserRefresh()
  }, [auth.ready])

  if (!auth.ready) {
    return suppressRefreshLoading ? null : <SystemLoading />
  }
  if (!auth.user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }
  return <Outlet />
}
