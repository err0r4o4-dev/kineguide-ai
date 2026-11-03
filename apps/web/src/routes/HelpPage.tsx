import {
  Activity,
  ArrowRight,
  Bell,
  Camera,
  CircleHelp,
  Monitor,
  ShieldAlert
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'

export function HelpPage() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-5xl pb-6">
      <PageHeader
        eyebrow={t('help.eyebrow')}
        title={t('help.title')}
        subtitle={t('common.noDiagnosis')}
      />

      <section
        aria-labelledby="help-ergonomic-title"
        className="kg-card mt-8 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--color-kg-night)] text-[var(--color-kg-accent)]">
              <Monitor aria-hidden="true" size={23} />
            </span>
            <div>
              <h2
                className="text-xl font-bold text-slate-950"
                id="help-ergonomic-title"
              >
                {t('help.ergonomicTitle')}
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                {t('help.ergonomicBody')}
              </p>
            </div>
          </div>
          <Link
            className="kg-button-primary shrink-0 self-start"
            to="/app/monitor"
          >
            {t('help.openMonitorAction')}
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          <li className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 text-sm leading-6 text-slate-700">
            {t('help.framingUpperBody')}
          </li>
          <li className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 text-sm leading-6 text-slate-700">
            {t('help.framingFullTorso')}
          </li>
        </ul>
      </section>

      <section
        aria-labelledby="help-states-title"
        className="kg-card mt-6 p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--color-kg-soft)] text-[var(--color-kg-primary)]">
            <Activity aria-hidden="true" size={23} />
          </span>
          <div>
            <h2
              className="text-xl font-bold text-slate-950"
              id="help-states-title"
            >
              {t('help.statesTitle')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t('help.statesBody')}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
            <h3 className="font-bold text-emerald-950">
              {t('help.stateGoodTitle')}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {t('help.stateGoodBody')}
            </p>
          </article>
          <article className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <h3 className="font-bold text-amber-950">
              {t('help.stateAdjustTitle')}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {t('help.stateAdjustBody')}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">
              {t('help.stateUncertainTitle')}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t('help.stateUncertainBody')}
            </p>
          </article>
        </div>
      </section>

      <section
        aria-labelledby="help-reminders-title"
        className="kg-card mt-6 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--color-kg-night)] text-[var(--color-kg-accent)]">
              <Bell aria-hidden="true" size={22} />
            </span>
            <div>
              <h2
                className="text-xl font-bold text-slate-950"
                id="help-reminders-title"
              >
                {t('help.remindersTitle')}
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                {t('help.remindersBody')}
              </p>
            </div>
          </div>
          <Link
            className="kg-button-secondary shrink-0 self-start"
            to="/app/settings"
          >
            {t('help.openSettingsAction')}
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <HelpCard
          featured
          icon={Camera}
          title={t('camera.title')}
          body={t('help.camera')}
        />
        <HelpCard
          icon={ShieldAlert}
          title={t('common.safety')}
          body={t('help.safety')}
        />
        <HelpCard
          icon={CircleHelp}
          title={t('common.emergency')}
          body={t('help.contact')}
        />
      </section>

      <SafetyNotice className="mt-6">{t('common.noDiagnosis')}</SafetyNotice>
    </div>
  )
}

function HelpCard({
  body,
  featured = false,
  icon: Icon,
  title
}: {
  icon: typeof Camera
  title: string
  body: string
  featured?: boolean
}) {
  return (
    <article
      className={`kg-card p-6 sm:p-7 ${featured ? 'border-amber-200 bg-[linear-gradient(145deg,#fffbeb,#fff)] md:col-span-2' : ''}`}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-[var(--color-kg-night)] text-[var(--color-kg-accent)]">
        <Icon aria-hidden="true" size={21} />
      </span>
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{body}</p>
    </article>
  )
}
