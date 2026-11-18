import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

export function SafetyNotice({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={`mt-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-amber-200 bg-[linear-gradient(135deg,#fffbeb,#fff7db)] px-4 py-4 text-sm leading-6 text-amber-950 shadow-[0_8px_25px_rgb(146_64_14_/_0.05)] sm:px-5 ${className}`}
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-amber-700"
        size={18}
      />
      {children}
    </p>
  )
}
