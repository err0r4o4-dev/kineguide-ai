import { Navigate, Outlet, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { t } = useTranslation()
  const auth = useAuth()
  const location = useLocation()
  if (!auth.ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-kg-canvas px-4 text-slate-600">
        <p aria-live="polite" className="kg-card">
          {t('common.loading')}
        </p>
      </main>
    )
  }
  if (!auth.user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }
  return <Outlet />
}
