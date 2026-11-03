# Session analytics

`/app/analytics` and `/app/history` summarize sessions returned by the existing
`GET /v1/sessions` endpoint under the unified **History & Analytics** primary
navigation item. It uses the same selected records for the summary, daily chart,
and session list. The page does not introduce an API, database, or authorization
change.

## Data and filters

- The API returns at most 50 owned sessions, ordered by `started_at` descending.
  This limit applies before analytics excludes active or invalid records and
  before date or search filtering. `All` means all eligible records in that
  response, not all sessions ever recorded.
- Analytics includes `completed` and `stopped` records. It excludes other
  statuses, future or invalid `started_at` values, and durations that are
  missing, null, negative, or not safe integers. The client retains its zero
  fallback for a missing or null `elapsed_seconds`, but marks the raw duration
  invalid so analytics excludes the record.
- The 7, 30, and 90 day ranges include today and the preceding 6, 29, and 89
  local calendar days, respectively, based on `started_at`. Search matches the
  session ID, timestamp, localized date, displayed session name, or localized
  status. Range and search are URL parameters; changing either resets the page.
- The summary shows the number of selected sessions, the sum of their saved
  elapsed seconds, and the mean rounded to the nearest second. With no selected
  sessions, the mean is unavailable. Durations display hours, minutes, and
  seconds.
- Daily totals group each session under its local start date, in ascending order;
  a session crossing midnight is not split. A day absent from the response is
  not evidence of no activity.

The page reports offline status even when cached results are displayed and
disables refresh while offline. Results can be refreshed after reconnection.

## Chart and interpretation

The chart displays every selected daily group as an SVG column. Columns share a
zero baseline and a scale whose maximum is the largest daily total rounded up to
the next minute, with a minimum scale maximum of 60 seconds. Zero values have
zero height. The chart scroll region is keyboard focusable. The expandable daily
table gives dates, session counts, and seconds, with a minimum width of `24rem`.
Its labelled, keyboard-focusable region supports horizontal scrolling when the
available width is smaller, preserving space for headers and numeric values.

Elapsed time is not a posture measurement. Missing posture measurements remain
unmeasured; these totals do not establish a posture ratio or clinical outcome.
The page adds no camera media upload or new persistent storage. Search text is
included in the page URL as `q`.

## References

- [W3C: Complex images](https://www.w3.org/WAI/tutorials/images/complex/)
  describes text alternatives for charts.
- [ONS: Bar charts](https://service-manual.ons.gov.uk/data-visualisation/chart-types/bar-charts)
  discusses zero baselines and columns for time series.
- [W3C: Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
  explains the WCAG 2.2 criterion for graphical objects and controls.
- [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
  explains the WCAG 2.2 reflow criterion.

WCAG 2.2 AA is a target, not a certification or a claim of complete conformance.
Synthetic tests do not establish deployed behavior or live database integration.

## Source and validation

`apps/web/src/features/analytics/sessionAnalytics.ts` owns selection and
aggregation; `AnalyticsChart.tsx` renders the chart and table; and
`apps/web/src/routes/ProgressPage.tsx` applies search and connects the page.
`apps/web/src/services/product.ts` maps the response. The limit and ordering are
in `services/api-go/internal/handler/product.go` (`listSessions`) and
`services/api-go/internal/repository/postgres.go` (`ListSessions`).

Relevant tests are `apps/web/src/features/analytics/sessionAnalytics.test.ts`,
`apps/web/src/routes/ProgressPage.test.tsx`, and
`apps/web/e2e/analytics.spec.ts`. Validation results are tracked separately;
listing these files does not assert that a test or deployment check passed.
