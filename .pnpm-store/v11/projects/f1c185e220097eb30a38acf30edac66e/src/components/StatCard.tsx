import type { LucideIcon } from 'lucide-react'

export function StatCard({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: LucideIcon
  label: string
  value: string
  detail?: string
}) {
  return (
    <article className="kg-card relative overflow-hidden p-5 sm:p-6">
      <span
        aria-hidden="true"
        className="absolute -right-8 -top-10 size-28 rounded-full bg-[var(--color-kg-accent)]/20"
      />
      <div className="flex items-center gap-3">
        <span className="relative grid size-11 place-items-center rounded-[var(--radius-control)] bg-[var(--color-kg-night)] text-white shadow-sm">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-kg-muted)]">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold tracking-[-0.03em] tabular-nums text-[var(--color-kg-ink)]">
            {value}
          </p>
        </div>
      </div>
      {detail && (
        <p className="mt-3 text-xs leading-5 text-[var(--color-kg-muted)]">
          {detail}
        </p>
      )}
    </article>
  )
}
