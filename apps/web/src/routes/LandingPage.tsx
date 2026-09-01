import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  CircleUserRound,
  CirclePlay,
  ClipboardCheck,
  Database,
  LayoutGrid,
  MessageCircle,
  ShieldCheck,
  TriangleAlert
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

  const primaryPath = auth.user ? '/app' : '/register'
  const primaryLabel = t(auth.user ? 'nav.getStarted' : 'landing.start')
  const privacyPoints = [
    {
      icon: Camera,
      title: t('landing.localPrivacyTitle'),
      body: t('landing.localPrivacyBody')
    },
    {
      icon: ClipboardCheck,
      title: t('landing.consentPrivacyTitle'),
      body: t('landing.consentPrivacyBody')
    },
    {
      icon: Database,
      title: t('landing.storagePrivacyTitle'),
      body: t('landing.storagePrivacyBody')
    }
  ]
  const steps = [
    {
      icon: CircleUserRound,
      title: t('landing.accountStepTitle'),
      body: t('landing.accountStepBody')
    },
    {
      icon: ShieldCheck,
      title: t('landing.consentStepTitle'),
      body: t('landing.consentStepBody')
    },
    {
      icon: LayoutGrid,
      title: t('landing.exploreStepTitle'),
      body: t('landing.exploreStepBody')
    }
  ]
  const capabilities = [
    {
      icon: Camera,
      title: t('landing.movementTitle'),
      body: t('landing.movementBody'),
      href: auth.user ? '/app/exercises' : primaryPath
    },
    {
      icon: MessageCircle,
      title: t('landing.aiTitle'),
      body: t('landing.aiBody'),
      href: auth.user ? '/app/chat' : primaryPath
    },
    {
      icon: ChartNoAxesCombined,
      title: t('landing.summaryTitle'),
      body: t('landing.summaryBody'),
      href: auth.user ? '/app/progress' : primaryPath
    }
  ]

  return (
    <div className="kg-landing-page min-h-screen overflow-x-clip bg-kg-canvas">
      <PublicHeader />
      <main id="main-content">
        <section className="relative isolate overflow-hidden">
          <div className="kg-landing-content mx-auto grid items-center gap-10 pb-10 pt-10 sm:pb-12 sm:pt-14 lg:grid-cols-[1fr_auto] lg:gap-16 lg:py-16">
            <div className="min-w-0 lg:py-2">
              <p className="inline-flex min-h-9 items-center rounded-xl border border-teal-100/80 bg-cyan-50/80 px-4 text-sm font-semibold text-teal-700 shadow-sm shadow-teal-900/[0.03]">
                {t('landing.eyebrow')}
              </p>
              <h1
                aria-label={t('landing.title')}
                className="mt-5 max-w-3xl text-[2.25rem] font-bold leading-[1.15] tracking-[-0.04em] sm:text-5xl lg:text-[2.6rem] xl:text-[3.25rem]"
              >
                <span className="block text-slate-900">
                  {t('landing.titleRest')}
                </span>
                <span className="block text-teal-700">
                  {t('landing.titleAccent')}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                {t('landing.subtitle')}
              </p>
              <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                <Link className="kg-landing-primary-cta" to={primaryPath}>
                  {primaryLabel}
                  <ArrowRight aria-hidden="true" size={19} />
                </Link>
                <a className="kg-landing-secondary-cta" href="#how-it-works">
                  {t('landing.learn')}
                  <CirclePlay aria-hidden="true" size={20} />
                </a>
              </div>
            </div>

            <aside
              aria-labelledby="camera-preview-title"
              className="kg-landing-camera-panel mx-auto w-full max-w-[27rem] p-3 sm:p-4 xl:max-w-[32rem]"
            >
              <div className="kg-landing-camera-screen flex aspect-[1.12/1] min-h-[22rem] flex-col rounded-[1.6rem] border border-white/80 p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2
                    className="text-lg font-bold text-slate-900"
                    id="camera-preview-title"
                  >
                    {t('landing.previewTitle')}
                  </h2>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm">
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-emerald-500"
                    />
                    {t('common.onDevice')}
                  </span>
                </div>
                <div className="grid flex-1 place-items-center py-5">
                  <span className="grid size-40 place-items-center rounded-full border border-cyan-100 bg-white/85 text-teal-600 shadow-[0_18px_45px_rgb(15_118_110_/_10%)] sm:size-48">
                    <Camera aria-hidden="true" size={58} strokeWidth={1.7} />
                  </span>
                </div>
                <p className="text-center font-medium leading-7 text-slate-600">
                  {t('landing.cameraPermissionNote')}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section aria-labelledby="privacy-title" className="pb-6 sm:pb-8">
          <div className="kg-landing-content kg-landing-surface mx-auto rounded-[1.75rem] p-6 sm:p-8 lg:rounded-[2rem]">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                {t('landing.highlightsTitle')}
              </p>
              <h2
                className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
                id="privacy-title"
              >
                {t('landing.privacyTitle')}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {t('landing.privacyBody')}
              </p>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {privacyPoints.map(({ icon: Icon, title, body }) => (
                <article className="border-t border-slate-200 pt-5" key={title}>
                  <Icon
                    aria-hidden="true"
                    className="text-teal-700"
                    size={24}
                  />
                  <h3 className="mt-3 font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="how-title"
          className="scroll-mt-24 py-10 sm:py-14"
          id="how-it-works"
        >
          <div className="kg-landing-content mx-auto">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                {t('landing.howEyebrow')}
              </p>
              <h2
                className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
                id="how-title"
              >
                {t('landing.howTitle')}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {t('landing.howBody')}
              </p>
            </div>
            <ol className="mt-8 grid gap-4 lg:grid-cols-3">
              {steps.map(({ icon: Icon, title, body }, index) => (
                <li
                  className="relative rounded-[1.25rem] border border-kg-border bg-white p-6"
                  key={title}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-xl bg-kg-soft text-teal-700">
                      <Icon aria-hidden="true" size={22} />
                    </span>
                    <span className="text-sm font-bold tabular-nums text-teal-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="capabilities-title"
          className="py-10 sm:py-14"
          id="capabilities"
        >
          <div className="kg-landing-content mx-auto">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                {t('landing.capabilitiesEyebrow')}
              </p>
              <h2
                className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
                id="capabilities-title"
              >
                {t('landing.capabilitiesTitle')}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {t('landing.capabilitiesBody')}
              </p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, body, href }) => (
                <article
                  className="flex min-h-64 flex-col rounded-[1.25rem] border border-kg-border bg-white p-6"
                  key={title}
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-kg-soft text-teal-700">
                    <Icon aria-hidden="true" size={23} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {body}
                  </p>
                  <Link
                    aria-label={t('landing.featureAction', { feature: title })}
                    className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 font-bold !text-teal-800 no-underline"
                    to={href}
                  >
                    {auth.user ? t('nav.getStarted') : t('landing.start')}
                    <ArrowRight aria-hidden="true" size={18} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="safety-title" className="py-10 sm:py-14">
          <div className="kg-landing-content mx-auto grid gap-6 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:rounded-[2rem]">
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-amber-800 ring-1 ring-amber-200">
              <TriangleAlert aria-hidden="true" size={24} />
            </span>
            <div>
              <h2
                className="text-2xl font-bold text-slate-950"
                id="safety-title"
              >
                {t('landing.safetyTitle')}
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                {t('common.noDiagnosis')}
              </p>
              <p className="mt-3 font-semibold leading-7 text-red-800">
                {t('landing.safetyStop')}
              </p>
              <p className="mt-2 leading-7 text-slate-700">
                {t('landing.safetyEmergency')}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-transparent">
        <div className="kg-landing-content mx-auto flex flex-col gap-3 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>{t('landing.footerCopyright')}</p>
            <p className="mt-1 max-w-2xl leading-5 text-slate-500">
              {t('landing.footer')}
            </p>
          </div>
          <p className="inline-flex items-center gap-2 font-medium text-slate-600">
            <ShieldCheck
              aria-hidden="true"
              className="text-teal-700"
              size={17}
            />
            {t('landing.footerPrivacyNote')}
          </p>
        </div>
      </footer>
    </div>
  )
}
