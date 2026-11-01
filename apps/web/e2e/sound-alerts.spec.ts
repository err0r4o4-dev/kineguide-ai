import { expect, test } from '@playwright/test'

test('sound alert controls sync across live session and settings without overflow at 320/768/1024/1440px', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    const spokenTexts: string[] = []
    Object.defineProperty(window, '__kineguideSpokenTexts', {
      configurable: true,
      value: spokenTexts
    })
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: () => {},
        getVoices: () => [{ lang: 'th-TH', name: 'Thai Test Voice' }],
        speak: (utterance: { text: string }) => {
          spokenTexts.push(utterance.text)
        }
      }
    })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class FakeUtterance {
        text: string
        lang = ''
        volume = 1
        rate = 1
        pitch = 1
        voice: unknown = null
        onerror: unknown = null
        onend: unknown = null
        constructor(text: string) {
          this.text = text
        }
      }
    })
  })

  const user = {
    id: '3356dcec-f826-41f1-8dba-f434b74e75c8',
    email: 'student@example.com',
    display_name: 'ผู้ใช้ทดสอบ',
    created_at: '2026-08-24T12:00:00Z'
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
      await route.fulfill({
        status: 200,
        json: {
          access_token: 'synthetic-access-token',
          expires_in: 900,
          user
        }
      })
      return
    }
    if (url.endsWith('/consents/current')) {
      await route.fulfill({ json: { consent } })
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
    if (url.endsWith('/sessions/session-1')) {
      await route.fulfill({
        json: {
          session: {
            id: 'session-1',
            activity_id: 'seated-posture-demo',
            activity_kind: 'posture_monitoring',
            measurement_mode: 'camera',
            camera_used: true,
            status: 'active',
            elapsed_seconds: 0,
            completed_cycles: null,
            posture_summary: null,
            started_at: '2026-08-28T09:00:00Z',
            completed_at: null,
            retention_until: '2027-08-28T09:00:00Z'
          }
        }
      })
      return
    }
    await route.abort()
  })

  await page.goto('/app/settings')
  await expect(
    page.getByRole('heading', { name: 'การแจ้งเตือนด้วยเสียง' })
  ).toBeVisible()

  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  }

  await page.getByRole('button', { name: 'ทดลองฟังเสียง' }).click()
  expect(
    await page.evaluate(
      () =>
        (
          window as unknown as {
            __kineguideSpokenTexts: string[]
          }
        ).__kineguideSpokenTexts.length
    )
  ).toBe(1)

  await page.goto('/app/sessions/session-1/live')
  const liveToggle = page.getByRole('button', { name: 'เสียงเตือน: เปิด' })
  await expect(liveToggle).toHaveAttribute('aria-pressed', 'true')

  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  }

  await liveToggle.focus()
  await expect(liveToggle).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')

  await expect(
    page.getByRole('button', { name: 'เสียงเตือน: ปิด' })
  ).toHaveAttribute('aria-pressed', 'false')

  await page.goto('/app/settings')
  await expect(
    page.getByRole('checkbox', { name: /เปิดใช้เสียงแจ้งเตือนระหว่างเซสชัน/ })
  ).not.toBeChecked()
})
