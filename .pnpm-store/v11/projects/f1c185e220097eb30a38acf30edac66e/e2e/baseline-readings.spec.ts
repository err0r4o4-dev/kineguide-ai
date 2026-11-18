import { expect, test } from '@playwright/test'

for (const language of ['th', 'en']) {
  for (const width of [320, 768, 1024, 1440]) {
    test(`baseline readings fit ${width}px in ${language}`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.route('**/baseline-readings?*', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div>
            <script type="module">
              import RefreshRuntime from '/@react-refresh'
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
              await import('/e2e/fixtures/baseline-readings.tsx')
            </script></body></html>`
        })
      )
      await page.goto(`/baseline-readings?language=${language}`)
      const head = page.getByRole('group', {
        name: language === 'th' ? 'มุมเอียงศีรษะ' : 'Head tilt'
      })
      await expect(head.getByText('10.0°', { exact: true })).toBeVisible()
      await expect(head.getByText('-7.0°', { exact: true })).toBeVisible()
      await expect(page.getByRole('group')).toHaveCount(5)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)
      const clipped = await page
        .locator('dt, dd, h3, p')
        .evaluateAll((elements) =>
          elements.some(
            (element) => element.scrollWidth > element.clientWidth + 1
          )
        )
      expect(clipped).toBe(false)
      await page.locator('main').evaluate((element) => {
        element.style.zoom = '2'
      })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)
      expect(
        await page
          .locator('dt, dd, h3, p')
          .evaluateAll((elements) =>
            elements.some(
              (element) => element.scrollWidth > element.clientWidth + 1
            )
          )
      ).toBe(false)
      await page.goto(`/baseline-readings?language=${language}&unavailable`)
      await expect(page.getByRole('group')).toHaveCount(0)
      await expect(
        page.getByText(
          language === 'th'
            ? 'ยังประเมินไม่ได้ — รอข้อมูลที่เชื่อถือได้และ Baseline ที่ใช้ได้'
            : 'Unable to assess — waiting for reliable data and a usable Baseline'
        )
      ).toBeVisible()
    })
  }
}
