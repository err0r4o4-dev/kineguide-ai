import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-sm font-semibold tracking-wide text-teal-700">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 max-w-4xl text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[2.5rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-3xl text-[0.95rem] leading-7 text-slate-600 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
      )}
    </header>
  )
}
