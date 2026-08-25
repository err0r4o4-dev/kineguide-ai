import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { Brand } from '@/components/Brand'
import { useAuth } from '@/features/auth/AuthContext'
import { getConsent } from '@/services/product'

const errorTranslation: Record<string, string> = {
  cancelled: 'auth.socialCancelled',
  email_required: 'auth.socialEmailRequired',
  account_link_required: 'auth.linkRequired'
}

export function AuthCallbackPage() {
  const { t } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const [sessionError, setSessionError] = useState(false)
  const error = search.get('error')
  const mode = search.get('mode')
  const provider = search.get('provider')

  useEffect(() => {
    if (error || !auth.ready) return
    if (!auth.user) {
      setSessionError(true)
      return
    }
    if (mode === 'link') {
      navigate(`/app/settings?linked=${encodeURIComponent(provider ?? '')}`, {
        replace: true
      })
      return
    }
    let active = true
    getConsent()
      .then((consent) => {
        if (active) {
          navigate(consent && !consent.revoked_at ? '/app' : '/consent', {
            replace: true
          })
        }
      })
      .catch(() => {
        if (active) navigate('/consent', { replace: true })
      })
    return () => {
      active = false
    }
  }, [auth.ready, auth.user, error, mode, navigate, provider])

  const visibleError = error || (sessionError ? 'session_failed' : '')

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <section className="kg-card w-full max-w-md p-7 text-center sm:p-9">
        <div className="flex justify-center">
          <Brand compact />
        </div>
        <h1 className="mt-7 text-2xl font-bold text-slate-950">
          {t('auth.callbackTitle')}
        </h1>
        {visibleError ? (
          <>
            <p className="kg-alert-danger mt-5 text-left" role="alert">
              {t(errorTranslation[visibleError] ?? 'auth.socialFailed')}
            </p>
            <Link className="kg-button-secondary mt-6" to="/login">
              {t('auth.backToLogin')}
            </Link>
          </>
        ) : (
          <p className="mt-4 text-slate-600" role="status">
            {t('auth.socialLoading')}
          </p>
        )}
      </section>
    </main>
  )
}
