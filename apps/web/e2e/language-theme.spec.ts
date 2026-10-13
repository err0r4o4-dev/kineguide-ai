import { expect, test } from '@playwright/test'

for (const scenario of [
  { locale: 'th-TH', expected: 'th' },
  { locale: 'en-US', expected: 'en' },
  { locale: 'ja-JP', expected: 'en' }
]) {
  test.describe(`browser locale ${scenario.locale}`, () => {
    test.use({ locale: scenario.locale })

    test('starts in the supported browser language or English fallback', async ({
      page
    }, testInfo) => {
      await page.goto('/')

      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        scenario.expected
      )
      await expect(
        page.getByRole('button', {
          name: scenario.expected === 'th' ? 'ไทย' : 'English',
          exact: true
        })
      ).toHaveAttribute('aria-pressed', 'true')
      await page.setViewportSize({ width: 320, height: 900 })
      await page.screenshot({
        path: testInfo.outputPath(`theme-locale-${scenario.locale}.png`),
        fullPage: true
      })
    })
  })
}

test('uses the first supported entry in the browser preference list', async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', {
      get: () => ['fr-FR', 'th-TH', 'en-US']
    })
  })
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'th')
})

test('starts in English when browser preferences cannot be read', async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', {
      get: () => {
        throw new Error('Browser preferences unavailable')
      }
    })
  })
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('changes language without storage, keeps it across navigation, and resets on reload', async ({
  page
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.addInitScript(() => {
    for (const storageName of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(window, storageName, {
        get: () => {
          throw new DOMException('Storage denied', 'SecurityError')
        }
      })
    }
  })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'th')

  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.locator('header a[href="/login"]').click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'th')
  expect(pageErrors).toEqual([])
})

for (const width of [320, 768, 1024, 1440]) {
  test(`previous theme and responsive controls at ${width}px`, async ({
    page
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const primaryAction = page.locator('a.kg-landing-primary-cta').first()

    await expect(primaryAction).toHaveCSS(
      'background-image',
      'linear-gradient(135deg, rgb(11, 107, 92), rgb(17, 134, 117))'
    )
    await expect(primaryAction).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#0f766e'
    )
    await expect(page.locator('header a[href="/register"]')).toHaveCSS(
      'background-color',
      'oklch(0.511 0.096 186.391)'
    )
    await primaryAction.focus()
    await expect(primaryAction).toHaveCSS('outline-style', 'solid')
    await expect(primaryAction).toHaveCSS('outline-color', 'rgb(20, 184, 166)')
    await expect(primaryAction).toHaveCSS('outline-width', '3px')
    await expect(primaryAction).toHaveCSS('outline-offset', '3px')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width)
    await page.screenshot({
      path: testInfo.outputPath(`theme-landing-${width}.png`),
      fullPage: true
    })

    await page.goto('/login')
    const submitAction = page.locator('button[type="submit"]')
    await expect(submitAction).toHaveCSS(
      'background-image',
      'linear-gradient(135deg, rgb(11, 107, 92), rgb(17, 134, 117))'
    )
    await expect(submitAction).toHaveCSS('color', 'rgb(255, 255, 255)')
    await submitAction.focus()
    await expect(submitAction).toHaveCSS('outline-color', 'rgb(20, 184, 166)')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width)
    await page.screenshot({
      path: testInfo.outputPath(`theme-login-${width}.png`),
      fullPage: true
    })
  })
}
