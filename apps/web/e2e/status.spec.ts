import { expect, test } from '@playwright/test'

test('shows the Thai system status shell', async ({ page }) => {
  await page.route('**/v1/system/status', (route) =>
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
  await page.goto('/status')
  await expect(page.getByRole('heading', { name: 'สถานะระบบ' })).toBeVisible()
})

test('landing page explains privacy before authentication', async ({
  page
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'สำรวจการเคลื่อนไหว'
  )
  await expect(page.getByText(/ไม่อัปโหลดรูปหรือวิดีโอ/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'เริ่มใช้งาน' })).toHaveAttribute(
    'href',
    '/register'
  )
  const backgrounds = await page.evaluate(() => ({
    page: getComputedStyle(document.querySelector('.kg-landing-page')!)
      .backgroundImage,
    attachment: getComputedStyle(document.querySelector('.kg-landing-page')!)
      .backgroundAttachment,
    hero: getComputedStyle(document.querySelector('main > section')!)
      .backgroundImage,
    footer: getComputedStyle(document.querySelector('footer')!).backgroundImage
  }))
  expect(backgrounds.page).not.toBe('none')
  expect(
    backgrounds.attachment.split(', ').every((value) => value === 'fixed')
  ).toBe(true)
  expect(backgrounds.hero).toBe('none')
  expect(backgrounds.footer).toBe('none')

  const header = page.getByRole('banner')
  const initialHeaderBox = await header.boundingBox()
  expect(initialHeaderBox?.y).toBe(0)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(header).toBeInViewport()
  const scrolledHeaderBox = await header.boundingBox()
  expect(scrolledHeaderBox?.y).toBe(0)
})
