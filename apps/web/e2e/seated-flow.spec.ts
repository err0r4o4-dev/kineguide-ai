import { expect, test, type Page } from '@playwright/test'

const id = '864cb7ae-64dd-4db4-8200-000000000001'
const session = {
  id,
  status: 'active',
  manual_cycles: 0,
  elapsed_seconds: 0,
  posture_summary: null,
  started_at: '2026-11-01T00:00:00Z',
  completed_at: null,
  retention_until: '2027-11-01T00:00:00Z'
}

async function installFixtures(page: Page) {
  let saveAttempts = 0
  const savedPayloads: unknown[] = []
  await page.addInitScript(() => {
    let calls = 0
    Object.defineProperty(window, '__cameraCalls', { get: () => calls })
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          calls += 1
          if (calls === 1) throw new DOMException('Denied', 'NotAllowedError')
          const canvas = document.createElement('canvas')
          canvas.width = 640
          canvas.height = 480
          return canvas.captureStream(5)
        }
      }
    })
  })
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    return ['127.0.0.1', 'localhost'].includes(url.hostname)
      ? route.continue()
      : route.abort()
  })
  await page.route('**/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (path === '/v1/auth/refresh') {
      await route.fulfill({
        json: {
          access_token: 'synthetic-test-token',
          expires_in: 900,
          user: {
            id,
            email: 'test@example.com',
            display_name: 'ผู้ใช้ทดสอบ',
            created_at: session.started_at
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
            accepted_at: session.started_at,
            revoked_at: null
          }
        }
      })
    } else if (path === '/v1/sessions' && request.method() === 'POST') {
      await route.fulfill({ status: 201, json: session })
    } else if (path === `/v1/sessions/${id}` && request.method() === 'PATCH') {
      savedPayloads.push(request.postDataJSON())
      saveAttempts += 1
      await route.fulfill(
        saveAttempts === 1
          ? { status: 503, json: { error: { code: 'SERVICE_UNAVAILABLE' } } }
          : {
              json: {
                ...session,
                status: 'completed',
                completed_at: session.started_at
              }
            }
      )
    } else if (path === `/v1/sessions/${id}` && request.method() === 'GET') {
      await route.fulfill({
        json:
          saveAttempts > 1
            ? {
                ...session,
                status: 'completed',
                completed_at: session.started_at
              }
            : session
      })
    } else {
      await route.abort()
    }
  })
  return { savedPayloads }
}

async function cameraCalls(page: Page) {
  return page.evaluate(
    () => (window as unknown as { __cameraCalls: number }).__cameraCalls
  )
}

for (const width of [320, 768, 1024, 1440]) {
  test(`seated setup is responsive and keyboard operable at ${width}px`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await installFixtures(page)
    await page.goto('/app/monitor/calibration')
    await expect(page).toHaveURL('/app/monitor')
    await expect(
      page.getByRole('heading', { name: 'ตั้งค่ากล้องสำหรับโหมดนั่ง' })
    ).toBeVisible()
    const confirmation = page.getByRole('checkbox', {
      name: 'ฉันจะใช้กล้องขณะนั่งและจัดเฟรมให้เห็นจุดอ้างอิงตามคำแนะนำ'
    })
    const start = page.getByRole('button', { name: 'เริ่มติดตามการนั่ง' })
    await expect(start).toBeDisabled()
    await confirmation.focus()
    await expect(confirmation).toBeFocused()
    await page.keyboard.press('Space')
    await expect(confirmation).toBeChecked()
    await page.keyboard.press('Tab')
    await expect(start).toBeFocused()
    await expect(start).toBeEnabled()
    expect(await cameraCalls(page)).toBe(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  })
}

test('explicit camera start, denial and retry, and save failure and retry preserve uncertainty', async ({
  page
}) => {
  const { savedPayloads } = await installFixtures(page)
  await page.goto('/app/monitor')
  await page
    .getByRole('checkbox', {
      name: 'ฉันจะใช้กล้องขณะนั่งและจัดเฟรมให้เห็นจุดอ้างอิงตามคำแนะนำ'
    })
    .check()
  await page.getByRole('button', { name: 'เริ่มติดตามการนั่ง' }).click()
  await expect(page).toHaveURL(`/app/sessions/${id}/live`)
  await expect(
    page.getByRole('heading', { name: 'ติดตามขณะนั่งแบบเรียลไทม์' })
  ).toBeVisible()
  await expect(
    page.getByText(
      'โหมดนั่งเป็นการยืนยันโดยผู้ใช้ ระบบยังไม่ตรวจจับการนั่งหรือยืนอัตโนมัติและไม่สามารถระบุระยะเวลาได้'
    )
  ).toBeVisible()
  expect(await cameraCalls(page)).toBe(0)
  await page.getByRole('button', { name: 'เปิดกล้องสำหรับโหมดนั่ง' }).click()
  await expect(
    page.getByText('ไม่ได้รับสิทธิ์ใช้งานกล้อง').first()
  ).toBeVisible()
  expect(await cameraCalls(page)).toBe(1)
  await page.getByRole('button', { name: 'เปิดกล้องสำหรับโหมดนั่ง' }).click()
  await expect.poll(() => cameraCalls(page)).toBe(2)
  await page.getByRole('button', { name: 'จบเซสชัน' }).click()
  await expect(page.getByRole('alert')).toContainText('บันทึกเซสชันไม่สำเร็จ')
  expect(savedPayloads).toHaveLength(1)
  expect(savedPayloads[0]).toMatchObject({
    status: 'completed',
    posture_summary: null
  })
  await page
    .getByRole('alert')
    .getByRole('button', { name: 'ลองอีกครั้ง' })
    .click()
  await expect(page).toHaveURL(`/app/sessions/${id}/summary`)
  await expect(
    page.getByText('ไม่มีผลวิเคราะห์การนั่งสำหรับเซสชันนี้')
  ).toBeVisible()
  expect(savedPayloads).toHaveLength(2)
  expect(savedPayloads[1]).toMatchObject({
    status: 'completed',
    posture_summary: null
  })
})

test.describe('English uncertainty', () => {
  test.use({ locale: 'en-US' })
  test('explains that sitting classification is unavailable', async ({
    page
  }) => {
    await installFixtures(page)
    await page.goto(`/app/sessions/${id}/live`)
    await expect(
      page.getByText(
        'Seated mode is user-confirmed. Automatic sitting and standing detection and durations are unavailable.'
      )
    ).toBeVisible()
    expect(await cameraCalls(page)).toBe(0)
  })
})

for (const language of ['th', 'en'] as const) {
  test.describe(`summary coverage in ${language}`, () => {
    test.use({ locale: language === 'th' ? 'th-TH' : 'en-US' })
    test('shows assessed, unreliable, and unobserved time', async ({
      page
    }) => {
      await installFixtures(page)
      await page.route(`**/v1/sessions/${id}`, (route) =>
        route.fulfill({
          json: {
            ...session,
            status: 'completed',
            elapsed_seconds: 120,
            completed_at: session.started_at,
            posture_summary: {
              good_alignment_seconds: 40,
              needs_adjustment_seconds: 20,
              unassessed_seconds: 15,
              alert_count: 1,
              break_count: 0,
              framing_mode: 'upper_body',
              method_version: 'seated-baseline-v1'
            }
          }
        })
      )
      await page.goto(`/app/sessions/${id}/summary`)
      await expect(
        page.getByText(
          language === 'th' ? 'ระยะเวลาที่ประเมิน' : 'Assessment coverage',
          { exact: true }
        )
      ).toBeVisible()
      await expect(
        page
          .getByText(
            language === 'th'
              ? 'เทียบกับท่านั่งอ้างอิงได้'
              : 'Compared with reference seated alignment',
            { exact: true }
          )
          .locator('..')
      ).toContainText('1:00')
      await expect(
        page
          .getByText(
            language === 'th'
              ? 'ระยะเวลาที่ยังประเมินไม่ได้'
              : 'Unassessed Time',
            { exact: true }
          )
          .locator('..')
      ).toContainText('0:15')
      await expect(
        page
          .getByText(
            language === 'th' ? 'ไม่มีข้อมูลที่สังเกตได้' : 'Unobserved time',
            { exact: true }
          )
          .locator('..')
      ).toContainText('0:45')
    })
  })
}
