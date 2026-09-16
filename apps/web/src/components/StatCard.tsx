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
    <article className="kg-card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-[var(--radius-control)] bg-[var(--color-kg-soft)] text-[var(--color-kg-primary)] ring-1 ring-inset ring-[var(--color-kg-border)]">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-kg-muted)]">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-[var(--color-kg-ink)]">
            {value}
          </p>
        </div>
      </div>
      {detail && (
        <p className="mt-3 text-xs leading-5 text-[var(--color-kg-muted)]">{detail}</p>
      )}
    </article>
  )
}
