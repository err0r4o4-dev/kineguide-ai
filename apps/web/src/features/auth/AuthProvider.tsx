import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  loginAccount,
  logoutAccount,
  refreshAccount,
  registerAccount,
  type User
} from '@/services/product'
import { setAccessToken } from '@/services/http'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  const applyAuth = useCallback(
    (result: { access_token: string; user: User }) => {
      setAccessToken(result.access_token)
      setUser(result.user)
    },
    []
  )

  useEffect(() => {
    let active = true
    refreshAccount()
      .then((result) => {
        if (active) applyAuth(result)
      })
      .catch(() => {
        setAccessToken(null)
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [applyAuth])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      async login(input) {
        applyAuth(await loginAccount(input))
      },
      async register(input) {
        applyAuth(await registerAccount(input))
      },
      async logout() {
        try {
          await logoutAccount()
        } finally {
          setAccessToken(null)
          setUser(null)
        }
      },
      clearSession() {
        setAccessToken(null)
        setUser(null)
      }
    }),
    [applyAuth, ready, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
