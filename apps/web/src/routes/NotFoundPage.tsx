import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="text-center">
        <p className="text-sm font-semibold tracking-widest text-teal-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          {t('notFound')}
        </h1>
        <Link
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-medium text-white hover:bg-teal-800"
          to="/"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          {t('home')}
        </Link>
      </section>
    </main>
  )
}
