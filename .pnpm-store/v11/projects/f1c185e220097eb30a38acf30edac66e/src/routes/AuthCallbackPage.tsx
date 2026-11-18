import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'

import { SystemLoading } from '@/components/SystemState'
import { useAuth } from '@/features/auth/AuthContext'
import { minimumLoadingDurationMs } from '@/lib/minimumLoadingDuration'
import { showError } from '@/lib/notification'

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
  const [minimumDurationElapsed, setMinimumDurationElapsed] = useState(false)
  const error = search.get('error')
  const mode = search.get('mode')
  const provider = search.get('provider')

  useEffect(() => {
    const timer = window.setTimeout(
      () => setMinimumDurationElapsed(true),
      minimumLoadingDurationMs
    )
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (error || !auth.ready || !minimumDurationElapsed) return
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
    navigate('/app', { replace: true })
  }, [
    auth.ready,
    auth.user,
    error,
    minimumDurationElapsed,
    mode,
    navigate,
    provider
  ])

  const visibleError = error || (sessionError ? 'session_failed' : '')

  useEffect(() => {
    if (!visibleError) return
    void showError(
      t(errorTranslation[visibleError] ?? 'auth.socialFailed'),
      t('common.close')
    )
    navigate('/login', { replace: true })
  }, [navigate, t, visibleError])

  if (visibleError) return null
  return <SystemLoading />
}
