import axios from 'axios'

import { env } from '@/lib/env'

export const http = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: { Accept: 'application/json' },
  withCredentials: true
})

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})
