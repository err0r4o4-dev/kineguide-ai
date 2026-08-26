import { RefreshCw, Wifi, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'

const updateCheckIntervalMs = 60_000

export function PwaUpdateNotice() {
  const { t } = useTranslation()
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const [registrationReady, setRegistrationReady] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateFailed, setUpdateFailed] = useState(false)
  const [registrationFailed, setRegistrationFailed] = useState(false)

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(_serviceWorkerUrl, registration) {
      registrationRef.current = registration ?? null
      setRegistrationReady(Boolean(registration))
    },
    onRegisterError() {
      setRegistrationFailed(true)
    }
  })

  const checkForUpdate = useCallback(() => {
    if (!navigator.onLine) return

    void registrationRef.current?.update().catch(() => {
      setRegistrationFailed(true)
    })
  }, [])

  useEffect(() => {
    if (!registrationReady) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    }

    window.addEventListener('focus', checkForUpdate)
    window.addEventListener('online', checkForUpdate)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const intervalId = window.setInterval(checkForUpdate, updateCheckIntervalMs)

    return () => {
      window.removeEventListener('focus', checkForUpdate)
      window.removeEventListener('online', checkForUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(intervalId)
    }
  }, [checkForUpdate, registrationReady])

  const activateUpdate = async () => {
    setIsUpdating(true)
    setUpdateFailed(false)
    try {
      await updateServiceWorker(true)
    } catch {
      setUpdateFailed(true)
      setIsUpdating(false)
    }
  }

  if (!needRefresh && !offlineReady && !registrationFailed) return null

  const isError = updateFailed || registrationFailed

  return (
    <aside
      aria-live={isError ? 'assertive' : 'polite'}
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-md rounded-2xl border border-teal-200 bg-white p-4 shadow-lg sm:right-6 sm:left-auto sm:m-0"
      role={isError ? 'alert' : 'status'}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 rounded-full bg-teal-50 p-2 text-teal-700"
          aria-hidden="true"
        >
          {offlineReady && !needRefresh ? (
            <Wifi size={20} />
          ) : (
            <RefreshCw size={20} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-950">
            {needRefresh ? t('pwa.updateTitle') : t('pwa.offlineTitle')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {isError
              ? t('pwa.updateFailed')
              : needRefresh
                ? t('pwa.updateBody')
                : t('pwa.offlineBody')}
          </p>
          {needRefresh || registrationFailed ? (
            <button
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-70"
              disabled={isUpdating}
              onClick={
                registrationFailed && !needRefresh
                  ? () => window.location.reload()
                  : activateUpdate
              }
              type="button"
            >
              {isUpdating
                ? t('pwa.updating')
                : isError
                  ? t('pwa.retryUpdate')
                  : t('pwa.updateNow')}
            </button>
          ) : null}
        </div>
        {offlineReady && !needRefresh ? (
          <button
            aria-label={t('pwa.dismiss')}
            className="grid min-h-11 min-w-11 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            onClick={() => setOfflineReady(false)}
            type="button"
          >
            <X size={20} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </aside>
  )
}
