import { expect, test } from '@playwright/test'

const id = '864cb7ae-64dd-4db4-8200-000000000001'

for (const width of [320, 768, 1024, 1440]) {
  test(`session retry fetches fresh data without reloading at ${width}px`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 900 })
    let sessionRequests = 0
    let recover = false
    let releaseResponse = () => undefined
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve
    })
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url())
      return ['127.0.0.1', 'localhost'].includes(url.hostname)
        ? route.continue()
        : route.abort()
    })
    await page.route('**/v1/**', async (route) => {
      const path = new URL(route.request().url()).pathname
      if (path === '/v1/auth/refresh') {
        await route.fulfill({
          json: {
            access_token: 'synthetic-test-token',
            expires_in: 900,
            user: {
              id,
              email: 'test@example.com',
              display_name: 'ผู้ใช้ทดสอบ',
              created_at: '2026-11-04T00:00:00Z'
            }
          }
        })
      } else if (path === '/v1/consents/current') {
        await route.fulfill({
          json: {
            consent: {
              id,
              policy_version: 'prototype-v3',
              camera_processing: true,
              session_summary_storage: true,
              ai_chat_storage: false,
              research_use: false,
              accepted_at: '2026-11-04T00:00:00Z',
              revoked_at: null
            }
          }
        })
      } else if (path === `/v1/sessions/${id}`) {
        sessionRequests += 1
        if (!recover) {
          await route.fulfill({
            status: 503,
            json: { error: { code: 'SERVICE_UNAVAILABLE' } }
          })
          return
        }
        await responseGate
        await route.fulfill({
          json: {
            id,
            status: 'completed',
            elapsed_seconds: 90,
            manual_cycles: 0,
            posture_summary: null,
            started_at: '2026-11-04T00:00:00Z',
            completed_at: '2026-11-04T00:01:30Z',
            retention_until: '2027-11-04T00:01:30Z'
          }
        })
      } else {
        await route.abort()
      }
    })

    await page.goto(`/app/sessions/${id}/summary`)
    const retry = page.getByRole('button', { name: 'ลองอีกครั้ง' })
    await expect(retry).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
    const beforeRetry = sessionRequests
    await page.evaluate(() => {
      Object.defineProperty(window, '__retryPageMarker', { value: true })
    })
    recover = true
    await retry.focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => sessionRequests).toBe(beforeRetry + 1)
    await expect(page.getByRole('status')).toContainText('กำลังโหลด')
    releaseResponse()
    await expect(page.getByText('1:30', { exact: true })).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
    expect(
      await page.evaluate(() => Reflect.get(window, '__retryPageMarker'))
    ).toBe(true)
    expect(sessionRequests).toBe(beforeRetry + 1)
  })
}
