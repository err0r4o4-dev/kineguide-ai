import { createContext } from 'react'

export type AppShellPageError = {
  id: symbol
  retry: () => void
}

export type AppShellErrorContextValue = {
  clearPageError: (id: symbol) => void
  showPageError: (error: AppShellPageError) => void
}

export const AppShellErrorContext =
  createContext<AppShellErrorContextValue | null>(null)
