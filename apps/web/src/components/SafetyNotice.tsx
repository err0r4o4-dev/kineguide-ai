import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

export function SafetyNotice({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950 sm:px-5">
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-amber-700"
        size={18}
      />
      {children}
    </p>
  )
}
