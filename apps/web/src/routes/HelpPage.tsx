import { Camera, CircleHelp, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/PageHeader'

export function HelpPage() {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader title={t('help.title')} />
      <section className="mt-7 grid gap-5 md:grid-cols-2">
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
    <article className="kg-card p-6">
      <Icon aria-hidden="true" className="text-teal-700" />
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{body}</p>
    </article>
  )
}
