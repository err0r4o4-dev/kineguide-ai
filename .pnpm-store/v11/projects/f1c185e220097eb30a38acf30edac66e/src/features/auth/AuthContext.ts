import { createContext, useContext } from 'react'

import type { User } from '@/services/product'

export interface AuthContextValue {
  user: User | null
  ready: boolean
  login(input: { email: string; password: string }): Promise<void>
  register(input: {
    email: string
    password: string
    display_name: string
  }): Promise<void>
  logout(): Promise<void>
  clearSession(): void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
