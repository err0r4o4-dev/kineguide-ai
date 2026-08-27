let refreshBootstrap: boolean | undefined

export function isBrowserRefresh() {
  if (refreshBootstrap !== undefined) return refreshBootstrap

  const navigation = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined

  refreshBootstrap = navigation?.type === 'reload'
  return refreshBootstrap
}

export function finishBrowserRefresh() {
  refreshBootstrap = false
}
