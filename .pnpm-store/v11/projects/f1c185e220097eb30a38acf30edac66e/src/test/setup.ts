import '@testing-library/jest-dom/vitest'

Object.defineProperty(window.navigator, 'languages', {
  configurable: true,
  get: () => ['th-TH']
})

Object.defineProperty(window.navigator, 'language', {
  configurable: true,
  get: () => 'th-TH'
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false
  })
})

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: () => undefined
})
