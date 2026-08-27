import { SystemError } from '@/components/SystemState'

export function QueryError({ retry }: { retry(): void }) {
  return <SystemError retry={retry} />
}

export function QueryLoading() {
  return null
}
