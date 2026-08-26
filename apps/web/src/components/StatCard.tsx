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
    <article className="kg-card p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-teal-50 text-teal-800">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </div>
      {detail && (
        <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
      )}
    </article>
  )
}
