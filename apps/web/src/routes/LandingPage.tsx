import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  CheckCircle2,
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
        <section className="relative isolate border-b border-teal-100/80 bg-white py-12 sm:py-16 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute -left-24 top-24 -z-10 size-72 rounded-full bg-teal-100/70 blur-3xl sm:size-96"
          />
          <div
            aria-hidden="true"
            className="absolute -right-32 bottom-0 -z-10 size-80 rounded-full bg-cyan-50 blur-3xl sm:size-[30rem]"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
            <div>
              <p className="inline-flex min-h-8 items-center rounded-full border border-teal-100 bg-teal-50 px-4 text-sm font-semibold text-teal-700">
                {t('landing.eyebrow')}
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.16] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.5rem]">
                {t('landing.title')}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                {t('landing.subtitle')}
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                <Link className="kg-button-primary" to={primaryPath}>
                  {primaryLabel}
                  <ArrowRight aria-hidden="true" size={18} />
                </Link>
                <a className="kg-button-secondary" href="#how-it-works">
                  {t('landing.learn')}
                </a>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
                {t('landing.heroNote')}
              </p>
            </div>

            <aside
              aria-labelledby="camera-preview-title"
              className="rounded-[2rem] border border-white bg-slate-100/85 p-3 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/80 sm:p-5"
            >
              <div className="rounded-[1.5rem] border border-white bg-white/75 p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2
                    className="text-lg font-bold text-slate-900"
                    id="camera-preview-title"
                  >
                    {t('landing.previewTitle')}
                  </h2>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-emerald-500"
                    />
                    {t('common.onDevice')}
                  </span>
                </div>
                <div className="grid min-h-64 place-items-center py-6 sm:min-h-72">
                  <span className="grid size-40 place-items-center rounded-full border border-teal-100 bg-white text-teal-600 shadow-lg shadow-teal-900/5 sm:size-52">
                    <Camera aria-hidden="true" size={58} strokeWidth={1.7} />
                  </span>
                </div>
                <p className="text-center font-medium leading-7 text-slate-700">
                  {t('landing.cameraPermissionNote')}
                </p>
                <ul className="mt-5 grid gap-3 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600 sm:grid-cols-2">
                  <li className="flex gap-2">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-teal-700"
                      size={18}
                    />
                    {t('landing.previewLocal')}
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-teal-700"
                      size={18}
                    />
                    {t('landing.previewControl')}
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section
          aria-labelledby="highlights-title"
          className="bg-white py-14 sm:py-16"
          id="features"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                {t('landing.features')}
              </p>
              <h2
                className="mt-3 text-3xl font-bold tracking-[-0.025em] text-slate-950 sm:text-4xl"
                id="highlights-title"
              >
                {t('landing.highlightsTitle')}
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                {t('landing.highlightsBody')}
              </p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <article className="kg-card p-6 sm:p-7" key={title}>
                  <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
                    <Icon aria-hidden="true" size={22} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="how-title"
          className="border-y border-slate-200 bg-kg-soft py-14 sm:py-20"
          id="how-it-works"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                {t('landing.howEyebrow')}
              </p>
              <h2
                className="mt-3 text-3xl font-bold tracking-[-0.025em] text-slate-950 sm:text-4xl"
                id="how-title"
              >
                {t('landing.howTitle')}
              </h2>
              <p className="mt-4 max-w-lg text-lg leading-8 text-slate-600">
                {t('landing.howBody')}
              </p>
            </div>
            <ol className="grid gap-4">
              {steps.map(({ icon: Icon, title, body }, index) => (
                <li
                  className="grid grid-cols-[3rem_1fr] gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[3.5rem_1fr] sm:p-6"
                  key={title}
                >
                  <span className="relative grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-700 sm:size-14">
                    <Icon aria-hidden="true" size={23} />
                    <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-1 leading-7 text-slate-600">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="capabilities-title"
          className="bg-white py-14 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                  {t('landing.capabilitiesEyebrow')}
                </p>
                <h2
                  className="mt-3 text-3xl font-bold tracking-[-0.025em] text-slate-950 sm:text-4xl"
                  id="capabilities-title"
                >
                  {t('landing.capabilitiesTitle')}
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {t('landing.capabilitiesBody')}
                </p>
              </div>
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {capabilities.map(({ icon: Icon, title, body }) => (
                  <article
                    className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr] sm:py-7"
                    key={title}
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-slate-100 text-teal-700">
                      <Icon aria-hidden="true" size={22} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
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
          className="bg-kg-canvas py-14 sm:py-20"
          id="privacy"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[1.75rem] border border-teal-900/10 bg-white lg:grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="bg-teal-800 p-7 text-white sm:p-10 lg:p-12">
                <ShieldCheck aria-hidden="true" size={48} strokeWidth={1.7} />
                <h2
                  className="mt-7 text-3xl font-bold tracking-[-0.025em] sm:text-4xl"
                  id="privacy-title"
                >
                  {t('landing.privacyTitle')}
                </h2>
                <p className="mt-4 text-lg leading-8 text-teal-50/90">
                  {t('landing.privacyBody')}
                </p>
              </div>
              <div className="grid gap-6 p-7 sm:p-10 lg:p-12">
                {privacyPoints.map(({ icon: Icon, title, body }) => (
                  <article
                    className="grid grid-cols-[2.75rem_1fr] gap-4"
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
          className="bg-white py-14 sm:py-16"
          id="safety"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:grid-cols-[3rem_1fr] sm:p-8">
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

        <section className="border-t border-teal-700 bg-teal-800 py-14 text-white sm:py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-7 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                {t('landing.finalTitle')}
              </h2>
              <p className="mt-3 text-lg leading-8 text-teal-50/90">
                {t('landing.finalBody')}
              </p>
            </div>
            <Link
              className="kg-button-secondary shrink-0 border-white bg-white text-teal-800 hover:bg-teal-50"
              to={primaryPath}
            >
              {t(auth.user ? 'nav.getStarted' : 'landing.finalAction')}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="max-w-2xl">{t('landing.footer')}</p>
          <nav
            aria-label={t('landing.footerNav')}
            className="flex flex-wrap gap-5"
          >
            <a className="font-medium hover:text-teal-700" href="#privacy">
              {t('common.privacy')}
            </a>
            <a className="font-medium hover:text-teal-700" href="#safety">
              {t('common.safety')}
            </a>
            <Link className="font-medium hover:text-teal-700" to="/status">
              {t('status')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
