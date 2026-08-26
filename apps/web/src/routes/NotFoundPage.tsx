import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="grid min-h-screen place-items-center bg-kg-canvas p-6">
      <section className="kg-card w-full max-w-lg p-8 text-center sm:p-12">
        <p className="text-sm font-semibold tracking-widest text-teal-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          {t('notFound')}
        </h1>
        <Link className="kg-button-primary mt-7" to="/">
          <ArrowLeft aria-hidden="true" size={18} />
          {t('home')}
        </Link>
      </section>
    </main>
  )
}
