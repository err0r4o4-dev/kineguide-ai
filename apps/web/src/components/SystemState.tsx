import { Check, Circle, HeartPulse, Home, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

function PoseOrbit({ error = false }: { error?: boolean }) {
  return (
    <div aria-hidden="true" className="relative mx-auto size-48 sm:size-56">
      <svg
        className="kg-pose-orbit size-full overflow-visible"
        viewBox="0 0 240 240"
      >
        <g
          className="kg-orbit-ring"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M54 76C82 24 169 20 192 74" />
          <path d="M198 106c14 62-20 105-82 99" />
          <path d="M87 201C25 181 25 109 52 82" />
          <circle cx="55" cy="73" fill="currentColor" r="5" />
          <circle cx="198" cy="106" fill="currentColor" r="5" />
          <circle cx="88" cy="202" fill="currentColor" r="5" />
        </g>
        <g
          className="text-teal-600"
          fill="currentColor"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="5"
        >
          <circle cx="122" cy="69" r="10" stroke="none" />
          <circle cx="122" cy="94" r="8" stroke="none" />
          <circle cx="109" cy="137" r="8" stroke="none" />
          <path d="m122 103-9 26m-1-23-31 17m42-17 29 8m-43 31-31 20m34-20 25 25m-59-5-24 17m83-12-21 25" />
          {[
            ['81', '123'],
            ['152', '114'],
            ['78', '165'],
            ['54', '182'],
            ['137', '170'],
            ['116', '195']
          ].map(([cx, cy]) => (
            <circle
              cx={cx}
              cy={cy}
              key={`${cx}-${cy}`}
              r="6"
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </g>
      </svg>
      {error && (
        <span className="absolute right-3 top-16 grid size-11 place-items-center rounded-full border-4 border-white bg-red-500 text-2xl font-bold text-white shadow-lg">
          !
        </span>
      )}
    </div>
  )
}

export function SystemLoading({
  progress = 68,
  contained = false
}: {
  progress?: number
  contained?: boolean
}) {
  const { t } = useTranslation()
  const targetProgress = Math.max(0, Math.min(99, progress))
  const [value, setValue] = useState(Math.min(18, targetProgress))

  useEffect(() => {
    const timer = window.setTimeout(() => setValue(targetProgress), 50)
    return () => window.clearTimeout(timer)
  }, [targetProgress])
  const content = (
    <section
      className={`mx-auto flex max-w-3xl flex-col items-center justify-center py-8 text-center ${contained ? 'min-h-[60vh]' : 'min-h-[calc(100vh-7rem)]'}`}
      role="status"
      aria-live="polite"
    >
      <PoseOrbit />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {t('common.systemLoadingTitle')}
      </h1>
      <p className="mt-3 text-slate-600 sm:text-lg">
        {t('common.systemLoadingBody')}
      </p>
      <div className="mt-8 flex w-full max-w-2xl items-center gap-4">
        <div
          aria-label={t('common.loadingProgress')}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={value}
          className="h-3 flex-1 overflow-hidden rounded-full bg-teal-100 ring-1 ring-teal-200"
          role="progressbar"
        >
          <span
            className="block h-full rounded-full bg-teal-600 shadow-[0_0_18px_rgba(13,148,136,0.35)] transition-[width] duration-[1200ms] ease-out motion-reduce:transition-none"
            style={{ width: `${value}%` }}
          />
        </div>
        <strong className="w-12 text-left text-teal-800">{value}%</strong>
      </div>
      <ol className="mt-7 grid w-full max-w-2xl gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <LoadingStep done label={t('common.loadingConnect')} />
        <LoadingStep active label={t('common.loadingPrepare')} />
        <LoadingStep label={t('common.loadingReady')} />
      </ol>
      <p className="mt-9 text-sm text-slate-500">{t('common.loadingWait')}</p>
    </section>
  )
  if (contained) return content
  return (
    <main className="relative min-h-screen overflow-hidden bg-kg-canvas px-4 py-6">
      <div
        className="inline-flex items-center gap-3 text-slate-950"
        aria-label="KineGuide AI"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-white shadow-sm">
          <HeartPulse aria-hidden="true" size={21} />
        </span>
        <strong className="text-xl tracking-tight">KineGuide AI</strong>
      </div>
      {content}
    </main>
  )
}

function LoadingStep({
  active = false,
  done = false,
  label
}: {
  active?: boolean
  done?: boolean
  label: string
}) {
  const Icon = done ? Check : Circle
  return (
    <li
      className={`flex items-center justify-center gap-2 ${active || done ? 'font-semibold text-teal-800' : ''}`}
    >
      <span
        className={`grid size-7 place-items-center rounded-full ${done ? 'bg-teal-700 text-white' : active ? 'border-2 border-teal-600 bg-white text-teal-600' : 'text-slate-300'}`}
      >
        <Icon aria-hidden="true" size={16} />
      </span>
      {label}
    </li>
  )
}

export function SystemError({ retry }: { retry(): void }) {
  const { t } = useTranslation()
  return (
    <section
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-10 text-center"
      role="alert"
    >
      <PoseOrbit error />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {t('common.dataErrorTitle')}
      </h1>
      <p className="mt-3 max-w-xl whitespace-pre-line text-slate-600 sm:text-lg">
        {t('common.dataErrorBody')}
      </p>
      <div className="mt-7 flex w-full max-w-lg flex-col gap-3 sm:flex-row">
        <button
          className="kg-button-primary flex-1"
          onClick={retry}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={18} />
          {t('common.retry')}
        </button>
        <Link className="kg-button-secondary flex-1" to="/">
          <Home aria-hidden="true" size={18} />
          {t('home')}
        </Link>
      </div>
    </section>
  )
}
