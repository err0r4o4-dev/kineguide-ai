import { expect, test, type Page } from '@playwright/test'

test.use({ timezoneId: 'Asia/Bangkok' })

const now = Date.parse('2026-11-02T05:00:00Z')
const records = Array.from({ length: 14 }, (_, index) => ({
  id: `864cb7ae-64dd-4db4-8200-${String(index).padStart(12, '0')}`,
  status: 'completed',
  elapsed_seconds: index === 0 ? 4000 : index === 1 ? 0 : 60,
  manual_cycles: 0,
  posture_summary: null,
  started_at: new Date(now - index * 86_400_000).toISOString(),
  completed_at: new Date(now - index * 86_400_000).toISOString(),
  retention_until: '2027-11-02T00:00:00Z'
}))

async function installAPI(page: Page, sessions = records) {
  await page.route('**/*', (route) => {
    const hostname = new URL(route.request().url()).hostname
    return ['127.0.0.1', 'localhost'].includes(hostname)
      ? route.continue()
      : route.abort()
  })
  await page.route('**/v1/**', async (route) => {
    const url = new URL(route.request().url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
      await route.abort()
      return
    }
    const pathname = url.pathname
    if (pathname === '/v1/auth/refresh') {
      await route.fulfill({
        json: {
          access_token: 'synthetic-analytics-test-token',
          expires_in: 900,
          user: {
            id: '3356dcec-f826-41f1-8dba-f434b74e75c8',
            email: 'analytics@example.com',
            display_name: 'ผู้ใช้ทดสอบ',
            created_at: '2026-11-01T00:00:00Z'
          }
        }
      })
    } else if (pathname === '/v1/consents/current') {
      await route.fulfill({
        json: {
          consent: {
            id: 'a91da3f1-00ae-4d7c-8ea3-b4e9f2c20d90',
            policy_version: 'prototype-v3',
            camera_processing: true,
            session_summary_storage: true,
            ai_chat_storage: false,
            research_use: false,
            accepted_at: '2026-11-01T00:00:00Z',
            revoked_at: null
          }
        }
      })
    } else if (pathname === '/v1/sessions') {
      await route.fulfill({ json: { sessions } })
    } else if (pathname.startsWith('/v1/sessions/')) {
      const session = sessions.find((record) => pathname.endsWith(record.id))
      await route.fulfill({
        status: session ? 200 : 404,
        json: session ?? { error: { code: 'SESSION_NOT_FOUND' } }
      })
    } else {
      await route.abort()
    }
  })
  await page.clock.setFixedTime(now)
}

for (const width of [320, 768, 1024, 1440]) {
  test(`analytics stays accessible at ${width}px`, async ({
    page
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await installAPI(page)
    await page.goto('/app/analytics')
    await expect(
      page.getByRole('heading', { name: 'สถิติการนั่ง', level: 1 })
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'สรุปตามตัวกรอง' })
    ).toBeVisible()
    await expect(
      page.getByRole('img', { name: 'เวลาที่บันทึกแยกตามวันเริ่มเซสชัน' })
    ).toBeVisible()
    const range = page.getByRole('button', { name: '30 วัน' })
    await range.focus()
    await expect(range).toBeFocused()
    expect(
      await range.evaluate((element) => getComputedStyle(element).outlineStyle)
    ).not.toBe('none')
    await page.keyboard.press('Enter')
    await expect(range).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: '7 วัน' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    await page.getByText('ดูตารางข้อมูลรายวัน', { exact: true }).click()
    await expect(page.getByRole('table')).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
    await testInfo.attach(`analytics-${width}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png'
    })
  })
}

test('range and search keep summary, daily chart, table, and paginated links consistent', async ({
  page
}) => {
  await installAPI(page)
  await page.goto('/app/analytics')
  const summary = page.getByRole('region', { name: 'สรุปตามตัวกรอง' })
  const chart = page.getByRole('img', {
    name: 'เวลาที่บันทึกแยกตามวันเริ่มเซสชัน'
  })
  const sessions = page.getByRole('region', { name: 'ประวัติเซสชัน' })
  await expect(summary.getByText('7', { exact: true })).toBeVisible()
  await expect(
    summary.getByText('1 ชม. 11 น. 40 วิ.', { exact: true })
  ).toBeVisible()
  await expect(sessions.getByRole('link')).toHaveCount(7)
  await page.getByRole('button', { name: '30 วัน' }).click()
  await expect(summary.getByText('14', { exact: true })).toBeVisible()
  await expect(
    summary.getByText('1 ชม. 18 น. 40 วิ.', { exact: true })
  ).toBeVisible()
  await expect(sessions.getByRole('link')).toHaveCount(10)
  await page.getByText('ดูตารางข้อมูลรายวัน', { exact: true }).click()
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(14)
  await expect(chart.locator('rect')).toHaveCount(14)
  const geometry = await chart.locator('rect').evaluateAll((bars) =>
    bars.map((bar) => ({
      height: Number(bar.getAttribute('height')),
      y: Number(bar.getAttribute('y'))
    }))
  )
  expect(geometry.filter((bar) => bar.height === 0)).toHaveLength(1)
  expect(Math.max(...geometry.map((bar) => bar.height))).toBeGreaterThan(175)
  expect(Math.min(...geometry.map((bar) => bar.y))).toBeGreaterThanOrEqual(30)
  await expect(
    page.getByRole('table').getByRole('cell', { name: '4,000', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('table').getByRole('cell', { name: '0', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'หน้าถัดไป' }).click()
  await expect(sessions.getByRole('link')).toHaveCount(4)
  const search = page.getByRole('textbox', { name: 'ค้นหาประวัติ' })
  await search.fill('000000000000')
  await expect(summary.getByText('1', { exact: true })).toBeVisible()
  await expect(
    summary.getByText('1 ชม. 6 น. 40 วิ.', { exact: true }).first()
  ).toBeVisible()
  await expect(sessions.getByRole('link')).toHaveCount(1)
  await expect(chart.locator('rect')).toHaveCount(1)
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(1)
  await expect(
    page.getByRole('table').getByRole('cell', { name: '4,000', exact: true })
  ).toBeVisible()
  await sessions.getByRole('link').click()
  await expect(page).toHaveURL(/summary\/864cb7ae-64dd-4db4-8200-000000000000$/)
})

test('empty analytics has no invented chart or session links', async ({
  page
}) => {
  await installAPI(page, [])
  await page.goto('/app/analytics')
  await expect(
    page
      .getByRole('region', { name: 'สรุปตามตัวกรอง' })
      .getByText('0', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'เวลาที่บันทึกแยกตามวันเริ่มเซสชัน' })
  ).toHaveCount(0)
  await expect(
    page.getByRole('region', { name: 'ประวัติเซสชัน' }).getByRole('link')
  ).toHaveCount(0)
})

test('analytics recovers after a sessions request fails', async ({ page }) => {
  await installAPI(page)
  let failing = true
  await page.route('**/v1/sessions', async (route) => {
    if (
      !['127.0.0.1', 'localhost'].includes(
        new URL(route.request().url()).hostname
      )
    ) {
      await route.abort()
      return
    }
    await route.fulfill(
      failing
        ? { status: 500, json: { error: { code: 'SERVER_ERROR' } } }
        : { json: { sessions: records } }
    )
  })
  await page.goto('/app/analytics')
  const retry = page.getByRole('button', { name: 'ลองอีกครั้ง' })
  await expect(retry).toBeVisible()
  failing = false
  await retry.click()
  await expect(
    page
      .getByRole('region', { name: 'สรุปตามตัวกรอง' })
      .getByText('7', { exact: true })
  ).toBeVisible()
})

test('analytics shows cached data while offline and reconnects', async ({
  page,
  context
}) => {
  await installAPI(page)
  await page.goto('/app/analytics')
  const summary = page.getByRole('region', { name: 'สรุปตามตัวกรอง' })
  await expect(summary.getByText('7', { exact: true })).toBeVisible()
  await context.setOffline(true)
  await expect(
    page.getByRole('status').filter({ hasText: 'ออฟไลน์' })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'โหลดประวัติใหม่' })
  ).toBeDisabled()
  await expect(summary.getByText('7', { exact: true })).toBeVisible()
  await context.setOffline(false)
  await expect(
    page.getByRole('status').filter({ hasText: 'ออฟไลน์' })
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'โหลดประวัติใหม่' })
  ).toBeEnabled()
})

test('analytics controls and text remain usable with doubled root text size', async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await installAPI(page)
  await page.goto('/app/analytics')
  const search = page.getByRole('textbox', { name: 'ค้นหาประวัติ' })
  await expect(search).toBeVisible()
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).fontSize
    )
  ).toBe('32px')
  const menu = page.getByRole('button', { name: /^(เปิด|ปิด)เมนู$/ })
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await expect(
    page
      .getByRole('navigation', { name: 'เมนูหลัก' })
      .getByRole('link', { name: 'สถิติ' })
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()
  const skip = page.getByRole('link', { name: 'ข้ามไปยังเนื้อหาหลัก' })
  await skip.focus()
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.getByRole('button', { name: '30 วัน' }).click()
  await expect(page.getByRole('button', { name: '30 วัน' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await search.fill('000000000000')
  await expect(
    page.getByRole('region', { name: 'ประวัติเซสชัน' }).getByRole('link')
  ).toHaveCount(1)
  await page.getByText('ดูตารางข้อมูลรายวัน', { exact: true }).click()
  await expect(page.getByRole('table')).toBeVisible()
  const tableRegion = page.getByRole('region', { name: 'ดูตารางข้อมูลรายวัน' })
  await tableRegion.focus()
  await expect(tableRegion).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect
    .poll(() => tableRegion.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
  const lastCell = tableRegion.getByRole('cell', { name: '4,000', exact: true })
  await expect
    .poll(
      async () => {
        await page.keyboard.press('ArrowRight')
        return lastCell.evaluate((cell) => {
          const region = cell
            .closest('[role="region"]')!
            .getBoundingClientRect()
          const range = document.createRange()
          range.selectNodeContents(cell)
          const bounds = range.getBoundingClientRect()
          return (
            bounds.left >= region.left - 1 && bounds.right <= region.right + 1
          )
        })
      },
      { timeout: 10000, intervals: [100] }
    )
    .toBe(true)
  await expect(lastCell).toBeVisible()
  expect(
    await lastCell.evaluate((cell) => {
      const range = document.createRange()
      range.selectNodeContents(cell)
      return range.getClientRects().length
    })
  ).toBe(1)
  await testInfo.attach('analytics-text-200', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png'
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  const clipped = await page.locator('main').evaluate((main) => {
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    const failures: string[] = []
    while (walker.nextNode()) {
      const node = walker.currentNode
      const parent = node.parentElement
      if (
        !parent ||
        !node.textContent?.trim() ||
        !parent.getClientRects().length
      )
        continue
      const style = getComputedStyle(parent)
      if (
        style.visibility === 'hidden' ||
        style.display === 'none' ||
        style.clip === 'rect(0px, 0px, 0px, 0px)' ||
        style.clipPath === 'inset(50%)'
      )
        continue
      const range = document.createRange()
      range.selectNodeContents(node)
      const bounds = parent.getBoundingClientRect()
      for (const rect of range.getClientRects()) {
        if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) {
          failures.push(node.textContent.trim().slice(0, 80))
          break
        }
      }
    }
    return failures
  })
  expect(clipped).toEqual([])
})

test('analytics remains usable at 200 percent zoom with reduced motion', async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await installAPI(page)
  await page.goto('/app/analytics')
  await expect(
    page.getByRole('textbox', { name: 'ค้นหาประวัติ' })
  ).toBeVisible()
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
  })
  await page.getByText('ดูตารางข้อมูลรายวัน', { exact: true }).click()
  await expect(page.getByRole('table')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await testInfo.attach('analytics-zoom', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png'
  })
})
