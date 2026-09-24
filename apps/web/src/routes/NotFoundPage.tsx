import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="kg-landing-page grid min-h-screen place-items-center p-6">
      <section className="kg-card relative w-full max-w-2xl overflow-hidden p-8 text-center sm:p-14">
        <span
          aria-hidden="true"
          className="absolute -right-14 -top-16 size-48 rounded-full bg-[var(--color-kg-accent)]/25"
        />
        <p className="relative text-sm font-semibold tracking-[0.25em] text-teal-700">
          404
        </p>
        <h1 className="relative mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950">
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
