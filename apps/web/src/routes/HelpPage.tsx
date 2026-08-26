import { Camera, CircleHelp, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/PageHeader'

export function HelpPage() {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader title={t('help.title')} />
      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <HelpCard
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
  icon: Icon,
  title,
  body
}: {
  icon: typeof Camera
  title: string
  body: string
}) {
  return (
    <article className="kg-card p-6 sm:p-7">
      <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
        <Icon aria-hidden="true" size={21} />
      </span>
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{body}</p>
    </article>
  )
}
