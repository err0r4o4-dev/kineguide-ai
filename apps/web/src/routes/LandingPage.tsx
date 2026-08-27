import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  ShieldCheck
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PublicHeader } from '@/components/layout/PublicHeader'
import { SystemLoading } from '@/components/SystemState'
import { useAuth } from '@/features/auth/AuthContext'
import { finishBrowserRefresh, isBrowserRefresh } from '@/lib/navigation'

export function LandingPage() {
  const { t } = useTranslation()
  const auth = useAuth()
  const suppressRefreshLoading = isBrowserRefresh()

  useEffect(() => {
    if (auth.ready) finishBrowserRefresh()
  }, [auth.ready])

  if (!auth.ready) {
    return suppressRefreshLoading ? null : <SystemLoading />
  }

  const features = [
    {
      icon: Camera,
      title: t('landing.cameraTitle'),
      body: t('landing.cameraBody')
    },
    {
      icon: ShieldCheck,
      title: t('landing.consentTitle'),
      body: t('landing.consentBody')
    },
    {
      icon: ChartNoAxesCombined,
      title: t('landing.progressTitle'),
      body: t('landing.progressBody')
    }
  ]
  return (
    <div className="min-h-screen bg-kg-canvas">
      <PublicHeader />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-semibold tracking-wide text-teal-700">
              {t('landing.eyebrow')}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.16] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.75rem]">
              {t('landing.title')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {t('landing.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="kg-button-primary" to="/register">
                {t('landing.start')} <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a className="kg-button-secondary" href="#features">
                {t('landing.learn')}
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 p-3 shadow-xl shadow-slate-900/10 sm:p-5">
            <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-slate-900 p-6 text-white">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{t('landing.cameraTitle')}</span>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">
                  {t('common.onDevice')}
                </span>
              </div>
              <div className="grid h-[80%] place-items-center">
                <div className="grid size-44 place-items-center rounded-full border border-dashed border-teal-300/60 bg-teal-400/5 sm:size-56">
                  <Camera
                    aria-hidden="true"
                    className="text-teal-200"
                    size={64}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-y border-slate-200/80 bg-white py-16"
          id="features"
        >
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <article className="kg-card p-7 sm:p-8" key={title}>
                <span className="grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
                  <Icon aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  {title}
                </h2>
                <p className="mt-3 leading-7 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-3xl border border-teal-100 bg-teal-50/70 p-7 sm:p-10 md:grid-cols-[180px_1fr] md:items-center">
            <ShieldCheck
              aria-hidden="true"
              className="mx-auto text-teal-700"
              size={108}
            />
            <div>
              <h2 className="text-3xl font-bold text-slate-950">
                {t('landing.privacyTitle')}
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                {t('landing.privacyBody')}
              </p>
              <p className="mt-4 text-sm font-medium text-slate-700">
                {t('common.noDiagnosis')}
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
        {t('landing.footer')}
      </footer>
    </div>
  )
}
