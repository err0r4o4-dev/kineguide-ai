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
    <header className="relative flex flex-col gap-5 border-b border-[var(--color-kg-border)] pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-7">
      <div className="min-w-0">
        {eyebrow && (
          <p className="inline-flex min-h-8 items-center rounded-full border border-teal-100 bg-white/80 px-3 text-xs font-bold uppercase tracking-[0.12em] text-teal-800 shadow-sm">
            {eyebrow}
          </p>
        )}
        <h1
          className={`${eyebrow ? 'mt-3' : ''} max-w-4xl text-[2rem] font-bold leading-[1.2] tracking-[-0.04em] text-[var(--color-kg-ink)] sm:text-[2.65rem]`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-3xl text-[0.95rem] leading-7 text-[var(--color-kg-muted)] sm:text-base">
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
