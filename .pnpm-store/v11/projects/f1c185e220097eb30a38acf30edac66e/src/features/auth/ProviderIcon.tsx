import type { OAuthProvider } from '@/services/product'

export function ProviderIcon({ provider }: { provider: OAuthProvider }) {
  if (provider === 'facebook') {
    return (
      <svg aria-hidden="true" height="22" viewBox="0 0 24 24" width="22">
        <circle cx="12" cy="12" fill="#1877F2" r="11" />
        <path
          d="M13.55 20v-7h2.35l.35-2.73h-2.7V8.53c0-.79.22-1.33 1.35-1.33h1.44V4.76c-.25-.03-1.1-.1-2.1-.1-2.08 0-3.5 1.27-3.5 3.6v2.01H8.4V13h2.34v7h2.81Z"
          fill="#fff"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" height="22" viewBox="0 0 24 24" width="22">
      <path
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.25-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.03v2.61A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.39 13.92A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.31.31-1.92V7.47H3.03A10 10 0 0 0 2 12c0 1.61.39 3.14 1.03 4.53l3.36-2.61Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.95c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.97 5.47l3.36 2.61C7.18 7.71 9.39 5.95 12 5.95Z"
        fill="#EA4335"
      />
    </svg>
  )
}
