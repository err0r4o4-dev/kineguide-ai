import { expect, test } from '@playwright/test'

test('new user completes consent and structured onboarding', async ({
  page
}) => {
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
          policy_version: 'prototype-v1',
          camera_processing: true,
          session_summary_storage: true,
          research_use: false,
          accepted_at: '2026-08-24T12:01:00Z',
          revoked_at: null
        }
      })
      return
    }
    if (url.endsWith('/assessments') && method === 'POST') {
      await route.fulfill({
        status: 201,
        json: {
          id: '1f9cc536-e3b5-4a6f-b416-6acd218d0be8',
          concern_area: 'prefer_not_to_say',
          duration_band: 'unsure',
          daily_impact: 'prefer_not_to_say',
          goal: 'camera_demo',
          status: 'captured_not_evaluated',
          created_at: '2026-08-24T12:02:00Z',
          retention_until: '2027-08-24T12:02:00Z'
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
          category: 'lower_body',
          review_status: 'pending_clinical_review'
        },
        {
          slug: 'seated-knee-demo',
          title_th: 'สาธิตการเหยียดเข่าขณะนั่ง',
          title_en: 'Seated knee movement demo',
          category: 'lower_body',
          review_status: 'pending_clinical_review'
        },
        {
          slug: 'shoulder-movement-demo',
          title_th: 'สาธิตการเคลื่อนไหวหัวไหล่',
          title_en: 'Shoulder movement demo',
          category: 'upper_body',
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
    await route.abort()
  })

  await page.goto('/')
  await page.getByRole('link', { name: 'เริ่มใช้งาน' }).click()
  await page.getByLabel('ชื่อที่ใช้แสดง').fill('ผู้ใช้ทดสอบ')
  await page.getByLabel('อีเมล').fill('student@example.com')
  await page.getByLabel('รหัสผ่าน').fill('safe-demo-password')
  await page.getByRole('button', { name: 'สมัครสมาชิก' }).click()

  await expect(
    page.getByRole('heading', { name: 'การอนุญาตใช้กล้องและข้อมูลการฝึก' })
  ).toBeVisible()
  await page
    .getByLabel('ยอมรับการประมวลผลกล้องและการเก็บ session summary')
    .check()
  await page.getByRole('button', { name: 'ยอมรับและดำเนินการต่อ' }).click()

  await page.getByLabel('ไม่ประสงค์ระบุ').first().check()
  await page.getByRole('button', { name: 'ส่งคำตอบ' }).click()
  await page.getByLabel('ไม่แน่ใจ').check()
  await page.getByRole('button', { name: 'ส่งคำตอบ' }).click()
  await page.getByLabel('ไม่ประสงค์ระบุ').check()
  await page.getByRole('button', { name: 'ส่งคำตอบ' }).click()
  await page.getByLabel('ทดลองกล้องและการเคลื่อนไหว').check()
  await page.getByRole('button', { name: 'ตรวจทานคำตอบ' }).click()
  await page.getByRole('button', { name: 'บันทึกและดูแผน' }).click()

  await expect(
    page.getByRole('heading', { name: 'แผนกิจกรรมสาธิต 7 วัน' })
  ).toBeVisible()
  await expect(page.getByText('ไม่ได้ปรับตามอาการของคุณ')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'ดูรายละเอียดกิจกรรม' }).first()
  ).toHaveAttribute('href', '/app/exercises/sit-to-stand-demo')

  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(
      page.getByRole('heading', { name: 'แผนกิจกรรมสาธิต 7 วัน' })
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  }

  await page.getByRole('link', { name: 'หน้าหลัก' }).click()
  await expect(
    page.getByRole('link', { name: 'เริ่มคุยกับ AI' })
  ).toHaveAttribute('href', '/app/assessment')
  await expect(
    page.getByRole('link', { name: 'คุยกับ AI', exact: true })
  ).toHaveAttribute('href', '/app/assessment')
  await page.getByRole('link', { name: 'เริ่มคุยกับ AI' }).click()
  await expect(
    page.getByRole('heading', { name: 'คุยกับ KineGuide AI' })
  ).toBeVisible()
})
