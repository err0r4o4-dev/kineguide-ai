import { expect, test } from '@playwright/test'

test('new user completes registration and consent', async ({ page }) => {
  await page.route('http://localhost:8080/v1/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    if (url.endsWith('/auth/refresh')) {
      await route.fulfill({
        status: 401,
        json: { error: { code: 'REFRESH_REQUIRED' } }
      })
      return
    }
    if (url.endsWith('/auth/register')) {
      await route.fulfill({
        status: 201,
        json: {
          access_token: 'synthetic-access-token',
          expires_in: 900,
          user: {
            id: '3356dcec-f826-41f1-8dba-f434b74e75c8',
            email: 'student@example.com',
            display_name: 'ผู้ใช้ทดสอบ',
            created_at: '2026-08-24T12:00:00Z'
          }
        }
      })
      return
    }
    if (url.endsWith('/consents') && method === 'POST') {
      await route.fulfill({
        status: 201,
        json: {
          id: 'a91da3f1-00ae-4d7c-8ea3-b4e9f2c20d90',
          policy_version: 'prototype-v3',
          camera_processing: true,
          session_summary_storage: true,
          ai_chat_storage: true,
          research_use: false,
          accepted_at: '2026-08-24T12:01:00Z',
          revoked_at: null
        }
      })
      return
    }
    if (url.endsWith('/consents/current') && method === 'GET') {
      await route.fulfill({
        json: {
          consent: {
            id: 'a91da3f1-00ae-4d7c-8ea3-b4e9f2c20d90',
            policy_version: 'prototype-v3',
            camera_processing: true,
            session_summary_storage: true,
            ai_chat_storage: true,
            research_use: false,
            accepted_at: '2026-08-24T12:01:00Z',
            revoked_at: null
          }
        }
      })
      return
    }
    if (url.endsWith('/health-profile') && method === 'GET') {
      await route.fulfill({
        json: { profile: null }
      })
      return
    }
    if (url.endsWith('/health-profile') && method === 'PUT') {
      await route.fulfill({
        status: 200,
        json: {
          id: '1f9cc536-e3b5-4a6f-b416-6acd218d0be8',
          birth_date: '2000-01-02',
          sex: 'unspecified',
          height_cm: 170,
          weight_kg: 60,
          track_weight: true,
          care_areas: ['general_mobility'],
          recent_injury: false,
          clinician_managed: false,
          assistive_device: 'none',
          warning_signs: ['none'],
          goals: ['strength'],
          activity_level: 'moderate',
          preferred_time: 'morning',
          equipment: ['none'],
          camera_preference: 'front',
          activity_notifications: true,
          notes: '',
          status: 'captured_not_evaluated',
          consent_version: 'health-profile-v1',
          consented_at: '2026-08-24T12:02:00Z',
          created_at: '2026-08-24T12:02:00Z',
          updated_at: '2026-08-24T12:02:00Z',
          retention_until: '2027-08-24T12:02:00Z'
        }
      })
      return
    }
    if (url.endsWith('/activities')) {
      await route.fulfill({
        json: {
          activities: [
            {
              slug: 'seated-posture-demo',
              title_th: 'สาธิตท่านั่ง',
              title_en: 'Seated posture demonstration',
              category: 'sitting',
              kind: 'static_posture',
              required_view: 'side',
              measurement_mode: 'hold_duration',
              review_status: 'pending_clinical_review',
              demo_only: true,
              not_for_clinical_use: true,
              analysis_available: false
            }
          ]
        }
      })
      return
    }
    if (url.endsWith('/activity-plan')) {
      const exercises = [
        {
          slug: 'sit-to-stand-demo',
          title_th: 'สาธิตการลุกนั่งจากเก้าอี้',
          title_en: 'Sit-to-stand movement demo',
          category: 'lower_back',
          review_status: 'pending_clinical_review'
        },
        {
          slug: 'seated-knee-demo',
          title_th: 'สาธิตการเหยียดเข่าขณะนั่ง',
          title_en: 'Seated knee movement demo',
          category: 'knee',
          review_status: 'pending_clinical_review'
        },
        {
          slug: 'shoulder-movement-demo',
          title_th: 'สาธิตการเคลื่อนไหวหัวไหล่',
          title_en: 'Shoulder movement demo',
          category: 'shoulder',
          review_status: 'pending_clinical_review'
        }
      ]
      await route.fulfill({
        json: {
          plan_type: 'demo_exploration',
          review_status: 'pending_clinical_review',
          personalized: false,
          duration_days: 7,
          days: Array.from({ length: 7 }, (_, index) => ({
            day: index + 1,
            exercises
          }))
        }
      })
      return
    }
    if (url.endsWith('/dashboard')) {
      await route.fulfill({
        json: {
          completed_sessions: 0,
          current_streak: 0,
          total_seconds: 0,
          recent_sessions: []
        }
      })
      return
    }
    if (url.endsWith('/conversations') && method === 'GET') {
      await route.fulfill({ json: { conversations: [] } })
      return
    }
    if (url.endsWith('/conversations') && method === 'POST') {
      await route.fulfill({
        status: 201,
        json: {
          id: '864cb7ae-64dd-4db4-8200-12b44e5bcab1',
          title: 'บทสนทนาใหม่',
          locale: 'th',
          created_at: '2026-08-24T12:03:00Z',
          updated_at: '2026-08-24T12:03:00Z',
          retention_policy: 'until_deleted'
        }
      })
      return
    }
    if (
      url.endsWith(
        '/conversations/864cb7ae-64dd-4db4-8200-12b44e5bcab1/messages'
      )
    ) {
      if (method === 'GET') {
        await route.fulfill({ json: { messages: [] } })
      } else {
        await route.fulfill({
          status: 201,
          json: {
            messages: [
              {
                id: '55eaef83-72c6-4180-a442-49f6cb698c12',
                conversation_id: '864cb7ae-64dd-4db4-8200-12b44e5bcab1',
                role: 'user',
                content: 'สวัสดี',
                created_at: '2026-08-24T12:04:00Z'
              },
              {
                id: '1eb4cb23-7615-46d6-a702-fe557578b1d6',
                conversation_id: '864cb7ae-64dd-4db4-8200-12b44e5bcab1',
                role: 'assistant',
                content: 'คำตอบจำลองที่ปลอดภัย',
                created_at: '2026-08-24T12:04:01Z'
              }
            ]
          }
        })
      }
      return
    }
    await route.abort()
  })

  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'สิ่งที่คุณทำได้ใน KineGuide AI' })
  ).toBeVisible()
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  }
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.getByRole('link', { name: 'เริ่มต้นใช้งาน', exact: true }).click()
  await page.getByLabel('ชื่อที่ใช้แสดง').fill('ผู้ใช้ทดสอบ')
  await page.getByLabel('อีเมล').fill('student@example.com')
  await page.getByLabel('รหัสผ่าน').fill('safe-demo-password')
  await page.getByRole('button', { name: 'สมัครสมาชิก' }).click()

  await expect(
    page.getByRole('heading', { name: 'การอนุญาตใช้กล้องและข้อมูล' })
  ).toBeVisible()
  await page
    .getByLabel('ยอมรับการประมวลผลกล้องและการเก็บ session summary')
    .check()
  await page.getByRole('button', { name: 'ยอมรับและดำเนินการต่อ' }).click()

  await expect(
    page.getByRole('heading', { name: 'สวัสดี ผู้ใช้ทดสอบ' })
  ).toBeVisible()
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  }
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.getByRole('link', { name: 'เริ่มตรวจท่าทาง', exact: true }).click()

  await expect(page).toHaveURL('/app/monitor')
  await expect(
    page.getByRole('heading', { name: 'ตั้งค่ากล้องสำหรับโหมดนั่ง' })
  ).toBeVisible()
  await expect(
    page.getByLabel('ฉันจะใช้กล้องขณะนั่งและจัดเฟรมให้เห็นจุดอ้างอิงตามคำแนะนำ')
  ).not.toBeChecked()
  await expect(
    page.getByRole('button', { name: 'ตรวจความพร้อมของกล้อง' })
  ).toBeDisabled()

  await page.getByRole('link', { name: 'หน้าแรก' }).click()
  await expect(
    page.getByRole('link', { name: 'เริ่มตรวจท่าทาง', exact: true })
  ).toHaveAttribute('href', '/app/monitor')
  await expect(
    page.getByRole('navigation', { name: 'เมนูหลัก' }).getByRole('link', {
      name: 'ผู้ช่วย KineGuide AI',
      exact: true
    })
  ).toHaveAttribute('href', '/app/chat')
})

test('login, hard refresh, and every authenticated navigation target stay consistent', async ({
  page
}) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  let signedIn = false
  let dashboardFails = false
  let refreshRequests = 0
  const user = {
    id: '3356dcec-f826-41f1-8dba-f434b74e75c8',
    email: 'student@example.com',
    display_name: 'ผู้ใช้ทดสอบ',
    created_at: '2026-08-24T12:00:00Z'
  }
  const authResponse = {
    access_token: 'synthetic-access-token',
    expires_in: 900,
    user
  }
  const consent = {
    id: 'a91da3f1-00ae-4d7c-8ea3-b4e9f2c20d90',
    policy_version: 'prototype-v3',
    camera_processing: true,
    session_summary_storage: true,
    ai_chat_storage: true,
    research_use: false,
    accepted_at: '2026-08-24T12:01:00Z',
    revoked_at: null
  }
  await page.route('http://localhost:8080/v1/**', async (route) => {
    const url = route.request().url()
    if (url.endsWith('/auth/refresh')) {
      refreshRequests += 1
      await route.fulfill(
        signedIn
          ? { status: 200, json: authResponse }
          : {
              status: 401,
              json: { error: { code: 'REFRESH_REQUIRED' } }
            }
      )
      return
    }
    if (url.endsWith('/auth/login')) {
      signedIn = true
      await route.fulfill({ status: 200, json: authResponse })
      return
    }
    if (url.endsWith('/auth/providers')) {
      await route.fulfill({ json: { providers: [] } })
      return
    }
    if (url.endsWith('/me/auth-identities')) {
      await route.fulfill({ json: { identities: [] } })
      return
    }
    if (url.endsWith('/me')) {
      await route.fulfill({ json: user })
      return
    }
    if (url.endsWith('/consents/current')) {
      await route.fulfill({ json: { consent } })
      return
    }
    if (url.endsWith('/conversations')) {
      await route.fulfill({ json: { conversations: [] } })
      return
    }
    if (url.endsWith('/dashboard')) {
      if (dashboardFails) {
        await route.fulfill({
          status: 503,
          json: {
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Synthetic dashboard failure'
            }
          }
        })
        return
      }
      await route.fulfill({
        json: {
          completed_sessions: 0,
          current_streak: 0,
          total_seconds: 0,
          recent_sessions: []
        }
      })
      return
    }
    if (url.endsWith('/activity-plan')) {
      await route.fulfill({
        json: {
          plan_type: 'demo_exploration',
          review_status: 'pending_clinical_review',
          personalized: false,
          duration_days: 7,
          days: []
        }
      })
      return
    }
    if (url.endsWith('/activities')) {
      await route.fulfill({ json: { activities: [] } })
      return
    }
    if (url.endsWith('/sessions')) {
      await route.fulfill({ json: { sessions: [] } })
      return
    }
    await route.abort()
  })

  await page.goto('/login')
  await page.getByLabel('อีเมล').fill('student@example.com')
  await page.getByLabel('รหัสผ่าน').fill('legacy-pass')
  runtimeErrors.length = 0
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

  await expect(page).toHaveURL('/app')
  await expect(
    page.getByRole('link', { name: 'ผู้ช่วย KineGuide AI', exact: true })
  ).toBeVisible()

  for (let reload = 0; reload < 3; reload += 1) {
    await page.reload()
    await expect(
      page.getByRole('link', { name: 'ผู้ช่วย KineGuide AI', exact: true })
    ).toBeVisible()
  }
  expect(refreshRequests).toBe(4)

  await page.setViewportSize({ width: 320, height: 900 })
  const menuButton = page.locator('button[aria-controls="app-navigation"]')
  await menuButton.click()
  await expect(menuButton).toHaveAccessibleName('ปิดเมนู')
  await expect(
    page.getByRole('link', { name: 'ผู้ช่วย KineGuide AI', exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await menuButton.click()
  await page.setViewportSize({ width: 1280, height: 900 })

  const destinations = [
    ['ผู้ช่วย KineGuide AI', '/app/chat'],
    ['ตรวจท่าทาง', '/app/monitor'],
    ['ประวัติ', '/app/history'],
    ['สถิติ', '/app/analytics'],
    ['ตั้งค่า', '/app/settings'],
    ['หน้าแรก', '/app']
  ] as const
  const primaryNavigation = page.getByRole('navigation', {
    name: 'เมนูหลัก'
  })

  for (const [name, path] of destinations) {
    await primaryNavigation.getByRole('link', { name, exact: true }).click()
    await expect(page).toHaveURL(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }

  for (const [legacyPath, destination] of [
    ['/app/activities', '/app/monitor'],
    ['/app/exercises', '/app/monitor'],
    ['/app/progress', '/app/analytics']
  ] as const) {
    await page.goto(legacyPath)
    await expect(page).toHaveURL(destination)
  }

  await page.getByRole('button', { name: 'เมนูบัญชี' }).click()
  await page.getByRole('menuitem', { name: 'โปรไฟล์' }).click()
  await expect(page).toHaveURL('/app/profile')
  await expect(
    page.getByRole('heading', { level: 1, name: 'โปรไฟล์' })
  ).toBeVisible()
  await expect(page.getByText(user.email)).toBeVisible()
  await expect(
    page.getByRole('link', { name: /ตั้งค่าและความเป็นส่วนตัว/ })
  ).toHaveAttribute('href', '/app/settings')

  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    if (width < 1024) {
      await expect(page.locator('#app-navigation')).toHaveCSS(
        'translate',
        '-100%'
      )
    }
    await expect(
      page.getByRole('heading', { name: user.display_name })
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  }
  expect(runtimeErrors).toEqual([])
  runtimeErrors.length = 0

  dashboardFails = true
  await page.goto('/app')
  await expect(
    page.getByRole('heading', { name: 'ไม่สามารถโหลดข้อมูลได้' })
  ).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'เมนูหลัก' })).toHaveCount(
    0
  )
  await expect(page.getByRole('button', { name: /^เมนูบัญชี/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'ลองอีกครั้ง' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'กลับหน้าหลัก' })).toBeVisible()
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  }
  expect(runtimeErrors.length).toBeGreaterThan(0)
  expect(runtimeErrors.every((message) => message.includes('503'))).toBe(true)

  dashboardFails = false
  await page.getByRole('button', { name: 'ลองอีกครั้ง' }).click()
  await expect(
    page.getByRole('heading', { name: 'สวัสดี ผู้ใช้ทดสอบ' })
  ).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'เมนูหลัก' })).toBeVisible()
})
