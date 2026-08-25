import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  ShieldCheck
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PublicHeader } from '@/components/layout/PublicHeader'

export function LandingPage() {
  const { t } = useTranslation()
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
    <div className="min-h-screen bg-[#fbfaff]">
      <PublicHeader />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="font-semibold text-teal-700">
              {t('landing.eyebrow')}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-[2.5rem] lg:text-6xl">
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
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 shadow-xl shadow-slate-200/60">
            <div className="aspect-[4/3] rounded-2xl bg-[radial-gradient(circle_at_50%_35%,#5eead4_0,transparent_18%),linear-gradient(145deg,#1e293b,#0f172a)] p-6 text-white">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{t('landing.cameraTitle')}</span>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">
                  {t('common.onDevice')}
                </span>
              </div>
              <div className="grid h-[80%] place-items-center">
                <div className="grid size-44 place-items-center rounded-full border border-dashed border-teal-300/60 sm:size-56">
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
          className="border-y border-slate-200 bg-white py-14"
          id="features"
        >
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <article className="kg-card p-7" key={title}>
                <span className="grid size-12 place-items-center rounded-full bg-teal-50 text-teal-700">
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

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-8 rounded-[2rem] border border-indigo-100 bg-indigo-50 p-8 md:grid-cols-[220px_1fr] md:items-center">
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
      <footer className="border-t border-slate-200 bg-indigo-100/60 px-4 py-8 text-center text-sm text-slate-600">
        {t('landing.footer')}
      </footer>
    </div>
  )
}
