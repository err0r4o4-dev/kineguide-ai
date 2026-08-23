import { useQuery } from '@tanstack/react-query'
import { Activity, Bot, Database, Globe2, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getSystemStatus } from '@/services/system'

type CardState = 'ok' | 'unavailable' | 'unknown'

interface StatusCardProps {
  label: string
  state: CardState
  icon: React.ReactNode
}

export function StatusCard({ label, state, icon }: StatusCardProps) {
  const { t } = useTranslation()
  const text =
    state === 'ok'
      ? t('healthy')
      : state === 'unavailable'
        ? t('unhealthy')
        : t('unknown')
  const color =
    state === 'ok'
      ? 'bg-emerald-100 text-emerald-800'
      : state === 'unavailable'
        ? 'bg-red-100 text-red-800'
        : 'bg-slate-100 text-slate-600'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-xl bg-teal-50 p-3 text-teal-700">{icon}</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}
        >
          {text}
        </span>
      </div>
      <h2 className="mt-6 text-lg font-semibold text-slate-900">{label}</h2>
    </article>
  )
}

export function StatusPage() {
  const { t, i18n } = useTranslation()
  const query = useQuery({
    queryKey: ['system-status'],
    queryFn: ({ signal }) => getSystemStatus(signal),
    refetchInterval: 30_000
  })

  const toggleLanguage = () => {
    const language = i18n.resolvedLanguage === 'th' ? 'en' : 'th'
    void i18n.changeLanguage(language)
    document.documentElement.lang = language
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_36%)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3 font-semibold text-slate-900">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-white">
            K
          </span>
          KineGuide AI
        </div>
        <button
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          onClick={toggleLanguage}
          type="button"
        >
          {t('language')}
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-16">
        <div className="max-w-2xl">
          <p className="font-medium text-teal-700">KineGuide AI</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {t('status')}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{t('subtitle')}</p>
        </div>

        <div aria-live="polite" className="mt-8 min-h-6 text-sm text-slate-600">
          {query.isLoading && t('loading')}
          {query.isError && (
            <div
              className="flex flex-wrap items-center gap-3 text-red-700"
              role="alert"
            >
              <span>{t('error')}</span>
              <button
                className="inline-flex items-center gap-1 font-semibold underline"
                onClick={() => void query.refetch()}
                type="button"
              >
                <RefreshCw aria-hidden="true" size={15} />
                {t('refresh')}
              </button>
            </div>
          )}
        </div>

        <section
          aria-label={t('status')}
          className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatusCard
            icon={<Globe2 aria-hidden="true" />}
            label={t('web')}
            state="ok"
          />
          <StatusCard
            icon={<Activity aria-hidden="true" />}
            label={t('api')}
            state={
              query.isSuccess ? 'ok' : query.isError ? 'unavailable' : 'unknown'
            }
          />
          <StatusCard
            icon={<Bot aria-hidden="true" />}
            label={t('ai')}
            state={query.data?.dependencies.ai_python.status ?? 'unknown'}
          />
          <StatusCard
            icon={<Database aria-hidden="true" />}
            label={t('database')}
            state={query.data?.dependencies.postgres.status ?? 'unknown'}
          />
        </section>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          {t('disclaimer')}
        </footer>
      </main>
    </div>
  )
}
