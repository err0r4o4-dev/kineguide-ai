let refreshBootstrap: boolean | undefined
let routeRefreshBootstrap: boolean | undefined

function detectBrowserRefresh() {
  const navigation = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined

  return navigation?.type === 'reload'
}

export function isBrowserRefresh() {
  if (refreshBootstrap !== undefined) return refreshBootstrap

  refreshBootstrap = detectBrowserRefresh()
  return refreshBootstrap
}

export function finishBrowserRefresh() {
  refreshBootstrap = false
}

export function isRouteRefresh() {
  routeRefreshBootstrap ??= detectBrowserRefresh()
  return routeRefreshBootstrap
}

export function finishRouteRefresh() {
  routeRefreshBootstrap = false
}
