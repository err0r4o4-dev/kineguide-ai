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
        <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-slate-950">
            {value}
          </p>
        </div>
      </div>
      {detail && (
        <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
      )}
    </article>
  )
}
