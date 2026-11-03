# Session history

`/app/history` reads the existing authenticated `GET /v1/sessions` endpoint and
serves as the unified **History & Analytics** destination in primary navigation
alongside `/app/analytics`. No database, authorization, consent, retention, or
public API contract changes are made by this history work.

## Behavior and limits

- The API currently returns at most 50 owned sessions, newest first. The history
  page states this limit; client-side pagination does not retrieve older records.
  See `services/api-go/internal/handler/product.go` (`listSessions`) and
  `services/api-go/internal/repository/postgres.go` (`ListSessions`).
- Search matches the loaded session ID, localized date, ISO timestamp, or status.
  Search text stays in component memory, not browser storage or URL parameters.
- Date ranges include today and the preceding 6, 29, or 89 local calendar days.
  Date range, status, and page are URL state; invalid values use safe defaults.
- Saved elapsed time is displayed on mobile and desktop. It is not assumed to be
  assessed posture time. An `active` record means the session has not ended, not
  proof that a camera or monitor is currently running.
- Empty history, no filter matches, initial loading/failure, retry, offline
  loading, and failed background refresh have separate messages.
- Detail links open the matching existing session summary. Status is text, not
  color-only. Unknown posture measurements remain unavailable in the summary.
- The page does not request camera access, upload media, add persistent caches,
  or automatically contact reference websites. Reference links suppress the
  referrer.

## Reference basis

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/): 1.4.1 Use of Color,
  1.4.10 Reflow, 2.1.1 Keyboard, 2.4.6 Headings and Labels, 2.4.7 Focus Visible,
  and 4.1.3 Status Messages guide the relevant interactions.
- [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat):
  locale-sensitive date formatting and default device time zone.
- `packages/contracts/openapi/kineguide-api.yaml`: `listSessions`, `getSession`,
  and `Session` define the source data and status values.

These references are implementation guidance, not a claim of complete WCAG,
privacy-law, clinical, or medical-device compliance. HTTP-mocked browser tests
verify frontend behavior, not a live PostgreSQL/API integration or production
availability.

## Local verification

- `corepack pnpm --filter @kineguide/web exec vitest run src/routes/HistoryPage.test.tsx`
- `corepack pnpm --filter @kineguide/web test:e2e history.spec.ts`
- Run the repository web format, lint, typecheck, test, and build checks.

Browser checks use synthetic data only, including 320, 768, 1024, and 1440 pixel
layouts, keyboard focus, date/status controls, pagination, summary navigation,
and a 200 percent CSS-zoom check with reduced motion. CSS zoom is a layout smoke
check, not a replacement for assistive-technology or native browser-zoom audits.
