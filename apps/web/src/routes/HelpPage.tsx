import { Camera, CircleHelp, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/PageHeader'

export function HelpPage() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-5xl pb-4">
      <PageHeader title={t('help.title')} subtitle={t('common.noDiagnosis')} />
      <section className="mt-8 grid gap-5 md:grid-cols-2">
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
