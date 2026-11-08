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
    'ความเป็นส่วน'
  )
  await expect(page.getByText(/ไม่อัปโหลดรูปหรือวิดีโอ/)).toBeVisible()
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'KineGuide AI — Privacy-aware sitting monitoring and session tracking.'
  )
  await expect(
    page.getByRole('link', { name: 'เริ่มติดตามการนั่ง', exact: true })
  ).toHaveAttribute('href', '/register')
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
    backgrounds.attachment.split(', ').every((value) => value === 'scroll')
  ).toBe(true)
  expect(backgrounds.hero).toBe('none')
  expect(backgrounds.footer).toBe('none')

  const header = page.getByRole('banner')
  const headerContent = header.locator(':scope > div')
  const initialHeaderBox = await header.boundingBox()
  const initialHeaderContentBox = await headerContent.boundingBox()
  expect(initialHeaderBox?.y).toBe(0)
  expect(initialHeaderBox?.height).toBeLessThanOrEqual(72)
  expect(initialHeaderContentBox?.width).toBeCloseTo(
    (await page.evaluate(() => window.innerWidth)) * 0.7,
    0
  )
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(() => document.fonts.ready)
    const heroBounds = await page
      .locator('#landing-home > .kg-landing-content > *')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect()
          return { left: bounds.left, right: bounds.right }
        })
      )
    for (const bounds of heroBounds) {
      expect(bounds.left).toBeGreaterThanOrEqual(0)
      expect(bounds.right).toBeLessThanOrEqual(width)
    }
    const heroTextBounds = await page
      .locator('#landing-home h1 span, #landing-home p')
      .evaluateAll((elements) =>
        elements.flatMap((element) => {
          const range = document.createRange()
          range.selectNodeContents(element)
          return Array.from(range.getClientRects()).map((bounds) => ({
            text: element.textContent,
            left: bounds.left,
            right: bounds.right
          }))
        })
      )
    for (const bounds of heroTextBounds) {
      expect(bounds.left, bounds.text ?? '').toBeGreaterThanOrEqual(0)
      expect(bounds.right, bounds.text ?? '').toBeLessThanOrEqual(width)
    }
    const responsiveHeaderContentBox = await headerContent.boundingBox()
    if (width >= 1024) {
      expect(responsiveHeaderContentBox?.width).toBeCloseTo(width * 0.7, 0)
    } else {
      expect(responsiveHeaderContentBox?.width).toBeGreaterThan(width * 0.89)
    }
    const landingContentWidths = await page
      .locator('.kg-landing-content')
      .evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().width)
      )
    expect(landingContentWidths.length).toBeGreaterThanOrEqual(4)
    for (const contentWidth of landingContentWidths) {
      if (width >= 1024) {
        expect(contentWidth).toBeCloseTo(width * 0.7, 0)
      } else {
        expect(contentWidth).toBeGreaterThan(width * 0.89)
      }
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width)
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(header).toBeInViewport()
  const scrolledHeaderBox = await header.boundingBox()
  expect(scrolledHeaderBox?.y).toBe(0)
})
