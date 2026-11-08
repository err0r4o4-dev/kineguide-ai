import { expect, test, type Page } from '@playwright/test'

test.use({ timezoneId: 'Asia/Bangkok' })

function records(count = 15) {
  return Array.from({ length: count }, (_, index) => ({
    id: `864cb7ae-64dd-4db4-8200-${String(index).padStart(12, '0')}`,
    activity_slug: 'seated-posture-demo',
    exercise_slug: 'seated-posture-demo',
    activity_kind: 'static_posture',
    measurement_mode: 'observation',
    camera_used: false,
    status: index === 0 ? 'active' : index === 1 ? 'stopped' : 'completed',
    elapsed_seconds: 125,
    manual_cycles: 0,
    manual_repetitions: 0,
    posture_summary: null,
    started_at: new Date(Date.now() - index * 60_000).toISOString(),
    completed_at: index === 0 ? null : new Date().toISOString(),
    retention_until: '2027-11-02T00:00:00Z'
  }))
}

async function installAPI(page: Page, sessions = records()) {
  await page.route('**/*', (route) => {
    const hostname = new URL(route.request().url()).hostname
    return ['127.0.0.1', 'localhost'].includes(hostname)
      ? route.continue()
      : route.abort()
  })
  await page.route('**/v1/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname === '/v1/auth/refresh') {
      await route.fulfill({
        json: {
          access_token: 'synthetic-history-test-token',
          expires_in: 900,
          user: {
            id: '3356dcec-f826-41f1-8dba-f434b74e75c8',
            email: 'history@example.com',
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
}

test('Line chart uses straight segments with no markers and keeps its summary alongside at desktop', async ({
  page
}, testInfo) => {
  const sessions = records(6).map((record, index) => ({
    ...record,
    status: 'completed',
    started_at: new Date(
      Date.now() - Math.floor(index / 2) * 86400000
    ).toISOString()
  }))
  await installAPI(page, sessions)
  await page.goto('/app/history')
  await page.getByRole('button', { name: 'Line', exact: true }).click()
  const chart = page.getByRole('img', {
    name: 'เวลาที่บันทึกแยกตามวันเริ่มเซสชัน'
  })
  await expect(chart.locator('path')).toHaveAttribute('d', / L /)
  await expect(chart.locator('circle')).toHaveCount(0)
  await expect(chart.locator('rect')).toHaveCount(0)
  await page.getByRole('button', { name: 'Bar + Line', exact: true }).click()
  await expect(chart.locator('path')).toHaveAttribute('d', / L /)
  await expect(chart.locator('path')).not.toHaveAttribute('d', / C /)
  await expect(chart.locator('circle')).toHaveCount(0)
  await expect(chart.locator('rect')).toHaveCount(3)
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(chart).toBeVisible()
    await expect(
      page.getByRole('complementary', { name: 'สรุปช่วงเวลา' })
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
    await testInfo.attach(`line-${width}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png'
    })
  }
})

for (const width of [320, 768, 1024, 1440]) {
  test(`history is readable and keyboard-operable at ${width}px`, async ({
    page
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await installAPI(page)
    await page.goto('/app/history')
    await expect(
      page.getByRole('heading', { name: 'ประวัติเซสชัน', level: 1 })
    ).toBeVisible()
    const section = page.getByRole('region', { name: 'รายการเซสชัน' })
    await expect(section.getByRole('link')).toHaveCount(10)
    await expect(
      section
        .getByRole('link')
        .first()
        .getByText('ยังไม่จบเซสชัน', { exact: true })
    ).toBeVisible()
    await expect(section.getByText('เวลาที่บันทึก 2:05').first()).toBeVisible()
    const search = page.getByRole('textbox', { name: 'ค้นหาประวัติ' })
    await search.focus()
    await expect(search).toBeFocused()
    expect(
      await search.evaluate((element) => getComputedStyle(element).outlineStyle)
    ).not.toBe('none')
    await page.keyboard.type('000000000014')
    await expect(section.getByRole('link')).toHaveCount(1)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('combobox', { name: 'ช่วงเวลา' })).toBeFocused()
    await page.getByRole('button', { name: 'ล้างตัวกรอง' }).click()
    await expect(section.getByRole('link')).toHaveCount(10)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
    await testInfo.attach(`history-${width}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png'
    })
  })
}

test('history paginates, filters, refreshes, and opens the matching summary', async ({
  page
}) => {
  await installAPI(page)
  await page.goto('/app/history')
  const section = page.getByRole('region', { name: 'รายการเซสชัน' })
  await expect(section.getByRole('link')).toHaveCount(10)
  await page.getByRole('button', { name: 'หน้าถัดไป' }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(section.getByRole('link')).toHaveCount(5)
  await page
    .getByRole('combobox', { name: 'สถานะเซสชัน' })
    .selectOption('active')
  await expect(section.getByRole('link')).toHaveCount(1)
  await expect(page).toHaveURL(/status=active/)
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'สถานะเซสชัน' })).toHaveValue(
    'active'
  )
  await expect(section.getByRole('link')).toHaveCount(1)
  await section.getByRole('link').click()
  await expect(page).toHaveURL(/summary\/864cb7ae-64dd-4db4-8200-000000000000$/)
  await expect(
    page.getByRole('heading', { name: 'เซสชันติดตามการนั่ง', level: 1 })
  ).toBeVisible()
  await expect(page.getByText('ยังไม่จบเซสชัน', { exact: true })).toBeVisible()
  await expect(page.getByText('หยุดก่อนเสร็จ', { exact: true })).toHaveCount(0)
  await page.goBack()
  await expect(page.getByRole('combobox', { name: 'สถานะเซสชัน' })).toHaveValue(
    'active'
  )
  await page.getByRole('button', { name: 'โหลดประวัติใหม่' }).click()
  await expect(
    page.getByRole('button', { name: 'โหลดประวัติใหม่' })
  ).toBeEnabled()
})

test('history remains readable at 200 percent zoom with reduced motion', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await installAPI(page)
  await page.goto('/app/history')
  await expect(
    page.getByRole('textbox', { name: 'ค้นหาประวัติ' })
  ).toBeVisible()
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.getByText('แหล่งอ้างอิงและขอบเขตข้อมูล', { exact: true }).click()
  await expect(page.getByRole('link', { name: /W3C WCAG 2.2/ })).toBeVisible()
  await expect(
    page.getByRole('link', { name: /MDN Intl.DateTimeFormat/ })
  ).toHaveAttribute('referrerpolicy', 'no-referrer')
})

test('history shows an empty state without invented records', async ({
  page
}) => {
  await installAPI(page, [])
  await page.goto('/app/history')
  await expect(page.getByText('ยังไม่มีประวัติ', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'รายการเซสชัน' }).getByRole('listitem')
  ).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'เริ่มติดตามการนั่ง', exact: true })
  ).toHaveAttribute('href', '/app/monitor')
})
