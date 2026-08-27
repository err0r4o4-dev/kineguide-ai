import { Navigate, Outlet, useLocation } from 'react-router'
import { SystemLoading } from '@/components/SystemState'

import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()
  if (!auth.ready) {
    return <SystemLoading progress={68} />
  }
  if (!auth.user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }
  return <Outlet />
}
