import { expect, test } from '@playwright/test'

test('shows the Thai system status shell', async ({ page }) => {
  await page.route('**/api/v1/system/status', (route) =>
    route.fulfill({
      json: {
        status: 'ok',
        service: 'api-go',
        version: '0.1.0',
        dependencies: {
          postgres: { name: 'postgres', status: 'ok' },
          ai_python: { name: 'ai-python', status: 'ok' }
        }
      }
    })
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'สถานะระบบ' })).toBeVisible()
})
