import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  ChevronRight,
  CirclePlay,
  HeartPulse,
  MessageCircle,
  ShieldCheck
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Brand } from '@/components/Brand'
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
  const features = [
    {
      icon: Camera,
      title: t('landing.cameraTitle'),
      body: t('landing.cameraBody'),
      href: '#capabilities'
    },
    {
      icon: ShieldCheck,
      title: t('landing.consentTitle'),
      body: t('landing.consentBody'),
      href: primaryPath
    },
    {
      icon: ChartNoAxesCombined,
      title: t('landing.progressTitle'),
      body: t('landing.progressBody'),
      href: '#capabilities'
    }
  ]
  const capabilities = [
    {
      icon: Camera,
      title: t('landing.movementTitle'),
      body: t('landing.movementBody')
    },
    {
      icon: MessageCircle,
      title: t('landing.aiTitle'),
      body: t('landing.aiBody')
    },
    {
      icon: ChartNoAxesCombined,
      title: t('landing.summaryTitle'),
      body: t('landing.summaryBody')
    }
  ]

  return (
    <div className="kg-landing-page min-h-screen overflow-hidden bg-kg-canvas">
      <PublicHeader />
      <main id="main-content">
        <section className="kg-landing-hero relative isolate overflow-hidden">
          <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-14 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-14 lg:pb-6 lg:pt-12">
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
                <a className="kg-landing-secondary-cta" href="#features">
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
          <div
            className="mx-auto max-w-[90rem] rounded-[1.75rem] border border-white/80 bg-white/85 p-4 shadow-[0_18px_55px_rgb(15_23_42_/_5%)] backdrop-blur-sm sm:p-5 lg:rounded-[2rem]"
            id="features"
          >
            <h2 className="sr-only" id="features-title">
              {t('landing.features')}
            </h2>
            <div
              aria-labelledby="features-title"
              className="grid gap-4 md:grid-cols-3 lg:gap-5"
            >
              {features.map(({ icon: Icon, title, body, href }) => (
                <article
                  className="group relative min-h-48 rounded-[1.35rem] border border-slate-200/90 bg-white/95 p-5 pr-14 shadow-[0_8px_24px_rgb(15_23_42_/_4%)] transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_14px_34px_rgb(15_23_42_/_7%)]"
                  key={title}
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-kg-soft text-teal-700 ring-1 ring-inset ring-teal-100/70">
                    <Icon aria-hidden="true" size={22} />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {body}
                  </p>
                  <a
                    aria-label={t('landing.featureAction', { feature: title })}
                    className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-kg-soft text-teal-700 transition-colors group-hover:bg-teal-700 group-hover:text-white"
                    href={href}
                  >
                    <ArrowRight aria-hidden="true" size={19} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="capabilities-title"
          className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-4"
          id="capabilities"
        >
          <div className="mx-auto grid max-w-[90rem] gap-10 rounded-[1.75rem] border border-white/90 bg-white/85 p-7 shadow-[0_18px_55px_rgb(15_23_42_/_5%)] backdrop-blur-sm sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:rounded-[2rem]">
            <div className="relative flex min-h-[24rem] flex-col lg:min-h-0">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                  {t('landing.capabilitiesEyebrow')}
                </p>
                <h2
                  className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
                  id="capabilities-title"
                >
                  {t('landing.capabilitiesTitle')}
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {t('landing.capabilitiesBody')}
                </p>
              </div>
              <div
                aria-hidden="true"
                className="relative mt-auto hidden h-44 items-end justify-center overflow-hidden lg:flex"
              >
                <span className="absolute bottom-2 size-40 rounded-full bg-teal-50/80 blur-sm" />
                <span className="relative mb-4 grid size-28 place-items-center rounded-[2rem] bg-white text-teal-600 shadow-[0_18px_38px_rgb(15_118_110_/_14%)] ring-1 ring-teal-100">
                  <HeartPulse size={58} strokeWidth={1.55} />
                </span>
                <span className="absolute bottom-6 left-10 grid size-11 place-items-center rounded-2xl bg-teal-100 text-teal-600">
                  <MessageCircle size={23} />
                </span>
                <span className="absolute bottom-6 right-8 flex h-14 items-end gap-1.5">
                  <i className="h-5 w-3 rounded-t bg-teal-100" />
                  <i className="h-9 w-3 rounded-t bg-teal-200" />
                  <i className="h-14 w-3 rounded-t bg-teal-400/60" />
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {capabilities.map(({ icon: Icon, title, body }, index) => (
                <article
                  className="group grid grid-cols-[3.25rem_minmax(0,1fr)_2.75rem] items-start gap-4 py-4 first:pt-0 last:pb-0"
                  key={title}
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-kg-soft text-teal-700">
                    <Icon aria-hidden="true" size={22} />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-teal-700">
                      0{index + 1}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {body}
                    </p>
                  </div>
                  <Link
                    aria-label={t('landing.featureAction', { feature: title })}
                    className="mt-5 grid size-11 place-items-center rounded-full bg-kg-soft text-slate-800 transition-colors hover:bg-teal-700 hover:text-white"
                    to={primaryPath}
                  >
                    <ChevronRight aria-hidden="true" size={19} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.4),#ffffff_38%)]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-[1.35fr_auto] md:items-center">
            <div>
              <Brand />
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                {t('landing.footer')}
              </p>
            </div>
            <nav
              aria-label={t('landing.footerNav')}
              className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-medium text-slate-600 md:justify-end"
            >
              <a
                className="inline-flex min-h-11 items-center hover:text-teal-700"
                href="#features"
              >
                {t('landing.learn')}
              </a>
              <a
                className="inline-flex min-h-11 items-center hover:text-teal-700"
                href="#capabilities"
              >
                {t('landing.capabilitiesEyebrow')}
              </a>
              {!auth.user && (
                <Link
                  className="inline-flex min-h-11 items-center text-teal-700 hover:text-teal-900"
                  to="/login"
                >
                  {t('auth.signIn')}
                </Link>
              )}
            </nav>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/80 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>{t('landing.footerCopyright')}</p>
            <p className="inline-flex items-center gap-2 font-medium text-slate-600">
              <ShieldCheck
                aria-hidden="true"
                className="text-teal-700"
                size={17}
              />
              {t('landing.footerPrivacyNote')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
