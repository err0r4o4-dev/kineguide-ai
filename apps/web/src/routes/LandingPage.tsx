import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  CirclePlay,
  CircleUserRound,
  ClipboardCheck,
  ListChecks,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  TriangleAlert
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
      href: '#how-it-works'
    },
    {
      icon: ShieldCheck,
      title: t('landing.consentTitle'),
      body: t('landing.consentBody'),
      href: '#privacy'
    },
    {
      icon: ChartNoAxesCombined,
      title: t('landing.progressTitle'),
      body: t('landing.progressBody'),
      href: '#capabilities'
    }
  ]
  const steps = [
    {
      icon: CircleUserRound,
      title: t('landing.accountStepTitle'),
      body: t('landing.accountStepBody')
    },
    {
      icon: ClipboardCheck,
      title: t('landing.consentStepTitle'),
      body: t('landing.consentStepBody')
    },
    {
      icon: ListChecks,
      title: t('landing.exploreStepTitle'),
      body: t('landing.exploreStepBody')
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
  const privacyPoints = [
    {
      icon: Camera,
      title: t('landing.localPrivacyTitle'),
      body: t('landing.localPrivacyBody')
    },
    {
      icon: ShieldCheck,
      title: t('landing.consentPrivacyTitle'),
      body: t('landing.consentPrivacyBody')
    },
    {
      icon: LockKeyhole,
      title: t('landing.storagePrivacyTitle'),
      body: t('landing.storagePrivacyBody')
    }
  ]

  return (
    <div className="min-h-screen overflow-hidden bg-kg-canvas">
      <PublicHeader />
      <main id="main-content">
        <section className="kg-landing-hero relative isolate overflow-hidden border-b border-teal-100/70">
          <div
            aria-hidden="true"
            className="absolute -left-44 bottom-[-11rem] -z-10 size-[31rem] rounded-full border-[5rem] border-teal-200/20"
          />
          <div
            aria-hidden="true"
            className="absolute -right-44 bottom-[-18rem] -z-10 size-[38rem] rounded-full border-[6rem] border-slate-200/30"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 lg:px-8 lg:py-12">
            <div className="lg:py-4">
              <p className="inline-flex min-h-9 items-center rounded-xl border border-teal-100/80 bg-cyan-50/80 px-4 text-sm font-semibold text-teal-700 shadow-sm shadow-teal-900/[0.03]">
                {t('landing.eyebrow')}
              </p>
              <h1
                aria-label={t('landing.title')}
                className="mt-5 max-w-3xl text-[2.25rem] font-bold leading-[1.13] tracking-[-0.04em] sm:text-5xl lg:text-[3.65rem]"
              >
                <span className="block text-teal-700">
                  {t('landing.titleAccent')}
                </span>
                <span className="block text-slate-900">
                  {t('landing.titleRest')}
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
              className="kg-landing-camera-panel p-3 sm:p-4"
            >
              <div className="kg-landing-camera-screen flex aspect-[1.3/1] min-h-[23rem] flex-col rounded-[1.6rem] border border-white/80 p-5 sm:min-h-[26rem] sm:p-7">
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
                  <span className="grid size-40 place-items-center rounded-full border border-cyan-100 bg-white/85 text-teal-600 shadow-[0_18px_45px_rgb(15_118_110_/_10%)] sm:size-52">
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

        <section
          aria-labelledby="features-title"
          className="border-b border-slate-200/80 bg-white py-8 sm:py-10"
          id="features"
        >
          <h2 className="sr-only" id="features-title">
            {t('landing.features')}
          </h2>
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:gap-5 lg:px-8">
            {features.map(({ icon: Icon, title, body, href }) => (
              <article
                className="group relative min-h-48 rounded-[1.35rem] border border-slate-200 bg-white p-6 pr-16 shadow-[0_10px_32px_rgb(15_23_42_/_5%)] transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_16px_38px_rgb(15_23_42_/_8%)]"
                key={title}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-kg-soft text-teal-700 ring-1 ring-inset ring-teal-100/70">
                  <Icon aria-hidden="true" size={22} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
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
        </section>

        <section
          aria-labelledby="how-title"
          className="border-b border-slate-200 bg-kg-soft py-16 sm:py-24"
          id="how-it-works"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                {t('landing.howEyebrow')}
              </p>
              <h2
                className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
                id="how-title"
              >
                {t('landing.howTitle')}
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                {t('landing.howBody')}
              </p>
            </div>
            <div className="relative mt-12">
              <span
                aria-hidden="true"
                className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-teal-200 md:block"
              />
              <ol className="relative grid gap-8 md:grid-cols-3 md:gap-10">
                {steps.map(({ icon: Icon, title, body }, index) => (
                  <li
                    className="relative grid grid-cols-[3.5rem_1fr] gap-4 md:block md:text-center"
                    key={title}
                  >
                    <span className="relative z-10 grid size-14 place-items-center rounded-2xl border border-teal-100 bg-white text-teal-700 shadow-sm md:mx-auto">
                      <Icon aria-hidden="true" size={23} />
                      <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                    </span>
                    <div className="md:mt-6">
                      <h3 className="text-lg font-bold text-slate-900">
                        {title}
                      </h3>
                      <p className="mt-2 leading-7 text-slate-600">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="capabilities-title"
          className="bg-white py-16 sm:py-24"
          id="capabilities"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:gap-20">
              <div className="lg:pt-3">
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
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {capabilities.map(({ icon: Icon, title, body }, index) => (
                  <article
                    className="grid gap-4 py-7 sm:grid-cols-[3.25rem_1fr] sm:py-8"
                    key={title}
                  >
                    <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-teal-700">
                      <Icon aria-hidden="true" size={22} />
                    </span>
                    <div>
                      <p className="text-xs font-bold tracking-[0.14em] text-teal-700">
                        0{index + 1}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        {title}
                      </h3>
                      <p className="mt-2 leading-7 text-slate-600">{body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="privacy-title"
          className="bg-kg-canvas py-16 sm:py-24"
          id="privacy"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] border border-teal-900/10 bg-white shadow-[0_18px_55px_rgb(15_23_42_/_6%)] lg:grid lg:grid-cols-[0.86fr_1.14fr]">
              <div className="kg-landing-privacy-panel p-8 text-white sm:p-11 lg:p-14">
                <span className="grid size-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/15">
                  <ShieldCheck aria-hidden="true" size={29} strokeWidth={1.7} />
                </span>
                <h2
                  className="mt-8 text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
                  id="privacy-title"
                >
                  {t('landing.privacyTitle')}
                </h2>
                <p className="mt-4 text-lg leading-8 text-teal-50/90">
                  {t('landing.privacyBody')}
                </p>
              </div>
              <div className="grid gap-7 p-8 sm:p-11 lg:p-14">
                {privacyPoints.map(({ icon: Icon, title, body }) => (
                  <article
                    className="grid grid-cols-[2.9rem_1fr] gap-4"
                    key={title}
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <Icon aria-hidden="true" size={21} />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">{title}</h3>
                      <p className="mt-1 leading-7 text-slate-600">{body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="safety-title"
          className="bg-white py-16 sm:py-20"
          id="safety"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-6 sm:grid-cols-[3.5rem_1fr] sm:p-9">
              <span className="grid size-12 place-items-center rounded-xl bg-amber-100 text-amber-800">
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
                <p className="mt-3 font-medium leading-7 text-slate-800">
                  {t('landing.safetyStop')}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t('landing.safetyEmergency')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="kg-landing-final border-t border-teal-700 py-14 text-white sm:py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-7 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                {t('landing.finalTitle')}
              </h2>
              <p className="mt-3 text-lg leading-8 text-teal-50/90">
                {t('landing.finalBody')}
              </p>
            </div>
            <Link className="kg-landing-final-cta shrink-0" to={primaryPath}>
              {t(auth.user ? 'nav.getStarted' : 'landing.finalAction')}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_1fr] md:items-end lg:px-8">
          <div>
            <Brand />
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
              {t('landing.footer')}
            </p>
          </div>
          <nav
            aria-label={t('landing.footerNav')}
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm md:justify-end"
          >
            <a className="font-medium hover:text-teal-700" href="#how-it-works">
              {t('landing.footerHow')}
            </a>
            <a className="font-medium hover:text-teal-700" href="#privacy">
              {t('common.privacy')}
            </a>
            <a className="font-medium hover:text-teal-700" href="#safety">
              {t('common.safety')}
            </a>
            <Link className="font-medium hover:text-teal-700" to="/status">
              {t('status')}
            </Link>
            {!auth.user && (
              <Link className="font-medium hover:text-teal-700" to="/login">
                {t('auth.signIn')}
              </Link>
            )}
          </nav>
        </div>
      </footer>
    </div>
  )
}
