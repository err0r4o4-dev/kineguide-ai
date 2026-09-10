import {
  Camera,
  CheckCircle2,
  CircleAlert,
  Cpu,
  LockKeyhole,
  MonitorOff,
  Play
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { useCamera } from '@/features/camera/useCamera'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { createSession, getActivity } from '@/services/product'

export function CameraSetupPage() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const camera = useCamera()
  const activity = useQuery({
    queryKey: ['activity', slug],
    queryFn: ({ signal }) => getActivity(slug, signal)
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const begin = async (cameraUsed: boolean) => {
    setCreating(true)
    setError('')
    try {
      const session = await createSession({
        activity_slug: slug,
        camera_used: cameraUsed
      })
      camera.stop()
      navigate(`/app/sessions/${session.id}/live`)
    } catch {
      setError(t('session.saveFailed'))
    } finally {
      setCreating(false)
    }
  }
  const denied =
    camera.state === 'denied' ||
    camera.state === 'error' ||
    camera.state === 'unsupported'
  if (activity.isLoading) return <QueryLoading />
  if (activity.isError)
    return <QueryError retry={() => void activity.refetch()} />
  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
          {t('camera.title')}
        </h1>
        <p className="mt-2 text-slate-600">{t('camera.subtitle')}</p>
        {activity.data && (
          <p className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
            {t('activities.cameraPlacement', {
              view: t(`activities.views.${activity.data.required_view}`)
            })}
          </p>
        )}
      </header>
      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="kg-card overflow-hidden bg-slate-950 ring-1 ring-slate-900/5">
          <div className="relative aspect-video">
            <video
              aria-label={t('camera.visibility')}
              className="h-full w-full object-cover [transform:scaleX(-1)]"
              muted
              playsInline
              ref={camera.videoRef}
            />
            <div className="pointer-events-none absolute inset-8 rounded-[2rem] border-2 border-dashed border-white/40" />
            {camera.state !== 'ready' && (
              <div className="absolute inset-0 grid place-items-center text-center text-white">
                <div>
                  <Camera aria-hidden="true" className="mx-auto" size={58} />
                  <p className="mt-4 max-w-sm px-5 text-slate-300">
                    {t('camera.instructions')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 bg-slate-900 p-4">
            {camera.state !== 'ready' ? (
              <button
                className="kg-button-primary"
                disabled={camera.state === 'requesting'}
                onClick={() => void camera.start()}
                type="button"
              >
                <Camera aria-hidden="true" />
                {camera.state === 'requesting'
                  ? t('common.loading')
                  : t('camera.start')}
              </button>
            ) : (
              <button
                className="kg-button-secondary border-white/30 bg-white text-slate-900"
                onClick={camera.stop}
                type="button"
              >
                {t('camera.stop')}
              </button>
            )}
          </div>
        </div>
        <aside className="kg-card p-6 sm:p-7">
          <h2 className="text-2xl font-bold">{t('camera.readiness')}</h2>
          <div className="mt-6 space-y-3">
            <Ready
              icon={LockKeyhole}
              ok
              label={t('camera.secure')}
              detail={t('common.onDevice')}
            />
            <Ready
              icon={camera.state === 'ready' ? CheckCircle2 : CircleAlert}
              ok={camera.state === 'ready'}
              label={t('camera.permission')}
              detail={
                camera.state === 'ready'
                  ? t('camera.granted')
                  : denied
                    ? t('camera.denied')
                    : t('camera.waiting')
              }
            />
            <Ready
              icon={Camera}
              ok={camera.state === 'ready'}
              label={t('camera.visibility')}
              detail={
                camera.state === 'ready'
                  ? t('camera.granted')
                  : t('camera.waiting')
              }
            />
            <Ready
              icon={Cpu}
              ok={false}
              label={t('camera.model')}
              detail={t('camera.modelPending')}
            />
          </div>
          {denied && (
            <p className="kg-alert-danger mt-5" role="alert">
              {camera.state === 'unsupported'
                ? t('camera.unsupported')
                : t('camera.denied')}
            </p>
          )}
          {error && (
            <p className="kg-alert-danger mt-5" role="alert">
              {error}
            </p>
          )}
          <div className="mt-6 grid gap-3">
            <button
              className="kg-button-primary w-full"
              disabled={camera.state !== 'ready' || creating}
              onClick={() => void begin(true)}
              type="button"
            >
              <Play aria-hidden="true" />
              {creating ? t('common.loading') : t('camera.continue')}
            </button>
            <button
              className="kg-button-secondary w-full"
              disabled={creating}
              onClick={() => void begin(false)}
              type="button"
            >
              <MonitorOff aria-hidden="true" />
              {t('camera.continueWithoutCamera')}
            </button>
          </div>
        </aside>
      </section>
    </div>
  )
}

function Ready({
  icon: Icon,
  ok,
  label,
  detail
}: {
  icon: typeof Camera
  ok: boolean
  label: string
  detail: string
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${ok ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
    >
      <Icon
        aria-hidden="true"
        className={ok ? 'text-emerald-700' : 'text-slate-500'}
        size={20}
      />
      <div>
        <p className="font-semibold">{label}</p>
        <p className="mt-1 text-xs text-slate-600">{detail}</p>
      </div>
    </div>
  )
}
