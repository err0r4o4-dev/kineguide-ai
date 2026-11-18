# Authentication feature

Authentication uses short-lived bearer access tokens held in memory and a rotating refresh token stored in an HttpOnly, SameSite cookie. The Go API owns registration, login, refresh, logout, password hashing, authorization, and account deletion. The browser never persists tokens in local storage.

Google and Facebook sign-in use provider authorization-code redirects through the Go API. The callback sets the existing KineGuide refresh cookie and redirects to `/auth/callback`; the web app then uses the normal refresh flow to obtain an access token in memory. Provider tokens are used only long enough to verify the provider-scoped identity and are not stored or sent to the browser. Existing password accounts require an authenticated, explicit link from Settings instead of automatic email-based linking.
