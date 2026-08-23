import { http } from './http'

export type DependencyState = 'ok' | 'unavailable'

export interface DependencyStatus {
  name: string
  status: DependencyState
  latency_ms?: number
}

export interface SystemStatusResponse {
  status: 'ok' | 'degraded'
  service: 'api-go'
  version: string
  dependencies: {
    postgres: DependencyStatus
    ai_python: DependencyStatus
  }
}

export async function getSystemStatus(signal?: AbortSignal) {
  const response = await http.get<SystemStatusResponse>('/system/status', {
    signal
  })
  return response.data
}
