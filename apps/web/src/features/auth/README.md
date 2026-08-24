# Authentication feature

Authentication uses short-lived bearer access tokens held in memory and a rotating refresh token stored in an HttpOnly, SameSite cookie. The Go API owns registration, login, refresh, logout, password hashing, authorization, and account deletion. The browser never persists tokens in local storage.
